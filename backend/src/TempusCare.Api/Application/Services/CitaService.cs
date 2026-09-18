using Microsoft.EntityFrameworkCore;
using TempusCare.Api.Application.DTOs;
using TempusCare.Api.Application.Exceptions;
using TempusCare.Api.Domain.Entities;
using TempusCare.Api.Domain.Enums;
using TempusCare.Api.Infrastructure.Data;

namespace TempusCare.Api.Application.Services;

public class CitaService : ICitaService
{
    private readonly TempusCareDbContext _db;
    private readonly ILogger<CitaService> _logger;

    public CitaService(TempusCareDbContext db, ILogger<CitaService> logger)
    {
        _db = db;
        _logger = logger;
    }

    public async Task<CitaResponseDto> AltaCitaAsync(AltaCitaDto dto)
    {
        _logger.LogInformation("Solicitando cita médica: Paciente={Pac}, Prof={Prof}, TurnoId={TurnoId}, Tipo={Tipo}",
            dto.PacienteCuil, dto.ProfesionalCuil, dto.TurnoId, dto.Tipo);

        var paciente = await _db.Pacientes.FirstOrDefaultAsync(p => p.Cuil == dto.PacienteCuil);
        if (paciente == null)
        {
            _logger.LogWarning("Paciente CUIL {Cuil} no encontrado", dto.PacienteCuil);
            throw new PacienteNotFoundException(dto.PacienteCuil);
        }

        var prof = await _db.Profesionales
            .Include(p => p.ObrasSociales)
            .Include(p => p.Estudios).ThenInclude(pe => pe.Coberturas)
            .FirstOrDefaultAsync(p => p.Cuil == dto.ProfesionalCuil);

        if (prof == null)
        {
            _logger.LogWarning("Profesional CUIL {Cuil} no encontrado", dto.ProfesionalCuil);
            throw new ProfesionalNotFoundException(dto.ProfesionalCuil);
        }

        var turno = await _db.Turnos
            .Include(t => t.Agenda).ThenInclude(a => a!.Profesional)
            .Include(t => t.Agenda).ThenInclude(a => a!.Consultorio)
            .FirstOrDefaultAsync(t => t.Id == dto.TurnoId);

        if (turno == null)
        {
            _logger.LogWarning("Turno ID {TurnoId} no encontrado", dto.TurnoId);
            throw new TurnoNotFoundException(dto.TurnoId);
        }

        // RN-02: Solo se pueden reservar turnos en franjas disponibles.
        if (turno.Estado != EstadoTurno.Disponible)
        {
            _logger.LogWarning("RN-02: Intento de reserva en turno no disponible ID {TurnoId}", turno.Id);
            throw new ConflictException("RN-02: El horario seleccionado ya no está disponible.");
        }

        // RN-04: Cobertura de Obra Social o Particular
        CoberturaCita coberturaFinal = CoberturaCita.Particular;
        if (dto.ObraSocialId.HasValue)
        {
            bool aceptaObraSocial = false;

            if (dto.EstudioId.HasValue)
            {
                var est = prof.Estudios.FirstOrDefault(e => e.EstudioId == dto.EstudioId.Value);
                if (est != null && est.Coberturas.Any(c => c.ObraSocialId == dto.ObraSocialId.Value))
                {
                    aceptaObraSocial = true;
                }
            }
            else
            {
                aceptaObraSocial = prof.ObrasSociales.Any(o => o.ObraSocialId == dto.ObraSocialId.Value);
            }

            if (aceptaObraSocial)
            {
                coberturaFinal = CoberturaCita.ObraSocial;
            }
        }

        turno.Estado = EstadoTurno.Reservado;

        // Aclaración RF-SADM-03.A: Cobertura de múltiples turnos si el estudio dura más que un slot individual
        var turnosAdicionales = new List<Turno>();
        Estudio? estudioObj = null;

        if (dto.EstudioId.HasValue)
        {
            estudioObj = await _db.Estudios.FirstOrDefaultAsync(e => e.Id == dto.EstudioId.Value);
            if (estudioObj == null)
            {
                _logger.LogWarning("Estudio ID {EstudioId} no encontrado", dto.EstudioId.Value);
                throw new EstudioNotFoundException(dto.EstudioId.Value);
            }

            int duracionEstudio = estudioObj.Duracion > 0 ? estudioObj.Duracion : 30;
            int duracionSlot = (int)(turno.HoraFin - turno.HoraInicio).TotalMinutes;
            if (duracionSlot <= 0) duracionSlot = 30;

            int turnosRequeridos = (int)Math.Ceiling((double)duracionEstudio / duracionSlot);

            if (turnosRequeridos > 1)
            {
                TimeSpan siguienteInicio = turno.HoraFin;
                for (int i = 1; i < turnosRequeridos; i++)
                {
                    var sigTurno = await _db.Turnos
                        .FirstOrDefaultAsync(t => t.AgendaId == turno.AgendaId && t.Fecha == turno.Fecha && t.HoraInicio == siguienteInicio);

                    if (sigTurno == null || sigTurno.Estado != EstadoTurno.Disponible)
                    {
                        _logger.LogWarning("Turnos continuos insuficientes para estudio ID {EstudioId}. Se requieren {Req} turnos.", dto.EstudioId.Value, turnosRequeridos);
                        throw new ConflictException($"El estudio '{estudioObj.Nombre}' requiere {turnosRequeridos} turnos consecutivos ({duracionEstudio} min) y no hay disponibilidad continua a partir del horario seleccionado.");
                    }

                    turnosAdicionales.Add(sigTurno);
                    siguienteInicio = sigTurno.HoraFin;
                }

                foreach (var sig in turnosAdicionales)
                {
                    sig.Estado = EstadoTurno.Reservado;
                }
            }
        }

        var cita = new Cita
        {
            TurnoId = turno.Id,
            PacienteCuil = paciente.Cuil,
            Fecha = turno.Fecha,
            Estado = EstadoCita.Confirmada,
            Tipo = dto.Tipo,
            Cobertura = coberturaFinal,
            EstudioId = dto.EstudioId,
            DocumentoPedidoMedico = dto.DocumentoPedidoMedico
        };

        _db.Citas.Add(cita);
        await _db.SaveChangesAsync();

        // Vincular los turnos cubiertos con la Cita
        turno.CitaId = cita.Id;
        foreach (var sig in turnosAdicionales)
        {
            sig.CitaId = cita.Id;
        }
        await _db.SaveChangesAsync();

        _logger.LogInformation("Cita médica creada exitosamente con ID {CitaId} cubriendo {Cant} turnos", cita.Id, turnosAdicionales.Count + 1);

        cita.Estudio = estudioObj;
        cita.Turnos = new List<Turno> { turno };
        foreach (var ta in turnosAdicionales) cita.Turnos.Add(ta);

        return MapCitaDto(cita, turno, paciente, prof);
    }

