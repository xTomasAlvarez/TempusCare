using Microsoft.EntityFrameworkCore;
using TempusCare.Api.Application.DTOs;
using TempusCare.Api.Application.Exceptions;
using TempusCare.Api.Domain.Entities;
using TempusCare.Api.Domain.Enums;
using TempusCare.Api.Infrastructure.Data;

namespace TempusCare.Api.Application.Services;

public class ObservacionService : IObservacionService
{
    private readonly TempusCareDbContext _db;
    private readonly ILogger<ObservacionService> _logger;

    public ObservacionService(TempusCareDbContext db, ILogger<ObservacionService> logger)
    {
        _db = db;
        _logger = logger;
    }

    public async Task<ObservacionResponseDto> CompletarObservacionAsync(CompletarObservacionDto dto)
    {
        _logger.LogInformation("Completando observación médica para Cita ID {CitaId} / Historia Clínica ID {HcId}", dto.CitaId, dto.HistoriaClinicaId);

        using var tx = _db.Database.IsRelational() ? await _db.Database.BeginTransactionAsync() : null;
        try
        {
            Observacion? observacion = null;

            if (dto.CitaId.HasValue)
            {
                var cita = await _db.Citas
                    .Include(c => c.Observacion)
                    .Include(c => c.Paciente).ThenInclude(p => p!.HistoriaClinica)
                    .Include(c => c.Turno).ThenInclude(t => t!.Agenda)
                    .FirstOrDefaultAsync(c => c.Id == dto.CitaId.Value);

                if (cita == null)
                {
                    _logger.LogWarning("Cita ID {CitaId} no encontrada", dto.CitaId.Value);
                    throw new CitaNotFoundException(dto.CitaId.Value);
                }

                int historiaClinicaId = dto.HistoriaClinicaId ?? 0;
                if (cita.Paciente?.HistoriaClinica != null)
                {
                    historiaClinicaId = cita.Paciente.HistoriaClinica.Id;
                }
                else if (historiaClinicaId <= 0 && !string.IsNullOrEmpty(cita.PacienteCuil))
                {
                    // Buscar si existe HistoriaClinica por CUIL
                    var hcExistente = await _db.HistoriasClinicas.FirstOrDefaultAsync(h => h.PacienteCuil == cita.PacienteCuil);
                    if (hcExistente != null)
                    {
                        historiaClinicaId = hcExistente.Id;
                    }
                    else
                    {
                        // Auto-crear cabecera de Historia Clínica unificada para el paciente si aún no tenía
                        var nuevaHc = new HistoriaClinica
                        {
                            PacienteCuil = cita.PacienteCuil
                        };
                        _db.HistoriasClinicas.Add(nuevaHc);
                        await _db.SaveChangesAsync();
                        historiaClinicaId = nuevaHc.Id;
                    }
                }

                if (cita.Observacion != null)
                {
                    observacion = cita.Observacion;
                    observacion.HistoriaClinicaId = historiaClinicaId;
                    observacion.Motivo = dto.Motivo;
                    observacion.Detalle = dto.Detalle;
                }
                else
                {
                    observacion = new Observacion
                    {
                        CitaId = cita.Id,
                        HistoriaClinicaId = historiaClinicaId,
                        ProfesionalCuil = cita.Turno?.Agenda?.ProfesionalCuil ?? dto.ProfesionalCuil,
                        Motivo = dto.Motivo,
                        Detalle = dto.Detalle
                    };
                    _db.Observaciones.Add(observacion);
                }

                // RF-MED-06 & RN-04: Al guardar la evolución clínica, actualizar la Cita a Atendida y los turnos asociados a Atendido
                cita.Estado = EstadoCita.Atendida;

                var turnosAsociados = await _db.Turnos
                    .Where(t => t.CitaId == cita.Id || t.Id == cita.TurnoId)
                    .ToListAsync();

                foreach (var t in turnosAsociados)
                {
                    t.Estado = EstadoTurno.Atendido;
                    t.RowVersion = Guid.NewGuid();
                }
            }
            else
            {
                observacion = new Observacion
                {
                    HistoriaClinicaId = dto.HistoriaClinicaId ?? 0,
                    ProfesionalCuil = dto.ProfesionalCuil,
                    Motivo = dto.Motivo,
                    Detalle = dto.Detalle
                };
                _db.Observaciones.Add(observacion);
            }

            await _db.SaveChangesAsync();

            if (tx != null)
            {
                await tx.CommitAsync();
            }

            _logger.LogInformation("Observación ID {Id} guardada con éxito y estados actualizados a Atendido", observacion.Id);

            return await ObtenerPorIdAsync(observacion.Id);
        }
        catch
        {
            if (tx != null) await tx.RollbackAsync();
            throw;
        }
    }

    public async Task<List<ObservacionResponseDto>> ObtenerObservacionesPorHistoriaClinicaAsync(int historiaClinicaId)
    {
        _logger.LogInformation("Obteniendo observaciones para historia clínica ID {HcId}", historiaClinicaId);

        var lista = await _db.Observaciones
            .Include(o => o.Profesional)
            .Where(o => o.HistoriaClinicaId == historiaClinicaId)
            .ToListAsync();

        return lista.Select(o => MapToDto(o)).ToList();
    }

    public async Task<List<ObservacionResponseDto>> ObtenerObservacionesPorProfesionalAsync(string profesionalCuil)
    {
        _logger.LogInformation("Obteniendo observaciones realizadas por el profesional CUIL {Cuil}", profesionalCuil);

        var lista = await _db.Observaciones
            .Include(o => o.Profesional)
            .Where(o => o.ProfesionalCuil == profesionalCuil)
            .ToListAsync();

        return lista.Select(o => MapToDto(o)).ToList();
    }

    public async Task<ObservacionResponseDto> ObtenerPorIdAsync(int id)
    {
        _logger.LogInformation("Obteniendo observación ID {Id}", id);

        var obs = await _db.Observaciones
            .Include(o => o.Profesional)
            .FirstOrDefaultAsync(o => o.Id == id);

        if (obs == null)
        {
            _logger.LogWarning("Observación ID {Id} no encontrada", id);
            throw new ObservacionNotFoundException(id);
        }

        return MapToDto(obs);
    }

    private static ObservacionResponseDto MapToDto(Observacion o)
    {
        return new ObservacionResponseDto(
            o.Id,
            o.CitaId,
            o.HistoriaClinicaId,
            o.ProfesionalCuil,
            $"{o.Profesional?.Nombre} {o.Profesional?.Apellido}".Trim(),
            o.Motivo,
            o.Detalle
        );
    }
}
