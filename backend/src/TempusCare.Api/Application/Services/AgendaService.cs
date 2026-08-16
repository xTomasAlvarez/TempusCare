using Microsoft.EntityFrameworkCore;
using TempusCare.Api.Application.DTOs;
using TempusCare.Api.Application.Exceptions;
using TempusCare.Api.Domain.Entities;
using TempusCare.Api.Domain.Enums;
using TempusCare.Api.Infrastructure.Data;

namespace TempusCare.Api.Application.Services;

public class AgendaService : IAgendaService
{
    private readonly TempusCareDbContext _db;
    private readonly ILogger<AgendaService> _logger;

    public AgendaService(TempusCareDbContext db, ILogger<AgendaService> logger)
    {
        _db = db;
        _logger = logger;
    }

    public async Task<AgendaResponseDto> AltaAgendaAsync(AltaAgendaDto dto)
    {
        _logger.LogInformation("Iniciando creación de agenda para profesional {Cuil} en consultorio {Cons} para fecha {Dia}/{Mes}/{Anio}",
            dto.ProfesionalCuil, dto.CuitConsultorio, dto.Dia, dto.Mes, dto.Anio);

        var prof = await _db.Profesionales
            .Include(p => p.Especialidades).ThenInclude(e => e.Especialidad)
            .FirstOrDefaultAsync(p => p.Cuil == dto.ProfesionalCuil);

        if (prof == null)
        {
            _logger.LogWarning("Profesional con CUIL {Cuil} no encontrado", dto.ProfesionalCuil);
            throw new ProfesionalNotFoundException(dto.ProfesionalCuil);
        }

        var cons = await _db.Consultorios.FirstOrDefaultAsync(c => c.Cuit == dto.CuitConsultorio);
        if (cons == null)
        {
            _logger.LogWarning("Consultorio con CUIT {Cuit} no encontrado", dto.CuitConsultorio);
            throw new ConsultorioNotFoundException(dto.CuitConsultorio);
        }

        // RN-01: Un profesional no puede tener dos turnos/agendas superpuestas en la misma franja horaria.
        bool solapado = await _db.Agendas.AnyAsync(a =>
            a.ProfesionalCuil == dto.ProfesionalCuil &&
            a.Dia == dto.Dia && a.Mes == dto.Mes && a.Anio == dto.Anio &&
            ((dto.HoraEntrada >= a.HoraEntrada && dto.HoraEntrada < a.HoraSalida) ||
             (dto.HoraSalida > a.HoraEntrada && dto.HoraSalida <= a.HoraSalida) ||
             (dto.HoraEntrada <= a.HoraEntrada && dto.HoraSalida >= a.HoraSalida)));

        if (solapado)
        {
            _logger.LogWarning("RN-01 violada: solapamiento de agenda para profesional {Cuil}", dto.ProfesionalCuil);
            throw new ConflictException("RN-01: El profesional ya posee una agenda configurada que se solapa en esa franja horaria.");
        }

        var agenda = new Agenda
        {
            ProfesionalCuil = dto.ProfesionalCuil,
            ConsultorioCuit = dto.CuitConsultorio,
            Dia = dto.Dia,
            Mes = dto.Mes,
            Anio = dto.Anio,
            HoraEntrada = dto.HoraEntrada,
            HoraSalida = dto.HoraSalida
        };

        _db.Agendas.Add(agenda);
        await _db.SaveChangesAsync();

        // Generación automática de franjas horarias (Turnos)
        DateTime fechaBase = new DateTime(dto.Anio, dto.Mes, dto.Dia);
        TimeSpan tiempoActual = dto.HoraEntrada;
        int duracion = dto.DuracionTurnoMinutos > 0 ? dto.DuracionTurnoMinutos : 30;

        while (tiempoActual.Add(TimeSpan.FromMinutes(duracion)) <= dto.HoraSalida)
        {
            var turno = new Turno
            {
                AgendaId = agenda.Id,
                Fecha = fechaBase,
                HoraInicio = tiempoActual,
                HoraFin = tiempoActual.Add(TimeSpan.FromMinutes(duracion)),
                Estado = EstadoTurno.Disponible
            };
            _db.Turnos.Add(turno);
            tiempoActual = tiempoActual.Add(TimeSpan.FromMinutes(duracion));
        }

        await _db.SaveChangesAsync();

        int totalTurnos = await _db.Turnos.CountAsync(t => t.AgendaId == agenda.Id);
        _logger.LogInformation("Agenda ID {AgendaId} creada exitosamente con {TotalTurnos} turnos", agenda.Id, totalTurnos);

        return new AgendaResponseDto(
            agenda.Id,
            prof.Cuil,
            $"{prof.Nombre} {prof.Apellido}",
            prof.Matricula,
            cons.Cuit,
            cons.Nombre,
            agenda.Dia,
            agenda.Mes,
            agenda.Anio,
            agenda.HoraEntrada,
            agenda.HoraSalida,
            totalTurnos
        );
    }

