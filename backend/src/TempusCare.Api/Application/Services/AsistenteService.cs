using Microsoft.EntityFrameworkCore;
using TempusCare.Api.Application.DTOs;
using TempusCare.Api.Application.Exceptions;
using TempusCare.Api.Domain.Entities;
using TempusCare.Api.Domain.Enums;
using TempusCare.Api.Infrastructure.Data;

namespace TempusCare.Api.Application.Services;

public class AsistenteService : IAsistenteService
{
    private readonly TempusCareDbContext _db;
    private readonly ILogger<AsistenteService> _logger;

    public AsistenteService(TempusCareDbContext db, ILogger<AsistenteService> logger)
    {
        _db = db;
        _logger = logger;
    }

    public async Task<AsistenteResponseDto> AltaAsistenteAsync(AltaAsistenteDto dto)
    {
        _logger.LogInformation("Registrando asistente con CUIL {Cuil}", dto.Cuil);

        if (await _db.Asistentes.AnyAsync(a => a.Cuil == dto.Cuil))
        {
            _logger.LogWarning("Asistente con CUIL {Cuil} ya registrado", dto.Cuil);
            throw new ConflictException($"Asistente con CUIL {dto.Cuil} ya está registrado.");
        }

        var usuario = new Usuario
        {
            NombreUsuario = dto.Cuil,
            Contrasena = "Asistente123!",
            Mail = $"{dto.Cuil}@asistente.com",
            Rol = RolUsuario.Asistente
        };
        _db.Usuarios.Add(usuario);
        await _db.SaveChangesAsync();

        Direccion? dir = null;
        if (!string.IsNullOrEmpty(dto.Calle))
        {
            dir = new Direccion
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
        }

        if (dto.InstitucionId.HasValue && !await _db.Instituciones.AnyAsync(i => i.Id == dto.InstitucionId.Value))
        {
            _logger.LogWarning("Institución ID {Id} no encontrada al crear asistente", dto.InstitucionId.Value);
            throw new InstitucionNotFoundException(dto.InstitucionId.Value);
        }

        var asistente = new Asistente
        {
            Cuil = dto.Cuil,
            UsuarioId = usuario.Id,
            Nombre = dto.Nombre,
            Apellido = dto.Apellido,
            FechaNacimiento = dto.FecNac,
            Telefono = dto.Telefono,
            Genero = dto.Genero,
            DireccionId = dir?.Id,
            InstitucionId = dto.InstitucionId
        };

        _db.Asistentes.Add(asistente);
        await _db.SaveChangesAsync();
        _logger.LogInformation("Asistente creado con éxito. CUIL {Cuil}", asistente.Cuil);

        return await ObtenerPorCuilAsync(asistente.Cuil);
    }

    public async Task<AsistenteResponseDto> ModificarAsistenteAsync(ModificarAsistenteDto dto)
    {
        _logger.LogInformation("Modificando asistente CUIL {Cuil}", dto.Cuil);

        var asistente = await _db.Asistentes
            .Include(a => a.Direccion)
            .FirstOrDefaultAsync(a => a.Cuil == dto.Cuil);

        if (asistente == null)
        {
            _logger.LogWarning("Asistente CUIL {Cuil} no encontrado", dto.Cuil);
            throw new AsistenteNotFoundException(dto.Cuil);
        }

        if (dto.InstitucionId.HasValue && !await _db.Instituciones.AnyAsync(i => i.Id == dto.InstitucionId.Value))
        {
            _logger.LogWarning("Institución ID {Id} no encontrada al modificar asistente", dto.InstitucionId.Value);
            throw new InstitucionNotFoundException(dto.InstitucionId.Value);
        }

        asistente.Nombre = dto.Nombre;
        asistente.Apellido = dto.Apellido;
        asistente.FechaNacimiento = dto.FecNac;
        asistente.Telefono = dto.Telefono;
        asistente.Genero = dto.Genero;
        asistente.InstitucionId = dto.InstitucionId ?? asistente.InstitucionId;

        if (asistente.Direccion != null)
        {
            asistente.Direccion.Calle = dto.Calle ?? asistente.Direccion.Calle;
            asistente.Direccion.Nro = dto.Nro ?? asistente.Direccion.Nro;
            asistente.Direccion.Depto = dto.Depto ?? asistente.Direccion.Depto;
            asistente.Direccion.Localidad = dto.Localidad ?? asistente.Direccion.Localidad;
            asistente.Direccion.Provincia = dto.Provincia ?? asistente.Direccion.Provincia;
            asistente.Direccion.CodPostal = dto.CodPostal ?? asistente.Direccion.CodPostal;
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
            asistente.DireccionId = dir.Id;
        }

        await _db.SaveChangesAsync();
        _logger.LogInformation("Asistente CUIL {Cuil} modificado con éxito", asistente.Cuil);

        return await ObtenerPorCuilAsync(asistente.Cuil);
    }

    public async Task BajaAsistenteAsync(string cuil)
    {
        _logger.LogInformation("Eliminando asistente CUIL {Cuil}", cuil);

        var asistente = await _db.Asistentes.FirstOrDefaultAsync(a => a.Cuil == cuil);
        if (asistente == null)
        {
            _logger.LogWarning("Asistente CUIL {Cuil} no encontrado para baja", cuil);
            throw new AsistenteNotFoundException(cuil);
        }

        _db.Asistentes.Remove(asistente);
        await _db.SaveChangesAsync();
        _logger.LogInformation("Asistente CUIL {Cuil} eliminado", cuil);
    }

