using Microsoft.EntityFrameworkCore;
using TempusCare.Api.Application.DTOs;
using TempusCare.Api.Application.Exceptions;
using TempusCare.Api.Domain.Entities;
using TempusCare.Api.Infrastructure.Data;

namespace TempusCare.Api.Application.Services;

public class EspecialidadService : IEspecialidadService
{
    private readonly TempusCareDbContext _db;
    private readonly ILogger<EspecialidadService> _logger;

    public EspecialidadService(TempusCareDbContext db, ILogger<EspecialidadService> logger)
    {
        _db = db;
        _logger = logger;
    }

    public async Task<EspecialidadDto> AltaEspecialidadAsync(AltaEspecialidadDto dto)
    {
        _logger.LogInformation("Creando especialidad: {Nombre}", dto.Nombre);

        if (await _db.Especialidades.AnyAsync(e => e.Nombre == dto.Nombre))
        {
            _logger.LogWarning("Especialidad {Nombre} ya existe", dto.Nombre);
            throw new ConflictException($"La especialidad '{dto.Nombre}' ya existe.");
        }

        var esp = new Especialidad { Nombre = dto.Nombre, Descripcion = dto.Descripcion };
        _db.Especialidades.Add(esp);
        await _db.SaveChangesAsync();
        _logger.LogInformation("Especialidad creada con ID {Id}", esp.Id);

        return new EspecialidadDto(esp.Id, esp.Nombre, esp.Descripcion);
    }

    public async Task<EspecialidadDto> ModificarEspecialidadAsync(ModificarEspecialidadDto dto)
    {
        _logger.LogInformation("Modificando especialidad ID {Id}", dto.Id);

        var esp = await _db.Especialidades.FindAsync(dto.Id);
        if (esp == null)
        {
            _logger.LogWarning("Especialidad ID {Id} no encontrada", dto.Id);
            throw new EspecialidadNotFoundException(dto.Id);
        }

        esp.Nombre = dto.Nombre;
        esp.Descripcion = dto.Descripcion;
        await _db.SaveChangesAsync();
        _logger.LogInformation("Especialidad ID {Id} modificada con éxito", esp.Id);

        return new EspecialidadDto(esp.Id, esp.Nombre, esp.Descripcion);
    }

    public async Task EliminarEspecialidadAsync(int id)
    {
        _logger.LogInformation("Eliminando especialidad ID {Id}", id);

        var esp = await _db.Especialidades.FindAsync(id);
        if (esp == null)
        {
            _logger.LogWarning("Especialidad ID {Id} no encontrada para eliminar", id);
            throw new EspecialidadNotFoundException(id);
        }

        _db.Especialidades.Remove(esp);
        await _db.SaveChangesAsync();
        _logger.LogInformation("Especialidad ID {Id} eliminada", id);
    }

    public async Task<List<EspecialidadDto>> ObtenerTodasAsync()
    {
        _logger.LogInformation("Listando todas las especialidades");

        return await _db.Especialidades
            .Select(e => new EspecialidadDto(e.Id, e.Nombre, e.Descripcion))
            .ToListAsync();
    }

    public async Task<EspecialidadDto> ObtenerPorIdAsync(int id)
    {
        _logger.LogInformation("Obteniendo especialidad ID {Id}", id);

        var esp = await _db.Especialidades.FindAsync(id);
        if (esp == null)
        {
            _logger.LogWarning("Especialidad ID {Id} no encontrada", id);
            throw new EspecialidadNotFoundException(id);
        }

        return new EspecialidadDto(esp.Id, esp.Nombre, esp.Descripcion);
    }
}
