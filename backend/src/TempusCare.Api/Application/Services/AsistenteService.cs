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

        var asistente = new Asistente
        {
            Cuil = dto.Cuil,
            UsuarioId = usuario.Id,
            Nombre = dto.Nombre,
            Apellido = dto.Apellido,
            FechaNacimiento = dto.FecNac,
            Telefono = dto.Telefono,
            Genero = dto.Genero,
            DireccionId = dir?.Id
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

        asistente.Nombre = dto.Nombre;
        asistente.Apellido = dto.Apellido;
        asistente.FechaNacimiento = dto.FecNac;
        asistente.Telefono = dto.Telefono;
        asistente.Genero = dto.Genero;

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
            .ToListAsync();

        return lista.Select(a => MapToDto(a)).ToList();
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
            dirStr
        );
    }
}
