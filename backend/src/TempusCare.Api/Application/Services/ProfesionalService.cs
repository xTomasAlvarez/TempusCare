using Microsoft.EntityFrameworkCore;
using TempusCare.Api.Application.DTOs;
using TempusCare.Api.Application.Exceptions;
using TempusCare.Api.Domain.Entities;
using TempusCare.Api.Domain.Enums;
using TempusCare.Api.Infrastructure.Data;

namespace TempusCare.Api.Application.Services;

public class ProfesionalService : IProfesionalService
{
    private readonly TempusCareDbContext _db;
    private readonly ILogger<ProfesionalService> _logger;

    public ProfesionalService(TempusCareDbContext db, ILogger<ProfesionalService> logger)
    {
        _db = db;
        _logger = logger;
    }

    public async Task<ProfesionalResponseDto> AltaProfesionalAsync(AltaProfesionalDto dto)
    {
        _logger.LogInformation("Iniciando Alta de Profesional con CUIL {Cuil} y Matrícula {Matricula}", dto.Cuil, dto.Matricula);

        if (await _db.Profesionales.AnyAsync(p => p.Cuil == dto.Cuil || p.Matricula == dto.Matricula))
        {
            _logger.LogWarning("Conflicto al crear profesional: ya existe CUIL o Matrícula {Cuil} / {Matricula}", dto.Cuil, dto.Matricula);
            throw new ConflictException("Ya existe un profesional con el mismo CUIL o Matrícula.");
        }

        // Crear usuario para el profesional
        var usuario = new Usuario
        {
            NombreUsuario = dto.Cuil,
            Contrasena = "Tempus123!",
            Mail = $"{dto.Cuil}@tempuscare.com",
            Rol = RolUsuario.Profesional
        };
        _db.Usuarios.Add(usuario);
        await _db.SaveChangesAsync();

        // Crear dirección si corresponde
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

        var prof = new Profesional
        {
            Cuil = dto.Cuil,
            UsuarioId = usuario.Id,
            Nombre = dto.Nombre,
            Apellido = dto.Apellido,
            FechaNacimiento = dto.FecNac,
            Telefono = dto.Telefono,
            Matricula = dto.Matricula,
            Genero = dto.Genero,
            Estado = EstadoProfesional.Activo,
            DireccionId = direccion?.Id
        };

        _db.Profesionales.Add(prof);

        // Especialidades
        if (dto.EspecialidadesIds != null)
        {
            foreach (var espId in dto.EspecialidadesIds)
            {
                prof.Especialidades.Add(new ProfesionalEspecialidad { ProfesionalCuil = prof.Cuil, EspecialidadId = espId });
            }
        }

        // Consultorios
        if (dto.ConsultoriosCuits != null)
        {
            foreach (var consCuit in dto.ConsultoriosCuits)
            {
                prof.Consultorios.Add(new ProfesionalConsultorio { ProfesionalCuil = prof.Cuil, ConsultorioCuit = consCuit });
            }
        }

        // Obras Sociales
        if (dto.ObrasSocialesIds != null)
        {
            foreach (var osId in dto.ObrasSocialesIds)
            {
                prof.ObrasSociales.Add(new ProfesionalObraSocial { ProfesionalCuil = prof.Cuil, ObraSocialId = osId });
            }
        }

        // Estudios y Coberturas
        if (dto.Estudios != null)
        {
            foreach (var estDto in dto.Estudios)
            {
                var profEst = new ProfesionalEstudio
                {
                    ProfesionalCuil = prof.Cuil,
                    EstudioId = estDto.EstudioId,
                    DuracionTurno = estDto.DuracionTurno > 0 ? estDto.DuracionTurno : 30,
                    PrecioParticular = estDto.PrecioParticular,
                    Activo = true
                };

                if (estDto.ObrasSocialesAceptadasIds != null)
                {
                    foreach (var osId in estDto.ObrasSocialesAceptadasIds)
                    {
                        profEst.Coberturas.Add(new Cobertura
                        {
                            ObraSocialId = osId
                        });
                    }
                }

                prof.Estudios.Add(profEst);
            }
        }

        await _db.SaveChangesAsync();
        _logger.LogInformation("Profesional creado exitosamente con CUIL {Cuil}", prof.Cuil);

        return await ObtenerPorCuilAsync(prof.Cuil);
    }

