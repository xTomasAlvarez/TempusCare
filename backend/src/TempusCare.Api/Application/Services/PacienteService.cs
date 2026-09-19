using Microsoft.EntityFrameworkCore;
using TempusCare.Api.Application.DTOs;
using TempusCare.Api.Application.Exceptions;
using TempusCare.Api.Domain.Entities;
using TempusCare.Api.Domain.Enums;
using TempusCare.Api.Infrastructure.Data;

namespace TempusCare.Api.Application.Services;

public class PacienteService : IPacienteService
{
    private readonly TempusCareDbContext _db;
    private readonly ILogger<PacienteService> _logger;

    public PacienteService(TempusCareDbContext db, ILogger<PacienteService> logger)
    {
        _db = db;
        _logger = logger;
    }

    public async Task<PacientePerfilResponseDto> AltaPerfilAsync(AltaPerfilPacienteDto dto)
    {
        _logger.LogInformation("Registrando nuevo perfil de paciente con CUIL {Cuil}", dto.Cuil);

        if (await _db.Pacientes.AnyAsync(p => p.Cuil == dto.Cuil))
        {
            _logger.LogWarning("El paciente con CUIL {Cuil} ya se encuentra registrado", dto.Cuil);
            throw new ConflictException($"Paciente con CUIL {dto.Cuil} ya está registrado.");
        }

        var usuario = new Usuario
        {
            NombreUsuario = dto.Cuil,
            Contrasena = "Paciente123!",
            Mail = $"{dto.Cuil}@paciente.com",
            Rol = RolUsuario.Paciente
        };
        _db.Usuarios.Add(usuario);
        await _db.SaveChangesAsync();

        Direccion? direccion = null;
        if (!string.IsNullOrEmpty(dto.Calle))
        {
            direccion = new Direccion
            {
                Calle = dto.Calle,
                Nro = dto.Nro ?? "",
                Depto = dto.Depto,
                Localidad = dto.Localidad ?? "San Miguel de Tucumán",
                Provincia = dto.Provincia ?? "Tucumán",
                CodPostal = dto.CodPostal ?? "4000"
            };
            _db.Direcciones.Add(direccion);
            await _db.SaveChangesAsync();
        }

        var pac = new Paciente
        {
            Cuil = dto.Cuil,
            UsuarioId = usuario.Id,
            Nombre = dto.Nombre,
            Apellido = dto.Apellido,
            FechaNacimiento = dto.FecNac,
            Genero = dto.Genero,
            Telefono = dto.Telefono,
            DireccionId = direccion?.Id
        };
        _db.Pacientes.Add(pac);

        if (dto.ObrasSocialesIds != null)
        {
            foreach (var osId in dto.ObrasSocialesIds)
            {
                pac.ObrasSociales.Add(new PacienteObraSocial { PacienteCuil = pac.Cuil, ObraSocialId = osId });
            }
        }

        await _db.SaveChangesAsync();
        _logger.LogInformation("Perfil de paciente creado con éxito para CUIL {Cuil}", pac.Cuil);

        return await ObtenerPerfilAsync(pac.Cuil);
    }

