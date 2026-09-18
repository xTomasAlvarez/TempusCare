using Microsoft.EntityFrameworkCore;
using TempusCare.Api.Application.DTOs;
using TempusCare.Api.Application.Exceptions;
using TempusCare.Api.Domain.Entities;
using TempusCare.Api.Infrastructure.Data;

namespace TempusCare.Api.Application.Services;

public class ConsultorioService : IConsultorioService
{
    private readonly TempusCareDbContext _db;
    private readonly ILogger<ConsultorioService> _logger;

    public ConsultorioService(TempusCareDbContext db, ILogger<ConsultorioService> logger)
    {
        _db = db;
        _logger = logger;
    }

    public async Task<ConsultorioResponseDto> AltaConsultorioAsync(AltaConsultorioDto dto)
    {
        _logger.LogInformation("Creando consultorio con CUIT {Cuit} y Nombre {Nombre}", dto.Cuit, dto.Nombre);

        if (await _db.Consultorios.AnyAsync(c => c.Cuit == dto.Cuit))
        {
            _logger.LogWarning("Ya existe un consultorio con el CUIT {Cuit}", dto.Cuit);
            throw new ConflictException($"Ya existe un consultorio registrado con el CUIT {dto.Cuit}.");
        }

        var dir = new Direccion
        {
            Calle = dto.Calle,
            Nro = dto.Nro,
            Depto = dto.Depto,
            Localidad = dto.Localidad,
            Provincia = dto.Provincia,
            CodPostal = dto.CodPostal
        };
        _db.Direcciones.Add(dir);
        await _db.SaveChangesAsync();

        var cons = new Consultorio
        {
            Cuit = dto.Cuit,
            Nombre = dto.Nombre,
            Email = dto.Email,
            Telefono = dto.Telefono,
            NivelAccesibilidad = dto.NivelAccesibilidad,
            InstitucionId = dto.InstitucionId,
            DireccionId = dir.Id
        };
        _db.Consultorios.Add(cons);

        if (dto.ProfesionalesCuils != null)
        {
            foreach (var cuil in dto.ProfesionalesCuils)
            {
                cons.Profesionales.Add(new ProfesionalConsultorio { ConsultorioCuit = cons.Cuit, ProfesionalCuil = cuil });
            }
        }

        await _db.SaveChangesAsync();
        _logger.LogInformation("Consultorio CUIT {Cuit} creado con éxito", cons.Cuit);

        return await ObtenerPorCuitAsync(cons.Cuit);
    }

    public async Task<ConsultorioResponseDto> ModificarConsultorioAsync(ModificarConsultorioDto dto)
    {
        _logger.LogInformation("Modificando consultorio CUIT {Cuit}", dto.Cuit);

        var cons = await _db.Consultorios
            .Include(c => c.Direccion)
            .Include(c => c.Profesionales)
            .Include(c => c.Institucion)
            .FirstOrDefaultAsync(c => c.Cuit == dto.Cuit);

        if (cons == null)
        {
            _logger.LogWarning("Consultorio CUIT {Cuit} no encontrado para modificación", dto.Cuit);
            throw new ConsultorioNotFoundException(dto.Cuit);
        }

        cons.Nombre = dto.Nombre;
        cons.Email = dto.Email;
        cons.Telefono = dto.Telefono;
        cons.NivelAccesibilidad = dto.NivelAccesibilidad;
        cons.InstitucionId = dto.InstitucionId;

        if (cons.Direccion != null)
        {
            cons.Direccion.Calle = dto.Calle;
            cons.Direccion.Nro = dto.Nro;
            cons.Direccion.Depto = dto.Depto;
            cons.Direccion.Localidad = dto.Localidad;
            cons.Direccion.Provincia = dto.Provincia;
            cons.Direccion.CodPostal = dto.CodPostal;
        }

        cons.Profesionales.Clear();
        if (dto.ProfesionalesCuils != null)
        {
            foreach (var cuil in dto.ProfesionalesCuils)
            {
                cons.Profesionales.Add(new ProfesionalConsultorio { ConsultorioCuit = cons.Cuit, ProfesionalCuil = cuil });
            }
        }

        await _db.SaveChangesAsync();
        _logger.LogInformation("Consultorio CUIT {Cuit} modificado correctamente", cons.Cuit);

        return await ObtenerPorCuitAsync(cons.Cuit);
    }

    public async Task BajaConsultorioAsync(string cuit)
    {
        _logger.LogInformation("Eliminando consultorio CUIT {Cuit}", cuit);

        var cons = await _db.Consultorios.FirstOrDefaultAsync(c => c.Cuit == cuit);
        if (cons == null)
        {
            _logger.LogWarning("Consultorio CUIT {Cuit} no encontrado para baja", cuit);
            throw new ConsultorioNotFoundException(cuit);
        }

        _db.Consultorios.Remove(cons);
        await _db.SaveChangesAsync();
        _logger.LogInformation("Consultorio CUIT {Cuit} eliminado", cuit);
    }

    public async Task<List<ConsultorioResponseDto>> ObtenerTodosAsync()
    {
        _logger.LogInformation("Listando todos los consultorios");

        var lista = await _db.Consultorios
            .Include(c => c.Direccion)
            .Include(c => c.Institucion)
            .Include(c => c.Profesionales).ThenInclude(p => p.Profesional)
            .ToListAsync();

        return lista.Select(c => MapToDto(c)).ToList();
    }