    public async Task<ProfesionalResponseDto> ModificarProfesionalAsync(ModificarProfesionalDto dto)
    {
        _logger.LogInformation("Modificando profesional CUIL {Cuil}", dto.Cuil);

        var prof = await _db.Profesionales
            .Include(p => p.Direccion)
            .Include(p => p.Especialidades)
            .Include(p => p.Consultorios)
            .Include(p => p.ObrasSociales)
            .FirstOrDefaultAsync(p => p.Cuil == dto.Cuil);

        if (prof == null)
        {
            _logger.LogWarning("Profesional no encontrado para modificación con CUIL {Cuil}", dto.Cuil);
            throw new ProfesionalNotFoundException(dto.Cuil);
        }

        prof.Nombre = dto.Nombre;
        prof.Apellido = dto.Apellido;
        prof.FechaNacimiento = dto.FecNac;
        prof.Telefono = dto.Telefono;
        prof.Matricula = dto.Matricula;
        prof.Genero = dto.Genero;

        if (prof.Direccion != null)
        {
            prof.Direccion.Calle = dto.Calle ?? prof.Direccion.Calle;
            prof.Direccion.Nro = dto.Nro ?? prof.Direccion.Nro;
            prof.Direccion.Depto = dto.Depto ?? prof.Direccion.Depto;
            prof.Direccion.Localidad = dto.Localidad ?? prof.Direccion.Localidad;
            prof.Direccion.Provincia = dto.Provincia ?? prof.Direccion.Provincia;
            prof.Direccion.CodPostal = dto.CodPostal ?? prof.Direccion.CodPostal;
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
            prof.DireccionId = dir.Id;
        }

        // Actualizar asociaciones
        prof.Especialidades.Clear();
        if (dto.EspecialidadesIds != null)
        {
            foreach (var id in dto.EspecialidadesIds)
                prof.Especialidades.Add(new ProfesionalEspecialidad { ProfesionalCuil = prof.Cuil, EspecialidadId = id });
        }

        prof.Consultorios.Clear();
        if (dto.ConsultoriosCuits != null)
        {
            foreach (var cuit in dto.ConsultoriosCuits)
                prof.Consultorios.Add(new ProfesionalConsultorio { ProfesionalCuil = prof.Cuil, ConsultorioCuit = cuit });
        }

        prof.ObrasSociales.Clear();
        if (dto.ObrasSocialesIds != null)
        {
            foreach (var id in dto.ObrasSocialesIds)
                prof.ObrasSociales.Add(new ProfesionalObraSocial { ProfesionalCuil = prof.Cuil, ObraSocialId = id });
        }

        await _db.SaveChangesAsync();
        _logger.LogInformation("Profesional modificado correctamente. CUIL {Cuil}", prof.Cuil);

        return await ObtenerPorCuilAsync(prof.Cuil);
    }

    public async Task BajaProfesionalAsync(string cuil)
    {
        _logger.LogInformation("Dando de baja profesional CUIL {Cuil}", cuil);

        var prof = await _db.Profesionales.FirstOrDefaultAsync(p => p.Cuil == cuil);
        if (prof == null)
        {
            _logger.LogWarning("Profesional CUIL {Cuil} no encontrado para baja", cuil);
            throw new ProfesionalNotFoundException(cuil);
        }

        prof.Estado = EstadoProfesional.Inactivo;
        await _db.SaveChangesAsync();
        _logger.LogInformation("Profesional CUIL {Cuil} marcado como Inactivo", cuil);
    }

