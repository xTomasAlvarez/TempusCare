using Microsoft.EntityFrameworkCore;
using TempusCare.Api.Application.DTOs;
using TempusCare.Api.Application.Exceptions;
using TempusCare.Api.Domain.Enums;
using TempusCare.Api.Infrastructure.Data;

namespace TempusCare.Api.Application.Services;

public class TurnoService : ITurnoService
{
    private readonly TempusCareDbContext _db;
    private readonly ILogger<TurnoService> _logger;

    public TurnoService(TempusCareDbContext db, ILogger<TurnoService> logger)
    {
        _db = db;
        _logger = logger;
    }

    public async Task<List<TurnoResponseDto>> ObtenerTurnosDisponiblesAsync(string profesionalCuilOMatricula, DateTime? fecha)
    {
        _logger.LogInformation("Obteniendo turnos disponibles para profesional {Prof} en fecha {Fecha}", profesionalCuilOMatricula, fecha);

        var query = _db.Turnos
            .Include(t => t.Agenda).ThenInclude(a => a!.Profesional)
            .Include(t => t.Agenda).ThenInclude(a => a!.Consultorio)
            .Where(t => t.Estado == EstadoTurno.Disponible &&
                        (t.Agenda!.ProfesionalCuil == profesionalCuilOMatricula ||
                         (t.Agenda!.Profesional != null && t.Agenda.Profesional.Matricula == profesionalCuilOMatricula)))
            .AsQueryable();

        if (fecha.HasValue)
        {
            var dateOnly = fecha.Value.Date;
            query = query.Where(t => t.Fecha.Date == dateOnly);
        }

        var lista = await query.ToListAsync();
        _logger.LogInformation("Encontrados {Count} turnos disponibles", lista.Count);

        return lista.Select(t => MapTurnoDto(t)).ToList();
    }

    public async Task<TurnoResponseDto> ModificarTurnoAsync(int turnoId, string? detalle, EstadoTurno? estado)
    {
        _logger.LogInformation("Modificando turno ID {TurnoId}. Nuevo estado: {Estado}", turnoId, estado);

        var turno = await _db.Turnos
            .Include(t => t.Cita)
            .Include(t => t.Agenda).ThenInclude(a => a!.Profesional)
            .Include(t => t.Agenda).ThenInclude(a => a!.Consultorio)
            .FirstOrDefaultAsync(t => t.Id == turnoId);

        if (turno == null)
        {
            _logger.LogWarning("Turno ID {TurnoId} no encontrado", turnoId);
            throw new TurnoNotFoundException(turnoId);
        }

        if (estado.HasValue)
        {
            turno.Estado = estado.Value;

            // Regla de Negocio: Si el médico cancela el turno, la cita se cancela automáticamente.
            if (estado.Value == EstadoTurno.Cancelado && turno.Cita != null)
            {
                _logger.LogInformation("Cancelando automáticamente cita ID {CitaId} asociada al turno cancelado {TurnoId}", turno.Cita.Id, turno.Id);
                turno.Cita.Estado = EstadoCita.Cancelada;
            }
        }

        await _db.SaveChangesAsync();
        _logger.LogInformation("Turno ID {TurnoId} modificado con éxito", turno.Id);

        return MapTurnoDto(turno);
    }

    public async Task<TurnoResponseDto> ObtenerPorIdAsync(int turnoId)
    {
        _logger.LogInformation("Obteniendo turno ID {TurnoId}", turnoId);

        var turno = await _db.Turnos
            .Include(t => t.Agenda).ThenInclude(a => a!.Profesional)
            .Include(t => t.Agenda).ThenInclude(a => a!.Consultorio)
            .FirstOrDefaultAsync(t => t.Id == turnoId);

        if (turno == null)
        {
            _logger.LogWarning("Turno ID {TurnoId} no encontrado", turnoId);
            throw new TurnoNotFoundException(turnoId);
        }

        return MapTurnoDto(turno);
    }

    private static TurnoResponseDto MapTurnoDto(Domain.Entities.Turno t)
    {
        return new TurnoResponseDto(
            t.Id,
            t.AgendaId,
            t.Fecha,
            t.HoraInicio,
            t.HoraFin,
            t.Estado,
            t.Agenda?.ProfesionalCuil ?? "",
            $"{t.Agenda?.Profesional?.Nombre} {t.Agenda?.Profesional?.Apellido}",
            t.Agenda?.Consultorio?.Nombre ?? ""
        );
    }
}