    public async Task<AgendaResponseDto> ModificarAgendaAsync(ModificarAgendaDto dto)
    {
        _logger.LogInformation("Modificando agenda ID {IdAgenda}", dto.IdAgenda);

        var agenda = await _db.Agendas
            .Include(a => a.Profesional)
            .Include(a => a.Consultorio)
            .Include(a => a.Turnos)
            .FirstOrDefaultAsync(a => a.Id == dto.IdAgenda);

        if (agenda == null)
        {
            _logger.LogWarning("Agenda ID {IdAgenda} no encontrada", dto.IdAgenda);
            throw new AgendaNotFoundException(dto.IdAgenda);
        }

        agenda.HoraEntrada = dto.NuevaHoraEntrada;
        agenda.HoraSalida = dto.NuevaHoraSalida;

        await _db.SaveChangesAsync();
        _logger.LogInformation("Agenda ID {IdAgenda} modificada correctamente", agenda.Id);

        int cantTurnos = agenda.Turnos.Count;

        return new AgendaResponseDto(
            agenda.Id,
            agenda.ProfesionalCuil,
            $"{agenda.Profesional?.Nombre} {agenda.Profesional?.Apellido}",
            agenda.Profesional?.Matricula ?? "",
            agenda.ConsultorioCuit,
            agenda.Consultorio?.Nombre ?? "",
            agenda.Dia,
            agenda.Mes,
            agenda.Anio,
            agenda.HoraEntrada,
            agenda.HoraSalida,
            cantTurnos
        );
    }

    public async Task EliminarAgendaAsync(int idAgenda)
    {
        _logger.LogInformation("Eliminando agenda ID {IdAgenda}", idAgenda);

        var agenda = await _db.Agendas
            .Include(a => a.Turnos)
            .FirstOrDefaultAsync(a => a.Id == idAgenda);

        if (agenda == null)
        {
            _logger.LogWarning("Agenda ID {IdAgenda} no encontrada para eliminar", idAgenda);
            throw new AgendaNotFoundException(idAgenda);
        }

        _db.Agendas.Remove(agenda);
        await _db.SaveChangesAsync();
        _logger.LogInformation("Agenda ID {IdAgenda} eliminada", idAgenda);
    }

    public async Task<List<AgendaResponseDto>> ObtenerAgendasPorProfesionalAsync(string cuilOMatricula)
    {
        _logger.LogInformation("Buscando agendas para profesional por CUIL o Matrícula: {Identificador}", cuilOMatricula);

        var agendas = await _db.Agendas
            .Include(a => a.Profesional)
            .Include(a => a.Consultorio)
            .Include(a => a.Turnos)
            .Where(a => a.ProfesionalCuil == cuilOMatricula || (a.Profesional != null && a.Profesional.Matricula == cuilOMatricula))
            .ToListAsync();

        return agendas.Select(a => new AgendaResponseDto(
            a.Id,
            a.ProfesionalCuil,
            $"{a.Profesional?.Nombre} {a.Profesional?.Apellido}",
            a.Profesional?.Matricula ?? "",
            a.ConsultorioCuit,
            a.Consultorio?.Nombre ?? "",
            a.Dia,
            a.Mes,
            a.Anio,
            a.HoraEntrada,
            a.HoraSalida,
            a.Turnos.Count
        )).ToList();
    }
}