    public async Task<List<ProfesionalResponseDto>> ConsultarProfesionalesAsync(string? nombre, int? especialidadId, int? obraSocialId, string? consultorioCuit)
    {
        _logger.LogInformation("Consultando profesionales con filtros: Nombre={Nombre}, Esp={Esp}, OS={OS}, Cons={Cons}",
            nombre, especialidadId, obraSocialId, consultorioCuit);

        var query = _db.Profesionales
            .Include(p => p.Direccion)
            .Include(p => p.Especialidades).ThenInclude(e => e.Especialidad)
            .Include(p => p.Consultorios).ThenInclude(c => c.Consultorio)
            .Include(p => p.ObrasSociales).ThenInclude(o => o.ObraSocial)
            .Include(p => p.Estudios).ThenInclude(pe => pe.Estudio)
            .Include(p => p.Estudios).ThenInclude(pe => pe.Coberturas).ThenInclude(cob => cob.ObraSocial)
            .Where(p => p.Estado == EstadoProfesional.Activo)
            .AsQueryable();

        if (!string.IsNullOrWhiteSpace(nombre))
        {
            var busqueda = nombre.Trim().ToLower();
            query = query.Where(p => p.Nombre.ToLower().Contains(busqueda) || p.Apellido.ToLower().Contains(busqueda));
        }

        if (especialidadId.HasValue)
        {
            query = query.Where(p => p.Especialidades.Any(e => e.EspecialidadId == especialidadId.Value));
        }

        if (obraSocialId.HasValue)
        {
            query = query.Where(p => p.ObrasSociales.Any(o => o.ObraSocialId == obraSocialId.Value));
        }

        if (!string.IsNullOrEmpty(consultorioCuit))
        {
            query = query.Where(p => p.Consultorios.Any(c => c.ConsultorioCuit == consultorioCuit));
        }

        var lista = await query.ToListAsync();

        var result = new List<ProfesionalResponseDto>();
        foreach (var p in lista)
        {
            double punt = await CalcularPuntuacionDinamicaAsync(p.Cuil);
            result.Add(MapToResponseDto(p, punt));
        }

        return result;
    }

    public async Task<ProfesionalResponseDto> ObtenerPorCuilAsync(string cuil)
    {
        _logger.LogInformation("Obteniendo profesional por CUIL {Cuil}", cuil);

        var prof = await _db.Profesionales
            .Include(p => p.Direccion)
            .Include(p => p.Especialidades).ThenInclude(e => e.Especialidad)
            .Include(p => p.Consultorios).ThenInclude(c => c.Consultorio)
            .Include(p => p.ObrasSociales).ThenInclude(o => o.ObraSocial)
            .Include(p => p.Estudios).ThenInclude(pe => pe.Estudio)
            .Include(p => p.Estudios).ThenInclude(pe => pe.Coberturas).ThenInclude(cob => cob.ObraSocial)
            .FirstOrDefaultAsync(p => p.Cuil == cuil);

        if (prof == null)
        {
            _logger.LogWarning("Profesional CUIL {Cuil} no encontrado", cuil);
            throw new ProfesionalNotFoundException(cuil);
        }

        double punt = await CalcularPuntuacionDinamicaAsync(prof.Cuil);
        return MapToResponseDto(prof, punt);
    }

    public async Task<ProfesionalEstudioResponseDto> AsignarEstudioAsync(string profesionalCuil, AsignarEstudioProfesionalDto dto)
    {
        _logger.LogInformation("Asignando estudio {EstudioId} a profesional {Cuil}", dto.EstudioId, profesionalCuil);

        var prof = await _db.Profesionales
            .Include(p => p.Estudios).ThenInclude(pe => pe.Coberturas)
            .FirstOrDefaultAsync(p => p.Cuil == profesionalCuil);

        if (prof == null)
            throw new ProfesionalNotFoundException(profesionalCuil);

        var estudio = await _db.Estudios.FirstOrDefaultAsync(e => e.Id == dto.EstudioId);
        if (estudio == null)
            throw new EstudioNotFoundException(dto.EstudioId);

        var profEst = prof.Estudios.FirstOrDefault(pe => pe.EstudioId == dto.EstudioId);
        if (profEst == null)
        {
            profEst = new ProfesionalEstudio
            {
                ProfesionalCuil = prof.Cuil,
                EstudioId = dto.EstudioId,
                DuracionTurno = dto.DuracionTurno > 0 ? dto.DuracionTurno : 30,
                PrecioParticular = dto.PrecioParticular,
                Activo = true
            };
            prof.Estudios.Add(profEst);
        }
        else
        {
            profEst.DuracionTurno = dto.DuracionTurno > 0 ? dto.DuracionTurno : profEst.DuracionTurno;
            profEst.PrecioParticular = dto.PrecioParticular;
            profEst.Activo = true;
            profEst.Coberturas.Clear();
        }

        if (dto.ObrasSocialesAceptadasIds != null)
        {
            foreach (var osId in dto.ObrasSocialesAceptadasIds)
            {
                profEst.Coberturas.Add(new Cobertura
                {
                    ObraSocialId = osId
                });
            }
        }

        await _db.SaveChangesAsync();

        var recargado = await _db.ProfesionalEstudios
            .Include(pe => pe.Estudio)
            .Include(pe => pe.Coberturas).ThenInclude(cob => cob.ObraSocial)
            .FirstAsync(pe => pe.Id == profEst.Id);

        return new ProfesionalEstudioResponseDto(
            recargado.Id,
            recargado.EstudioId,
            recargado.Estudio?.Nombre ?? "",
            recargado.DuracionTurno,
            recargado.PrecioParticular,
            recargado.Activo,
            recargado.Coberturas.Select(c => c.ObraSocial?.Nombre ?? "").Where(s => !string.IsNullOrEmpty(s)).ToList()
        );
    }