    public async Task<CitaResponseDto> ModificarCitaEstadoAsync(int citaId, EstadoCita estado)
    {
        _logger.LogInformation("Modificando estado de cita ID {CitaId} a {Estado}", citaId, estado);

        var cita = await _db.Citas
            .Include(c => c.Turno).ThenInclude(t => t!.Agenda).ThenInclude(a => a!.Profesional)
            .Include(c => c.Turno).ThenInclude(t => t!.Agenda).ThenInclude(a => a!.Consultorio)
            .Include(c => c.Turnos)
            .Include(c => c.Estudio)
            .Include(c => c.Paciente)
            .Include(c => c.Observacion)
            .Include(c => c.Cuestionario)
            .FirstOrDefaultAsync(c => c.Id == citaId);

        if (cita == null)
        {
            _logger.LogWarning("Cita ID {CitaId} no encontrada", citaId);
            throw new CitaNotFoundException(citaId);
        }

        cita.Estado = estado;

        // Regla de Negocio RN-01: Si se cancela la cita, todos los turnos asociados pasan a estar Disponibles.
        var turnosDeCita = await _db.Turnos
            .Where(t => t.CitaId == cita.Id || t.Id == cita.TurnoId)
            .ToListAsync();

        if (estado == EstadoCita.Cancelada)
        {
            _logger.LogInformation("Cita cancelada: restableciendo {Cant} turnos a Disponible", turnosDeCita.Count);
            foreach (var t in turnosDeCita)
            {
                t.Estado = EstadoTurno.Disponible;
                t.CitaId = null;
            }
        }
        else if (estado == EstadoCita.Atendida)
        {
            foreach (var t in turnosDeCita)
            {
                t.Estado = EstadoTurno.Atendido;
            }
        }

        await _db.SaveChangesAsync();
        _logger.LogInformation("Estado de cita ID {CitaId} actualizado correctamente", cita.Id);

        return MapCitaDto(cita, cita.Turno!, cita.Paciente!, cita.Turno!.Agenda!.Profesional!);
    }