    public async Task<PacientePerfilResponseDto> ModificarPerfilAsync(ModificacionPerfilPacienteDto dto)
    {
        _logger.LogInformation("Modificando perfil de paciente con CUIL {Cuil}", dto.Cuil);

        var pac = await _db.Pacientes
            .Include(p => p.Direccion)
            .Include(p => p.ObrasSociales)
            .FirstOrDefaultAsync(p => p.Cuil == dto.Cuil);

        if (pac == null)
        {
            _logger.LogWarning("Paciente con CUIL {Cuil} no encontrado para modificación", dto.Cuil);
            throw new PacienteNotFoundException(dto.Cuil);
        }

        pac.Nombre = dto.Nombre;
        pac.Apellido = dto.Apellido;
        pac.FechaNacimiento = dto.FecNac;
        pac.Genero = dto.Genero;
        pac.Telefono = dto.Telefono;

        if (pac.Direccion != null)
        {
            pac.Direccion.Calle = dto.Calle ?? pac.Direccion.Calle;
            pac.Direccion.Nro = dto.Nro ?? pac.Direccion.Nro;
            pac.Direccion.Depto = dto.Depto ?? pac.Direccion.Depto;
            pac.Direccion.Localidad = dto.Localidad ?? pac.Direccion.Localidad;
            pac.Direccion.Provincia = dto.Provincia ?? pac.Direccion.Provincia;
            pac.Direccion.CodPostal = dto.CodPostal ?? pac.Direccion.CodPostal;
        }
        else if (!string.IsNullOrEmpty(dto.Calle))
        {
            var dir = new Direccion
            {
                Calle = dto.Calle,
                Nro = dto.Nro ?? "",
                Depto = dto.Depto,
                Localidad = dto.Localidad ?? "San Miguel de Tucumán",
                Provincia = dto.Provincia ?? "Tucumán",
                CodPostal = dto.CodPostal ?? "4000"
            };
            _db.Direcciones.Add(dir);
            await _db.SaveChangesAsync();
            pac.DireccionId = dir.Id;
        }

        pac.ObrasSociales.Clear();
        if (dto.ObrasSocialesIds != null)
        {
            foreach (var osId in dto.ObrasSocialesIds)
            {
                pac.ObrasSociales.Add(new PacienteObraSocial { PacienteCuil = pac.Cuil, ObraSocialId = osId });
            }
        }

        await _db.SaveChangesAsync();
        _logger.LogInformation("Perfil de paciente actualizado para CUIL {Cuil}", pac.Cuil);

        return await ObtenerPerfilAsync(pac.Cuil);
    }

    public async Task BajaPerfilAsync(string cuil)
    {
        _logger.LogInformation("Eliminando paciente CUIL {Cuil}", cuil);

        var pac = await _db.Pacientes.FirstOrDefaultAsync(p => p.Cuil == cuil);
        if (pac == null)
        {
            _logger.LogWarning("Paciente CUIL {Cuil} no encontrado para baja", cuil);
            throw new PacienteNotFoundException(cuil);
        }

        // RNF-SEG-06: Confidencialidad y protección de datos médicos (Ley 25.326)
        var tieneHistoria = await _db.HistoriasClinicas.AnyAsync(h => h.PacienteCuil == cuil);
        if (tieneHistoria)
        {
            _logger.LogWarning("No se puede eliminar el paciente CUIL {Cuil} porque posee Historia Clínica registrada (RNF-SEG-06 / Ley 25.326).", cuil);
            throw new ConflictException("No es posible eliminar un paciente con Historia Clínica registrada para garantizar la confidencialidad e integridad médica (RNF-SEG-06 / Ley 25.326).");
        }

        _db.Pacientes.Remove(pac);
        await _db.SaveChangesAsync();
        _logger.LogInformation("Paciente CUIL {Cuil} eliminado", cuil);
    }

    public async Task<PacientePerfilResponseDto> ObtenerPerfilAsync(string cuil)
    {
        _logger.LogInformation("Obteniendo perfil de paciente CUIL {Cuil}", cuil);

        var pac = await _db.Pacientes
            .Include(p => p.Direccion)
            .Include(p => p.ObrasSociales).ThenInclude(o => o.ObraSocial)
            .FirstOrDefaultAsync(p => p.Cuil == cuil);

        if (pac == null)
        {
            _logger.LogWarning("Paciente CUIL {Cuil} no encontrado", cuil);
            throw new PacienteNotFoundException(cuil);
        }

        return MapToDto(pac);
    }

    public async Task<List<PacientePerfilResponseDto>> ObtenerTodosAsync()
    {
        _logger.LogInformation("Listando todos los pacientes");

        var lista = await _db.Pacientes
            .Include(p => p.Direccion)
            .Include(p => p.ObrasSociales).ThenInclude(o => o.ObraSocial)
            .ToListAsync();

        return lista.Select(p => MapToDto(p)).ToList();
    }

