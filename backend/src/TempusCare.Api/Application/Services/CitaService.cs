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

        using var tx = _db.Database.IsRelational() ? await _db.Database.BeginTransactionAsync() : null;
        try
        {
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

            // RN-02, RF-PAC-07: Impedir reserva en fechas/horarios pasados
            if (turno.Fecha.Date.Add(turno.HoraInicio) <= DateTime.Now)
            {
                _logger.LogWarning("Intento de reserva en fecha/horario transcurrido ID {TurnoId} - Fecha: {Fecha:yyyy-MM-dd}, Hora: {HoraInicio}",
                    turno.Id, turno.Fecha.Date, turno.HoraInicio);
                throw new BusinessException("No es posible reservar un turno en un horario que ya ha transcurrido.");
            }

            // Ventana máxima de 6 meses
            if (turno.Fecha.Date > DateTime.Today.AddMonths(6))
            {
                _logger.LogWarning("Intento de reserva con más de 6 meses de antelación. Turno ID {TurnoId}, Fecha {Fecha:yyyy-MM-dd}", turno.Id, turno.Fecha);
                throw new BusinessException("Solo se permiten reservas y agendas con una antelación máxima de 6 meses.");
            }

            // Evitar doble turno simultáneo del mismo paciente en la misma fecha y franja horaria superpuesta
            var startOfDay = turno.Fecha.Date;
            var endOfDay = startOfDay.AddDays(1);
            var citasActivasMismoDia = await _db.Citas
                .Include(c => c.Turno)
                .Include(c => c.Turnos)
                .Where(c => c.PacienteCuil == paciente.Cuil &&
                            c.Fecha >= startOfDay && c.Fecha < endOfDay &&
                            (c.Estado == EstadoCita.Solicitada ||
                             c.Estado == EstadoCita.Confirmada ||
                             c.Estado == EstadoCita.EnSalaDeEspera ||
                             c.Estado == EstadoCita.EnAtencion))
                .ToListAsync();

            bool solapadoConOtraCita = citasActivasMismoDia.Any(c =>
            {
                var turnosDeEstaCita = c.Turnos?.Count > 0 ? c.Turnos : (c.Turno != null ? new List<Turno> { c.Turno } : new List<Turno>());
                return turnosDeEstaCita.Any(t => turno.HoraInicio < t.HoraFin && turno.HoraFin > t.HoraInicio);
            });

            if (solapadoConOtraCita)
            {
                _logger.LogWarning("El paciente {Cuil} ya posee otro turno activo superpuesto en fecha {Fecha:yyyy-MM-dd} y horario {Hora}", paciente.Cuil, turno.Fecha, turno.HoraInicio);
                throw new BusinessException("El paciente ya posee otro turno reservado en ese mismo día y horario.");
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
            turno.RowVersion = Guid.NewGuid();

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
                        sig.RowVersion = Guid.NewGuid();
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

            if (tx != null)
            {
                await tx.CommitAsync();
            }

            _logger.LogInformation("Cita médica creada exitosamente con ID {CitaId} cubriendo {Cant} turnos", cita.Id, turnosAdicionales.Count + 1);

            cita.Estudio = estudioObj;
            cita.Turnos = new List<Turno> { turno };
            foreach (var ta in turnosAdicionales) cita.Turnos.Add(ta);

            return MapCitaDto(cita, turno, paciente, prof);
        }
        catch (DbUpdateConcurrencyException ex)
        {
            if (tx != null) await tx.RollbackAsync();
            _logger.LogWarning(ex, "Conflicto de concurrencia detectado al reservar turno(s).");
            throw new ConflictException("El turno o una de sus franjas horarias fue modificado o reservado por otro usuario simultáneamente. Por favor, seleccione otro horario.");
        }
        catch (DbUpdateException ex)
        {
            if (tx != null) await tx.RollbackAsync();
            _logger.LogWarning(ex, "Violación de integridad al guardar la cita.");
            throw new ConflictException("No se pudo completar la reserva debido a un conflicto de asignación o disponibilidad del turno.");
        }
        catch
        {
            if (tx != null) await tx.RollbackAsync();
            throw;
        }
    }

    public async Task<CitaResponseDto> ModificarCitaEstadoAsync(int citaId, EstadoCita estado, string? userRol = null, bool forzarAtencionFueraDeHorario = false)
    {
        _logger.LogInformation("Modificando estado de cita ID {CitaId} a {Estado} (Rol: {Rol}, ForzarHorario: {Forzar})", citaId, estado, userRol, forzarAtencionFueraDeHorario);

        if (estado == EstadoCita.Atendida && string.Equals(userRol, "Asistente", StringComparison.OrdinalIgnoreCase))
        {
            _logger.LogWarning("Intento indebido de asistente para finalizar cita {CitaId} a Atendida", citaId);
            throw new BusinessException("Solo el profesional tratante puede finalizar la consulta mediante el registro de la evolución clínica.");
        }

        using var tx = _db.Database.IsRelational() ? await _db.Database.BeginTransactionAsync() : null;
        try
        {
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

            if (estado == EstadoCita.EnAtencion)
            {
                // Si ya se encuentra en atención, retornar idéntico estado sin error
                if (cita.Estado == EstadoCita.EnAtencion)
                {
                    return MapCitaDto(cita, cita.Turno!, cita.Paciente!, cita.Turno!.Agenda!.Profesional!);
                }

                // 1. Validación de Presencia: El paciente debe estar en Sala de Espera previamente
                if (cita.Estado != EstadoCita.EnSalaDeEspera)
                {
                    _logger.LogWarning("Intento de llamar al paciente para cita {CitaId} en estado {EstadoActual} sin registro previo en Sala de Espera.", cita.Id, cita.Estado);
                    throw new BusinessException("No se puede llamar al paciente porque aún no ha sido marcado como presente en la Sala de Espera por recepción.");
                }

                // 2. Validación de Horario / Rango de Tolerancia (±45 minutos)
                var hoy = DateTime.Today;
                var ahora = DateTime.Now;
                var horaActual = ahora.TimeOfDay;

                bool enHorarioValido = cita.Fecha.Date == hoy &&
                                       cita.Turno != null &&
                                       horaActual >= (cita.Turno.HoraInicio - TimeSpan.FromMinutes(45)) &&
                                       horaActual <= (cita.Turno.HoraFin + TimeSpan.FromMinutes(45));

                if (!enHorarioValido && !forzarAtencionFueraDeHorario)
                {
                    var horaTurnoStr = cita.Turno != null ? cita.Turno.HoraInicio.ToString(@"hh\:mm") : "el horario acordado";
                    var horaActualStr = ahora.ToString("HH:mm");
                    _logger.LogWarning("Intento de atención fuera de horario para cita {CitaId}. Turno: {HoraTurno}, Actual: {HoraActual}", cita.Id, horaTurnoStr, horaActualStr);
                    throw new BusinessException($"Aviso de Horario: Este turno está programado para las {horaTurnoStr} hs y actualmente son las {horaActualStr} hs. ¿Desea iniciar la atención fuera del horario estipulado?");
                }

                // 3. Regla de Negocio: Un médico solo puede atender a un paciente a la vez
                var profCuil = cita.Turno?.Agenda?.ProfesionalCuil;
                if (!string.IsNullOrEmpty(profCuil))
                {
                    bool yaAtendiendo = await _db.Citas
                        .Include(c => c.Turno).ThenInclude(t => t!.Agenda)
                        .AnyAsync(c => c.Id != cita.Id &&
                                       c.Estado == EstadoCita.EnAtencion &&
                                       c.Turno != null &&
                                       c.Turno.Agenda != null &&
                                       c.Turno.Agenda.ProfesionalCuil == profCuil);

                    if (yaAtendiendo)
                    {
                        _logger.LogWarning("Regla de negocio: El profesional {Cuil} ya se encuentra atendiendo a otro paciente.", profCuil);
                        throw new BusinessException("El profesional ya se encuentra atendiendo a un paciente en este momento. Debe finalizar la consulta actual antes de iniciar una nueva.");
                    }
                }
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
                    t.RowVersion = Guid.NewGuid();
                }
            }
            // Regla de Negocio: Si un paciente llega antes y es atendido previo a su horario agendado,
            // el sistema actualiza el horario futuro original como disponible para que otro paciente pueda reservarlo
            else if ((estado == EstadoCita.EnAtencion || estado == EstadoCita.Atendida) &&
                     cita.Fecha.Date == DateTime.Today &&
                     cita.Turno != null &&
                     DateTime.Now.TimeOfDay < cita.Turno.HoraInicio)
            {
                _logger.LogInformation("Atención anticipada para cita ID {CitaId}. Liberando turno original ID {TurnoId} ({Hora}) a Disponible",
                    cita.Id, cita.Turno.Id, cita.Turno.HoraInicio);

                foreach (var t in turnosDeCita)
                {
                    t.Estado = EstadoTurno.Disponible;
                    t.CitaId = null;
                    t.RowVersion = Guid.NewGuid();
                }
            }
            else if (estado == EstadoCita.Atendida)
            {
                foreach (var t in turnosDeCita)
                {
                    t.Estado = EstadoTurno.Atendido;
                    t.RowVersion = Guid.NewGuid();
                }
            }

            await _db.SaveChangesAsync();

            if (tx != null)
            {
                await tx.CommitAsync();
            }

            _logger.LogInformation("Estado de cita ID {CitaId} actualizado correctamente", cita.Id);

            return MapCitaDto(cita, cita.Turno!, cita.Paciente!, cita.Turno!.Agenda!.Profesional!);
        }
        catch
        {
            if (tx != null) await tx.RollbackAsync();
            throw;
        }
    }

    public async Task BajaCitaAsync(int citaId)
    {
        _logger.LogInformation("Baja/cancelación de cita ID {CitaId}", citaId);
        await ModificarCitaEstadoAsync(citaId, EstadoCita.Cancelada);
    }

    public async Task<List<CitaResponseDto>> ObtenerCitasPacienteAsync(string pacienteCuil)
    {
        _logger.LogInformation("Obteniendo citas para paciente CUIL {Cuil}", pacienteCuil);
        await ActualizarCitasVencidasAAusenteAsync();

        var citas = await _db.Citas
            .Include(c => c.Paciente)
            .Include(c => c.Turno).ThenInclude(t => t!.Agenda).ThenInclude(a => a!.Profesional).ThenInclude(p => p!.Especialidades).ThenInclude(e => e.Especialidad)
            .Include(c => c.Turno).ThenInclude(t => t!.Agenda).ThenInclude(a => a!.Consultorio)
            .Include(c => c.Turnos)
            .Include(c => c.Estudio)
            .Include(c => c.Observacion)
            .Include(c => c.Cuestionario)
            .Where(c => c.PacienteCuil == pacienteCuil)
            .ToListAsync();

        return citas.Select(c => MapCitaDto(c, c.Turno!, c.Paciente!, c.Turno!.Agenda!.Profesional!)).ToList();
    }

    public async Task<List<CitaResponseDto>> ObtenerCitasProfesionalAsync(string profesionalCuil, DateTime? fecha, string? consultorioCuit = null)
    {
        _logger.LogInformation("Obteniendo citas para profesional CUIL {Cuil} en fecha {Fecha} y consultorio {Cons}", profesionalCuil, fecha, consultorioCuit);
        await ActualizarCitasVencidasAAusenteAsync();

        var query = _db.Citas
            .Include(c => c.Paciente)
            .Include(c => c.Turno).ThenInclude(t => t!.Agenda).ThenInclude(a => a!.Profesional).ThenInclude(p => p!.Especialidades).ThenInclude(e => e.Especialidad)
            .Include(c => c.Turno).ThenInclude(t => t!.Agenda).ThenInclude(a => a!.Consultorio)
            .Include(c => c.Turnos)
            .Include(c => c.Estudio)
            .Include(c => c.Observacion)
            .Include(c => c.Cuestionario)
            .Where(c => c.Turno!.Agenda!.ProfesionalCuil == profesionalCuil)
            .AsQueryable();

        if (fecha.HasValue)
        {
            var startOfDay = fecha.Value.Date;
            var endOfDay = startOfDay.AddDays(1);
            query = query.Where(c => c.Fecha >= startOfDay && c.Fecha < endOfDay);
        }

        if (!string.IsNullOrEmpty(consultorioCuit))
        {
            query = query.Where(c => c.Turno!.Agenda!.ConsultorioCuit == consultorioCuit);
        }

        var citas = await query.ToListAsync();
        return citas.Select(c => MapCitaDto(c, c.Turno!, c.Paciente!, c.Turno!.Agenda!.Profesional!)).ToList();
    }

    public async Task<CitaResponseDto> ObtenerPorIdAsync(int citaId)
    {
        _logger.LogInformation("Obteniendo cita ID {CitaId}", citaId);
        await ActualizarCitasVencidasAAusenteAsync();

        var cita = await _db.Citas
            .Include(c => c.Paciente)
            .Include(c => c.Turno).ThenInclude(t => t!.Agenda).ThenInclude(a => a!.Profesional).ThenInclude(p => p!.Especialidades).ThenInclude(e => e.Especialidad)
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

    public async Task ActualizarCitasVencidasAAusenteAsync()
    {
        var hoy = DateTime.Today;
        var ahora = DateTime.Now;
        var limiteHoy = ahora.TimeOfDay - TimeSpan.FromHours(2);
        var manana = hoy.AddDays(1);

        // SQLite no traduce comparaciones de TimeSpan en SQL. Traemos candidatos con fecha <= hoy y evaluamos en memoria.
        var candidatos = await _db.Citas
            .Include(c => c.Turno)
            .Where(c => (c.Estado == EstadoCita.Solicitada || c.Estado == EstadoCita.Confirmada) &&
                        c.Fecha < manana)
            .ToListAsync();

        var citasVencidas = candidatos
            .Where(c => c.Fecha.Date < hoy || (c.Fecha.Date == hoy && c.Turno != null && c.Turno.HoraFin <= limiteHoy))
            .ToList();

        if (citasVencidas.Any())
        {
            foreach (var c in citasVencidas)
            {
                c.Estado = EstadoCita.Ausente;
            }
            await _db.SaveChangesAsync();
            _logger.LogInformation("Actualizadas automáticamente {Cant} citas vencidas a Ausente", citasVencidas.Count);
        }
    }

    private static CitaResponseDto MapCitaDto(Cita c, Turno t, Paciente p, Profesional prof)
    {
        double? punt = c.Cuestionario != null
            ? Math.Round((c.Cuestionario.Puntualidad + c.Cuestionario.Atencion + c.Cuestionario.Profesionalismo) / 3.0, 2)
            : null;

        int cantidadTurnos = c.Turnos?.Count > 0 ? c.Turnos.Count : 1;
        string? consultorioNombre = t.Agenda?.Consultorio?.Nombre;
        string? especialidadNombre = prof.Especialidades?.FirstOrDefault()?.Especialidad?.Nombre ?? (c.Estudio != null ? "Diagnóstico por Imágenes" : "Medicina General");

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
            cantidadTurnos,
            consultorioNombre,
            especialidadNombre
        );
    }
}