    public async Task<ConsultorioResponseDto> ObtenerPorCuitAsync(string cuit)
    {
        _logger.LogInformation("Obteniendo consultorio CUIT {Cuit}", cuit);

        var cons = await _db.Consultorios
            .Include(c => c.Direccion)
            .Include(c => c.Institucion)
            .Include(c => c.Profesionales).ThenInclude(p => p.Profesional)
            .FirstOrDefaultAsync(c => c.Cuit == cuit);

        if (cons == null)
        {
            _logger.LogWarning("Consultorio CUIT {Cuit} no encontrado", cuit);
            throw new ConsultorioNotFoundException(cuit);
        }

        return MapToDto(cons);
    }

    public async Task<List<ConsultorioResponseDto>> ObtenerPorInstitucionAsync(int institucionId)
    {
        _logger.LogInformation("Obteniendo consultorios para la institución ID {Id}", institucionId);

        var lista = await _db.Consultorios
            .Include(c => c.Direccion)
            .Include(c => c.Institucion)
            .Include(c => c.Profesionales).ThenInclude(p => p.Profesional)
            .Where(c => c.InstitucionId == institucionId)
            .ToListAsync();

        return lista.Select(c => MapToDto(c)).ToList();
    }

    public async Task<List<ProfesionalVinculadoDto>> ObtenerProfesionalesPorConsultorioAsync(string consultorioCuit)
    {
        _logger.LogInformation("Obteniendo profesionales del consultorio {Cuit}", consultorioCuit);

        var consultorioExiste = await _db.Consultorios.AnyAsync(c => c.Cuit == consultorioCuit);
        if (!consultorioExiste)
        {
            throw new ConsultorioNotFoundException(consultorioCuit);
        }

        var vinculaciones = await _db.ProfesionalConsultorios
            .Include(pc => pc.Profesional)
                .ThenInclude(p => p.Especialidades)
                    .ThenInclude(e => e.Especialidad)
            .Where(pc => pc.ConsultorioCuit == consultorioCuit)
            .ToListAsync();

        return vinculaciones.Select(pc => new ProfesionalVinculadoDto(
            pc.ProfesionalCuil,
            pc.Profesional?.Nombre ?? "",
            pc.Profesional?.Apellido ?? "",
            pc.Profesional?.Matricula ?? "",
            pc.Profesional?.Telefono ?? "",
            pc.Profesional?.Especialidades.Select(e => e.Especialidad?.Nombre ?? "").Where(n => !string.IsNullOrEmpty(n)).ToList() ?? new List<string>()
        )).ToList();
    }

    public async Task AsignarProfesionalAsync(string consultorioCuit, string profesionalCuil)
    {
        _logger.LogInformation("Asignando profesional {Cuil} a consultorio {Cuit}", profesionalCuil, consultorioCuit);

        var consultorioExiste = await _db.Consultorios.AnyAsync(c => c.Cuit == consultorioCuit);
        if (!consultorioExiste)
            throw new ConsultorioNotFoundException(consultorioCuit);

        var profesionalExiste = await _db.Profesionales.AnyAsync(p => p.Cuil == profesionalCuil);
        if (!profesionalExiste)
            throw new ProfesionalNotFoundException(profesionalCuil);

        var yaExiste = await _db.ProfesionalConsultorios
            .AnyAsync(pc => pc.ConsultorioCuit == consultorioCuit && pc.ProfesionalCuil == profesionalCuil);

        if (yaExiste)
        {
            _logger.LogWarning("El profesional {Cuil} ya se encuentra vinculado al consultorio {Cuit}", profesionalCuil, consultorioCuit);
            throw new ConflictException("El profesional ya se encuentra vinculado a este consultorio.");
        }

        _db.ProfesionalConsultorios.Add(new ProfesionalConsultorio
        {
            ConsultorioCuit = consultorioCuit,
            ProfesionalCuil = profesionalCuil
        });

        await _db.SaveChangesAsync();
        _logger.LogInformation("Profesional {Cuil} vinculado exitosamente al consultorio {Cuit}", profesionalCuil, consultorioCuit);
    }

    public async Task DesasignarProfesionalAsync(string consultorioCuit, string profesionalCuil)
    {
        _logger.LogInformation("Desasignando profesional {Cuil} de consultorio {Cuit}", profesionalCuil, consultorioCuit);

        var vinculacion = await _db.ProfesionalConsultorios
            .FirstOrDefaultAsync(pc => pc.ConsultorioCuit == consultorioCuit && pc.ProfesionalCuil == profesionalCuil);

        if (vinculacion == null)
        {
            _logger.LogWarning("No se encontró la vinculación entre {Cuil} y consultorio {Cuit}", profesionalCuil, consultorioCuit);
            throw new NotFoundException($"El profesional {profesionalCuil} no está vinculado al consultorio {consultorioCuit}.");
        }

        _db.ProfesionalConsultorios.Remove(vinculacion);
        await _db.SaveChangesAsync();
        _logger.LogInformation("Profesional {Cuil} desvinculado de consultorio {Cuit}", profesionalCuil, consultorioCuit);
    }

    private static ConsultorioResponseDto MapToDto(Consultorio c)
    {
        string dirStr = c.Direccion != null
            ? $"{c.Direccion.Calle} {c.Direccion.Nro}, {c.Direccion.Localidad}, {c.Direccion.Provincia}"
            : "";

        return new ConsultorioResponseDto(
            c.Cuit,
            c.Nombre,
            c.Email,
            c.Telefono,
            c.NivelAccesibilidad,
            c.Institucion?.Nombre,
            dirStr,
            c.Profesionales.Select(p => $"{p.Profesional?.Nombre} {p.Profesional?.Apellido}").ToList()
        );
    }
}