    public async Task BajaCitaAsync(int citaId)
    {
        _logger.LogInformation("Baja/cancelación de cita ID {CitaId}", citaId);
        await ModificarCitaEstadoAsync(citaId, EstadoCita.Cancelada);
    }

    public async Task<List<CitaResponseDto>> ObtenerCitasPacienteAsync(string pacienteCuil)
    {
        _logger.LogInformation("Obteniendo citas para paciente CUIL {Cuil}", pacienteCuil);

        var citas = await _db.Citas
            .Include(c => c.Paciente)
            .Include(c => c.Turno).ThenInclude(t => t!.Agenda).ThenInclude(a => a!.Profesional)
            .Include(c => c.Turno).ThenInclude(t => t!.Agenda).ThenInclude(a => a!.Consultorio)
            .Include(c => c.Turnos)
            .Include(c => c.Estudio)
            .Include(c => c.Observacion)
            .Include(c => c.Cuestionario)
            .Where(c => c.PacienteCuil == pacienteCuil)
            .ToListAsync();

        return citas.Select(c => MapCitaDto(c, c.Turno!, c.Paciente!, c.Turno!.Agenda!.Profesional!)).ToList();
    }

    public async Task<List<CitaResponseDto>> ObtenerCitasProfesionalAsync(string profesionalCuil, DateTime? fecha)
    {
        _logger.LogInformation("Obteniendo citas para profesional CUIL {Cuil} en fecha {Fecha}", profesionalCuil, fecha);

        var query = _db.Citas
            .Include(c => c.Paciente)
            .Include(c => c.Turno).ThenInclude(t => t!.Agenda).ThenInclude(a => a!.Profesional)
            .Include(c => c.Turno).ThenInclude(t => t!.Agenda).ThenInclude(a => a!.Consultorio)
            .Include(c => c.Turnos)
            .Include(c => c.Estudio)
            .Include(c => c.Observacion)
            .Include(c => c.Cuestionario)
            .Where(c => c.Turno!.Agenda!.ProfesionalCuil == profesionalCuil)
            .AsQueryable();

        if (fecha.HasValue)
        {
            var dt = fecha.Value.Date;
            query = query.Where(c => c.Fecha.Date == dt);
        }

        var citas = await query.ToListAsync();
        return citas.Select(c => MapCitaDto(c, c.Turno!, c.Paciente!, c.Turno!.Agenda!.Profesional!)).ToList();
    }

    public async Task<CitaResponseDto> ObtenerPorIdAsync(int citaId)
    {
        _logger.LogInformation("Obteniendo cita ID {CitaId}", citaId);

        var cita = await _db.Citas
            .Include(c => c.Paciente)
            .Include(c => c.Turno).ThenInclude(t => t!.Agenda).ThenInclude(a => a!.Profesional)
            .Include(c => c.Turno).ThenInclude(t => t!.Agenda).ThenInclude(a => a!.Consultorio)
            .Include(c => c.Turnos)
            .Include(c => c.Estudio)
            .Include(c => c.Observacion)
            .Include(c => c.Cuestionario)
            .FirstOrDefaultAsync(c => c.Id == citaId);

        if (cita == null)
        {
            _logger.LogWarning("Cita ID {CitaId} no encontrada", citaId);
            throw new CitaNotFoundException(citaId);
        }

        return MapCitaDto(cita, cita.Turno!, cita.Paciente!, cita.Turno!.Agenda!.Profesional!);
    }

    private static CitaResponseDto MapCitaDto(Cita c, Turno t, Paciente p, Profesional prof)
    {
        double? punt = c.Cuestionario != null
            ? Math.Round((c.Cuestionario.Puntualidad + c.Cuestionario.Atencion + c.Cuestionario.Profesionalismo) / 3.0, 2)
            : null;

        int cantidadTurnos = c.Turnos?.Count > 0 ? c.Turnos.Count : 1;

        return new CitaResponseDto(
            c.Id,
            t.Id,
            p.Cuil,
            $"{p.Nombre} {p.Apellido}",
            prof.Cuil,
            $"{prof.Nombre} {prof.Apellido}",
            c.Fecha,
            t.HoraInicio,
            t.HoraFin,
            c.Estado,
            c.Tipo,
            c.Cobertura,
            c.Observacion?.Motivo,
            c.Observacion?.Detalle,
            punt,
            c.EstudioId,
            c.Estudio?.Nombre,
            c.DocumentoPedidoMedico,
            cantidadTurnos
        );
    }
}