    public async Task<PacientePresencialResponseDto> RegistrarPresencialAsync(RegistroPacientePresencialDto dto)
    {
        _logger.LogInformation("Registrando paciente presencial (walk-in) con DNI {Dni}", dto.Dni);

        var dniClean = dto.Dni.Trim().Replace(".", "").Replace("-", "");

        if (string.IsNullOrWhiteSpace(dniClean))
        {
            throw new ValidationException("El DNI del paciente es obligatorio.");
        }

        if (await _db.Pacientes.AnyAsync(p => p.Cuil == dniClean))
        {
            _logger.LogWarning("El paciente con DNI {Dni} ya se encuentra registrado", dniClean);
            throw new ConflictException($"Ya existe un paciente registrado con el DNI {dniClean}.");
        }

        var provisoryEmail = !string.IsNullOrWhiteSpace(dto.Email)
            ? dto.Email.Trim().ToLower()
            : $"{dniClean}@paciente.tempuscare.com";

        var provisoryPassword = $"Tempus.{dniClean}!";

        if (await _db.Usuarios.AnyAsync(u => u.NombreUsuario == dniClean || u.Mail.ToLower() == provisoryEmail))
        {
            provisoryEmail = $"{dniClean}.{DateTime.UtcNow.Ticks % 10000}@paciente.tempuscare.com";
        }

        var usuario = new Usuario
        {
            NombreUsuario = dniClean,
            Contrasena = provisoryPassword,
            Mail = provisoryEmail,
            Rol = RolUsuario.Paciente
        };

        _db.Usuarios.Add(usuario);
        await _db.SaveChangesAsync();

        var nombreClean = dto.Nombre.Trim();
        var apellidoClean = (dto.Apellido ?? string.Empty).Trim();
        var telefonoClean = (dto.Telefono ?? string.Empty).Trim();

        var paciente = new Paciente
        {
            Cuil = dniClean,
            UsuarioId = usuario.Id,
            Nombre = nombreClean,
            Apellido = apellidoClean,
            Telefono = telefonoClean,
            FechaNacimiento = DateTime.UtcNow,
            Genero = string.Empty
        };

        _db.Pacientes.Add(paciente);

        if (dto.ObraSocialId.HasValue && dto.ObraSocialId.Value > 0)
        {
            var obraSocialExiste = await _db.ObrasSociales.AnyAsync(os => os.Id == dto.ObraSocialId.Value);
            if (obraSocialExiste)
            {
                _db.PacienteObrasSociales.Add(new PacienteObraSocial
                {
                    PacienteCuil = paciente.Cuil,
                    ObraSocialId = dto.ObraSocialId.Value
                });
            }
        }

        // Crear HistoriaClinica inicial para el paciente (RNF-SEG-06 / Ley 25.326)
        _db.HistoriasClinicas.Add(new HistoriaClinica
        {
            PacienteCuil = paciente.Cuil
        });

        await _db.SaveChangesAsync();

        _logger.LogInformation("Paciente presencial registrado exitosamente. DNI/CUIL: {Cuil}", paciente.Cuil);

        return new PacientePresencialResponseDto(
            paciente.Cuil,
            paciente.Nombre,
            paciente.Apellido,
            usuario.Mail,
            paciente.Telefono,
            provisoryPassword,
            "Paciente presencial registrado con éxito. Ya puede agendarse su cita inmediatamente."
        );
    }

    private static PacientePerfilResponseDto MapToDto(Paciente pac)
    {
        string? dirStr = pac.Direccion != null
            ? $"{pac.Direccion.Calle} {pac.Direccion.Nro}, {pac.Direccion.Localidad}, {pac.Direccion.Provincia}"
            : null;

        return new PacientePerfilResponseDto(
            pac.Cuil,
            pac.Nombre,
            pac.Apellido,
            pac.FechaNacimiento,
            pac.Genero,
            pac.Telefono,
            dirStr,
            pac.ObrasSociales.Select(o => o.ObraSocial?.Nombre ?? "").Where(s => s != "").ToList()
        );
    }
}
