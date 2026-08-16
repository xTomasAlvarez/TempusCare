using Microsoft.EntityFrameworkCore;
using TempusCare.Api.Application.DTOs;
using TempusCare.Api.Application.Exceptions;
using TempusCare.Api.Domain.Entities;
using TempusCare.Api.Infrastructure.Data;

namespace TempusCare.Api.Application.Services;

public class EstudioService : IEstudioService
{
    private readonly TempusCareDbContext _db;
    private readonly ILogger<EstudioService> _logger;

    public EstudioService(TempusCareDbContext db, ILogger<EstudioService> logger)
    {
        _db = db;
        _logger = logger;
    }

    public async Task<EstudioResponseDto> AltaEstudioAsync(AltaEstudioDto dto)
    {
        _logger.LogInformation("Creando nuevo estudio en el catálogo: {Nombre}", dto.Nombre);

        if (await _db.Estudios.AnyAsync(e => e.Nombre == dto.Nombre))
        {
            _logger.LogWarning("El estudio {Nombre} ya existe en el catálogo", dto.Nombre);
            throw new ConflictException($"Ya existe un estudio con el nombre '{dto.Nombre}'.");
        }

        var est = new Estudio
        {
            Nombre = dto.Nombre,
            Descripcion = dto.Descripcion,
            Duracion = dto.Duracion > 0 ? dto.Duracion : 30,
            Preparacion = dto.Preparacion
        };

        _db.Estudios.Add(est);
        await _db.SaveChangesAsync();
        _logger.LogInformation("Estudio creado con ID {Id}", est.Id);

        return MapToDto(est);
    }

    public async Task<EstudioResponseDto> ModificarEstudioAsync(ModificarEstudioDto dto)
    {
        _logger.LogInformation("Modificando estudio ID {Id}", dto.Id);

        var est = await _db.Estudios.FindAsync(dto.Id);
        if (est == null)
        {
            _logger.LogWarning("Estudio ID {Id} no encontrado para modificación", dto.Id);
            throw new EstudioNotFoundException(dto.Id);
        }

        est.Nombre = dto.Nombre;
        est.Descripcion = dto.Descripcion;
        est.Duracion = dto.Duracion > 0 ? dto.Duracion : 30;
        est.Preparacion = dto.Preparacion;

        await _db.SaveChangesAsync();
        _logger.LogInformation("Estudio ID {Id} modificado con éxito", est.Id);

        return MapToDto(est);
    }

    public async Task BajaEstudioAsync(int id)
    {
        _logger.LogInformation("Eliminando estudio ID {Id}", id);

        var est = await _db.Estudios.FindAsync(id);
        if (est == null)
        {
            _logger.LogWarning("Estudio ID {Id} no encontrado para baja", id);
            throw new EstudioNotFoundException(id);
        }

        _db.Estudios.Remove(est);
        await _db.SaveChangesAsync();
        _logger.LogInformation("Estudio ID {Id} eliminado del catálogo", id);
    }

    public async Task<List<EstudioResponseDto>> ObtenerTodosAsync()
    {
        _logger.LogInformation("Listando todos los estudios");

        var lista = await _db.Estudios.ToListAsync();
        return lista.Select(e => MapToDto(e)).ToList();
    }

    public async Task<EstudioResponseDto> ObtenerPorIdAsync(int id)
    {
        _logger.LogInformation("Obteniendo estudio ID {Id}", id);

        var est = await _db.Estudios.FindAsync(id);
        if (est == null)
        {
            _logger.LogWarning("Estudio ID {Id} no encontrado", id);
            throw new EstudioNotFoundException(id);
        }

        return MapToDto(est);
    }

    private static EstudioResponseDto MapToDto(Estudio e)
    {
        return new EstudioResponseDto(
            e.Id,
            e.Nombre,
            e.Descripcion,
            e.Duracion,
            e.Preparacion
        );
    }
}