    public async Task DesasignarEstudioAsync(string profesionalCuil, int estudioId)
    {
        _logger.LogInformation("Desasignando estudio {EstudioId} de profesional {Cuil}", estudioId, profesionalCuil);

        var profEst = await _db.ProfesionalEstudios
            .FirstOrDefaultAsync(pe => pe.ProfesionalCuil == profesionalCuil && pe.EstudioId == estudioId);

        if (profEst != null)
        {
            _db.ProfesionalEstudios.Remove(profEst);
            await _db.SaveChangesAsync();
        }
    }

    public async Task<List<ProfesionalEstudioResponseDto>> ObtenerEstudiosPorProfesionalAsync(string profesionalCuil)
    {
        var lista = await _db.ProfesionalEstudios
            .Include(pe => pe.Estudio)
            .Include(pe => pe.Coberturas).ThenInclude(c => c.ObraSocial)
            .Where(pe => pe.ProfesionalCuil == profesionalCuil)
            .ToListAsync();

        return lista.Select(pe => new ProfesionalEstudioResponseDto(
            pe.Id,
            pe.EstudioId,
            pe.Estudio?.Nombre ?? "",
            pe.DuracionTurno,
            pe.PrecioParticular,
            pe.Activo,
            pe.Coberturas.Select(c => c.ObraSocial?.Nombre ?? "").Where(s => !string.IsNullOrEmpty(s)).ToList()
        )).ToList();
    }

    private async Task<double> CalcularPuntuacionDinamicaAsync(string profesionalCuil)
    {
        var cuestionarios = await _db.Cuestionarios
            .Include(c => c.Cita).ThenInclude(ci => ci!.Turno).ThenInclude(t => t!.Agenda)
            .Where(c => c.Cita != null && c.Cita.Turno != null && c.Cita.Turno.Agenda != null &&
                        c.Cita.Turno.Agenda.ProfesionalCuil == profesionalCuil)
            .ToListAsync();

        if (!cuestionarios.Any())
            return 0.0;

        double prom = cuestionarios.Average(c => (c.Puntualidad + c.Atencion + c.Profesionalismo) / 3.0);
        return Math.Round(prom, 2);
    }

    private static ProfesionalResponseDto MapToResponseDto(Profesional p, double puntuacion)
    {
        string? dirStr = p.Direccion != null
            ? $"{p.Direccion.Calle} {p.Direccion.Nro}, {p.Direccion.Localidad}, {p.Direccion.Provincia}"
            : null;

        var estudiosDto = p.Estudios.Select(pe => new ProfesionalEstudioResponseDto(
            pe.Id,
            pe.EstudioId,
            pe.Estudio?.Nombre ?? "",
            pe.DuracionTurno,
            pe.PrecioParticular,
            pe.Activo,
            pe.Coberturas.Select(c => c.ObraSocial?.Nombre ?? "").Where(s => s != "").ToList()
        )).ToList();

        return new ProfesionalResponseDto(
            p.Cuil,
            p.Nombre,
            p.Apellido,
            p.FechaNacimiento,
            p.Telefono,
            p.Matricula,
            p.Genero,
            p.Estado,
            puntuacion,
            dirStr,
            p.Especialidades.Select(e => e.Especialidad?.Nombre ?? "").Where(s => s != "").ToList(),
            p.Consultorios.Select(c => c.Consultorio?.Nombre ?? "").Where(s => s != "").ToList(),
            p.ObrasSociales.Select(o => o.ObraSocial?.Nombre ?? "").Where(s => s != "").ToList(),
            estudiosDto
        );
    }
}
