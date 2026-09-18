using Microsoft.EntityFrameworkCore;
using TempusCare.Api.Application.DTOs;
using TempusCare.Api.Application.Exceptions;
using TempusCare.Api.Domain.Entities;
using TempusCare.Api.Infrastructure.Data;

using TempusCare.Api.Domain.Enums;

namespace TempusCare.Api.Application.Services;

public class InstitucionService : IInstitucionService
{
    private readonly TempusCareDbContext _db;
    private readonly ILogger<InstitucionService> _logger;

    public InstitucionService(TempusCareDbContext db, ILogger<InstitucionService> logger)
    {
        _db = db;
        _logger = logger;
    }

    public async Task<InstitucionResponseDto> AltaInstitucionAsync(AltaInstitucionDto dto)
    {
        _logger.LogInformation("Creando institución con CUIT {Cuit} y Nombre {Nombre}", dto.Cuit, dto.Nombre);

        if (await _db.Instituciones.AnyAsync(i => i.Cuit == dto.Cuit))
        {
            _logger.LogWarning("Ya existe una institución registrada con el CUIT {Cuit}", dto.Cuit);
            throw new ConflictException($"Ya existe una institución registrada con el CUIT {dto.Cuit}.");
        }

        var usuario = new Usuario
        {
            NombreUsuario = dto.Cuit,
            Contrasena = "Institucion123!",
            Mail = dto.Email,
            Rol = RolUsuario.Institucion
        };
        _db.Usuarios.Add(usuario);
        await _db.SaveChangesAsync();

        var inst = new Institucion
        {
            UsuarioId = usuario.Id,
            Nombre = dto.Nombre,
            Cuit = dto.Cuit,
            Email = dto.Email
        };

        _db.Instituciones.Add(inst);
        await _db.SaveChangesAsync();
        _logger.LogInformation("Institución creada con éxito. ID {Id}, UsuarioID {UsuarioId}", inst.Id, usuario.Id);

        return await ObtenerPorIdAsync(inst.Id);
    }

    public async Task<InstitucionResponseDto> ModificarInstitucionAsync(ModificarInstitucionDto dto)
    {
        _logger.LogInformation("Modificando institución ID {Id}", dto.Id);

        var inst = await _db.Instituciones
            .Include(i => i.Consultorios)
            .Include(i => i.Asistentes)
            .FirstOrDefaultAsync(i => i.Id == dto.Id);

        if (inst == null)
        {
            _logger.LogWarning("Institución ID {Id} no encontrada", dto.Id);
            throw new InstitucionNotFoundException(dto.Id);
        }

        inst.Nombre = dto.Nombre;
        inst.Cuit = dto.Cuit;
        inst.Email = dto.Email;

        await _db.SaveChangesAsync();
        _logger.LogInformation("Institución ID {Id} modificada correctamente", inst.Id);

        return MapToDto(inst);
    }

    public async Task BajaInstitucionAsync(int id)
    {
        _logger.LogInformation("Eliminando institución ID {Id}", id);

        var inst = await _db.Instituciones.FirstOrDefaultAsync(i => i.Id == id);
        if (inst == null)
        {
            _logger.LogWarning("Institución ID {Id} no encontrada para baja", id);
            throw new InstitucionNotFoundException(id);
        }

        _db.Instituciones.Remove(inst);
        await _db.SaveChangesAsync();
        _logger.LogInformation("Institución ID {Id} eliminada", id);
    }

    public async Task<List<InstitucionResponseDto>> ObtenerTodasAsync()
    {
        _logger.LogInformation("Listando todas las instituciones");

        var lista = await _db.Instituciones
            .Include(i => i.Consultorios)
            .Include(i => i.Asistentes)
            .ToListAsync();

        return lista.Select(i => MapToDto(i)).ToList();
    }

    public async Task<InstitucionResponseDto> ObtenerPorIdAsync(int id)
    {
        _logger.LogInformation("Obteniendo institución ID {Id}", id);

        var inst = await _db.Instituciones
            .Include(i => i.Consultorios)
            .Include(i => i.Asistentes)
            .FirstOrDefaultAsync(i => i.Id == id);

        if (inst == null)
        {
            _logger.LogWarning("Institución ID {Id} no encontrada", id);
            throw new InstitucionNotFoundException(id);
        }

        return MapToDto(inst);
    }

    public async Task<List<AsistenteResponseDto>> ObtenerAsistentesInstitucionAsync(int id)
    {
        _logger.LogInformation("Listando asistentes de la institución ID {Id}", id);
        var inst = await _db.Instituciones.FirstOrDefaultAsync(i => i.Id == id);
        if (inst == null) throw new InstitucionNotFoundException(id);

        var asistentes = await _db.Asistentes
            .Include(a => a.Direccion)
            .Include(a => a.Institucion)
            .Where(a => a.InstitucionId == id)
            .ToListAsync();

        return asistentes.Select(a => new AsistenteResponseDto(
            a.Cuil,
            a.Nombre,
            a.Apellido,
            a.FechaNacimiento,
            a.Telefono,
            a.Genero,
            a.Direccion != null ? $"{a.Direccion.Calle} {a.Direccion.Nro}, {a.Direccion.Localidad}, {a.Direccion.Provincia}" : null,
            a.InstitucionId,
            a.Institucion?.Nombre
        )).ToList();
    }

    public async Task<List<ConsultorioResponseDto>> ObtenerConsultoriosInstitucionAsync(int id)
    {
        _logger.LogInformation("Listando consultorios de la institución ID {Id}", id);
        var inst = await _db.Instituciones.FirstOrDefaultAsync(i => i.Id == id);
        if (inst == null) throw new InstitucionNotFoundException(id);

        var consultorios = await _db.Consultorios
            .Include(c => c.Institucion)
            .Include(c => c.Direccion)
            .Include(c => c.Profesionales).ThenInclude(p => p.Profesional)
            .Where(c => c.InstitucionId == id)
            .ToListAsync();

        return consultorios.Select(c => new ConsultorioResponseDto(
            c.Cuit,
            c.Nombre,
            c.Email,
            c.Telefono,
            c.NivelAccesibilidad,
            c.Institucion?.Nombre,
            c.Direccion != null ? $"{c.Direccion.Calle} {c.Direccion.Nro}, {c.Direccion.Localidad}, {c.Direccion.Provincia}" : "",
            c.Profesionales.Select(p => $"{p.Profesional?.Nombre} {p.Profesional?.Apellido}").ToList()
        )).ToList();
    }

    private static InstitucionResponseDto MapToDto(Institucion inst)
    {
        return new InstitucionResponseDto(
            inst.Id,
            inst.UsuarioId,
            inst.Nombre,
            inst.Cuit,
            inst.Email,
            inst.Consultorios.Select(c => c.Nombre).ToList(),
            inst.Asistentes.Select(a => $"{a.Nombre} {a.Apellido}").ToList()
        );
    }
}
