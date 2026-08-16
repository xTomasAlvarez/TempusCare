using Microsoft.EntityFrameworkCore;
using TempusCare.Api.Application.DTOs;
using TempusCare.Api.Application.Exceptions;
using TempusCare.Api.Domain.Entities;
using TempusCare.Api.Infrastructure.Data;

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

        var inst = new Institucion
        {
            Nombre = dto.Nombre,
            Cuit = dto.Cuit,
            Email = dto.Email
        };

        _db.Instituciones.Add(inst);
        await _db.SaveChangesAsync();
        _logger.LogInformation("Institución creada con éxito. ID {Id}", inst.Id);

        return MapToDto(inst);
    }

    public async Task<InstitucionResponseDto> ModificarInstitucionAsync(ModificarInstitucionDto dto)
    {
        _logger.LogInformation("Modificando institución ID {Id}", dto.Id);

        var inst = await _db.Instituciones
            .Include(i => i.Consultorios)
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
            .ToListAsync();

        return lista.Select(i => MapToDto(i)).ToList();
    }

    public async Task<InstitucionResponseDto> ObtenerPorIdAsync(int id)
    {
        _logger.LogInformation("Obteniendo institución ID {Id}", id);

        var inst = await _db.Instituciones
            .Include(i => i.Consultorios)
            .FirstOrDefaultAsync(i => i.Id == id);

        if (inst == null)
        {
            _logger.LogWarning("Institución ID {Id} no encontrada", id);
            throw new InstitucionNotFoundException(id);
        }

        return MapToDto(inst);
    }

    private static InstitucionResponseDto MapToDto(Institucion inst)
    {
        return new InstitucionResponseDto(
            inst.Id,
            inst.Nombre,
            inst.Cuit,
            inst.Email,
            inst.Consultorios.Select(c => c.Nombre).ToList()
        );
    }
}
