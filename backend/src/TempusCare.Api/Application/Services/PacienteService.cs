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
