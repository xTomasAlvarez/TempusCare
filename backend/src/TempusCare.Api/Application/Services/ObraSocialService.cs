using Microsoft.EntityFrameworkCore;
using TempusCare.Api.Application.DTOs;
using TempusCare.Api.Application.Exceptions;
using TempusCare.Api.Domain.Entities;
using TempusCare.Api.Infrastructure.Data;

namespace TempusCare.Api.Application.Services;

public class ObraSocialService : IObraSocialService
{
    private readonly TempusCareDbContext _db;
    private readonly ILogger<ObraSocialService> _logger;

    public ObraSocialService(TempusCareDbContext db, ILogger<ObraSocialService> logger)
    {
        _db = db;
        _logger = logger;
    }

    public async Task<ObraSocialDto> AltaObraSocialAsync(AltaObraSocialDto dto)
    {
        _logger.LogInformation("Creando obra social: {Nombre}", dto.Nombre);

        if (await _db.ObrasSociales.AnyAsync(o => o.Nombre == dto.Nombre))
        {
            _logger.LogWarning("La obra social {Nombre} ya existe", dto.Nombre);
            throw new ConflictException($"La obra social '{dto.Nombre}' ya existe.");
        }

        var os = new ObraSocial { Nombre = dto.Nombre, Catalogo = dto.Catalogo };
        _db.ObrasSociales.Add(os);
        await _db.SaveChangesAsync();
        _logger.LogInformation("Obra Social creada con ID {Id}", os.Id);

        return new ObraSocialDto(os.Id, os.Nombre, os.Catalogo);
    }

    public async Task<ObraSocialDto> ModificarObraSocialAsync(ModificarObraSocialDto dto)
    {
        _logger.LogInformation("Modificando obra social ID {Id}", dto.Id);

        var os = await _db.ObrasSociales.FindAsync(dto.Id);
        if (os == null)
        {
            _logger.LogWarning("Obra Social ID {Id} no encontrada", dto.Id);
            throw new ObraSocialNotFoundException(dto.Id);
        }

        os.Nombre = dto.Nombre;
        os.Catalogo = dto.Catalogo;
        await _db.SaveChangesAsync();
        _logger.LogInformation("Obra Social ID {Id} modificada con éxito", os.Id);

        return new ObraSocialDto(os.Id, os.Nombre, os.Catalogo);
    }

    public async Task EliminarObraSocialAsync(int id)
    {
        _logger.LogInformation("Eliminando obra social ID {Id}", id);

        var os = await _db.ObrasSociales.FindAsync(id);
        if (os == null)
        {
            _logger.LogWarning("Obra Social ID {Id} no encontrada para eliminar", id);
            throw new ObraSocialNotFoundException(id);
        }

        _db.ObrasSociales.Remove(os);
        await _db.SaveChangesAsync();
        _logger.LogInformation("Obra Social ID {Id} eliminada", id);
    }

    public async Task<List<ObraSocialDto>> ObtenerTodasAsync()
    {
        _logger.LogInformation("Listando todas las obras sociales");

        return await _db.ObrasSociales
            .Select(o => new ObraSocialDto(o.Id, o.Nombre, o.Catalogo))
            .ToListAsync();
    }

    public async Task<ObraSocialDto> ObtenerPorIdAsync(int id)
    {
        _logger.LogInformation("Obteniendo obra social ID {Id}", id);

        var os = await _db.ObrasSociales.FindAsync(id);
        if (os == null)
        {
            _logger.LogWarning("Obra Social ID {Id} no encontrada", id);
            throw new ObraSocialNotFoundException(id);
        }

        return new ObraSocialDto(os.Id, os.Nombre, os.Catalogo);
    }
}