    public async Task<AsistenteResponseDto> ObtenerPorCuilAsync(string cuil)
    {
        _logger.LogInformation("Obteniendo asistente CUIL {Cuil}", cuil);

        var asistente = await _db.Asistentes
            .Include(a => a.Direccion)
            .Include(a => a.Institucion)
            .FirstOrDefaultAsync(a => a.Cuil == cuil);

        if (asistente == null)
        {
            _logger.LogWarning("Asistente CUIL {Cuil} no encontrado", cuil);
            throw new AsistenteNotFoundException(cuil);
        }

        return MapToDto(asistente);
    }

    public async Task<List<AsistenteResponseDto>> ObtenerTodosAsync()
    {
        _logger.LogInformation("Listando todos los asistentes");

        var lista = await _db.Asistentes
            .Include(a => a.Direccion)
            .Include(a => a.Institucion)
            .ToListAsync();

        return lista.Select(a => MapToDto(a)).ToList();
    }

    public async Task AsignarAgendaAsync(string asistenteCuil, int agendaId)
    {
        _logger.LogInformation("Asignando permiso de agenda ID {AgendaId} al asistente CUIL {Cuil}", agendaId, asistenteCuil);

        if (!await _db.Asistentes.AnyAsync(a => a.Cuil == asistenteCuil))
            throw new AsistenteNotFoundException(asistenteCuil);

        if (!await _db.Agendas.AnyAsync(a => a.Id == agendaId))
            throw new AgendaNotFoundException(agendaId);

        bool existe = await _db.AsistenteAgendas.AnyAsync(aa => aa.AsistenteCuil == asistenteCuil && aa.AgendaId == agendaId);
        if (!existe)
        {
            _db.AsistenteAgendas.Add(new AsistenteAgenda
            {
                AsistenteCuil = asistenteCuil,
                AgendaId = agendaId
            });
            await _db.SaveChangesAsync();
            _logger.LogInformation("Permiso de agenda ID {AgendaId} asignado a asistente CUIL {Cuil}", agendaId, asistenteCuil);
        }
    }

    public async Task RemoverAgendaAsync(string asistenteCuil, int agendaId)
    {
        _logger.LogInformation("Removiendo permiso de agenda ID {AgendaId} al asistente CUIL {Cuil}", agendaId, asistenteCuil);

        if (!await _db.Asistentes.AnyAsync(a => a.Cuil == asistenteCuil))
            throw new AsistenteNotFoundException(asistenteCuil);

        var relacion = await _db.AsistenteAgendas.FirstOrDefaultAsync(aa => aa.AsistenteCuil == asistenteCuil && aa.AgendaId == agendaId);
        if (relacion != null)
        {
            _db.AsistenteAgendas.Remove(relacion);
            await _db.SaveChangesAsync();
            _logger.LogInformation("Permiso de agenda ID {AgendaId} removido del asistente CUIL {Cuil}", agendaId, asistenteCuil);
        }
    }

    public async Task<List<AgendaResponseDto>> ObtenerAgendasAsignadasAsync(string asistenteCuil)
    {
        _logger.LogInformation("Obteniendo agendas asignadas al asistente CUIL {Cuil}", asistenteCuil);

        if (!await _db.Asistentes.AnyAsync(a => a.Cuil == asistenteCuil))
            throw new AsistenteNotFoundException(asistenteCuil);

        var agendas = await _db.AsistenteAgendas
            .Where(aa => aa.AsistenteCuil == asistenteCuil)
            .Include(aa => aa.Agenda).ThenInclude(a => a!.Profesional)
            .Include(aa => aa.Agenda).ThenInclude(a => a!.Consultorio)
            .Include(aa => aa.Agenda).ThenInclude(a => a!.Turnos)
            .Select(aa => aa.Agenda)
            .ToListAsync();

        return agendas.Where(a => a != null).Select(a => new AgendaResponseDto(
            a!.Id,
            a.ProfesionalCuil,
            $"{a.Profesional?.Nombre} {a.Profesional?.Apellido}",
            a.Profesional?.Matricula ?? "",
            a.ConsultorioCuit,
            a.Consultorio?.Nombre ?? "",
            a.Dia,
            a.Mes,
            a.Anio,
            a.HoraEntrada,
            a.HoraSalida,
            a.Turnos.Count
        )).ToList();
    }

    public async Task<bool> ValidarPermisoAsistenteAgendaAsync(string asistenteCuil, int agendaId)
    {
        return await _db.AsistenteAgendas.AnyAsync(aa => aa.AsistenteCuil == asistenteCuil && aa.AgendaId == agendaId);
    }

    private static AsistenteResponseDto MapToDto(Asistente a)
    {
        string? dirStr = a.Direccion != null
            ? $"{a.Direccion.Calle} {a.Direccion.Nro}, {a.Direccion.Localidad}, {a.Direccion.Provincia}"
            : null;

        return new AsistenteResponseDto(
            a.Cuil,
            a.Nombre,
            a.Apellido,
            a.FechaNacimiento,
            a.Telefono,
            a.Genero,
            dirStr,
            a.InstitucionId,
            a.Institucion?.Nombre
        );
    }
}
