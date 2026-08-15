using Microsoft.EntityFrameworkCore;
using TempusCare.Api.Application.DTOs;
using TempusCare.Api.Application.Exceptions;
using TempusCare.Api.Application.Services;
using TempusCare.Api.Domain.Entities;
using TempusCare.Api.Domain.Enums;
using TempusCare.Api.Infrastructure.Data;
using Xunit;

namespace TempusCare.Tests;

public class BusinessRulesTests
{
    private TempusCareDbContext GetInMemoryDbContext(string dbName)
    {
        var options = new DbContextOptionsBuilder<TempusCareDbContext>()
            .UseInMemoryDatabase(dbName)
            .Options;
        return new TempusCareDbContext(options);
    }

    [Fact]
    public async Task RN01_AgendaOverlapping_ShouldThrowConflictException()
    {
        // Arrange
        var db = GetInMemoryDbContext(nameof(RN01_AgendaOverlapping_ShouldThrowConflictException));
        var agendaService = new AgendaService(db);

        db.Profesionales.Add(new Profesional { Cuil = "20123456789", Nombre = "Carlos", Apellido = "Pérez" });
        db.Consultorios.Add(new Consultorio { Cuit = "30999999999", Nombre = "Consultorio Central" });
        await db.SaveChangesAsync();

        var dto1 = new AltaAgendaDto("20123456789", "30999999999", 15, 8, 2026, new TimeSpan(9, 0, 0), new TimeSpan(12, 0, 0));
        await agendaService.AltaAgendaAsync(dto1);

        // Act & Assert (Solapamiento parcial)
        var dtoOverlapping = new AltaAgendaDto("20123456789", "30999999999", 15, 8, 2026, new TimeSpan(11, 0, 0), new TimeSpan(13, 0, 0));
        await Assert.ThrowsAsync<ConflictException>(() => agendaService.AltaAgendaAsync(dtoOverlapping));
    }

    [Fact]
    public async Task RN02_DoubleBookingTurno_ShouldThrowConflictException()
    {
        // Arrange
        var db = GetInMemoryDbContext(nameof(RN02_DoubleBookingTurno_ShouldThrowConflictException));
        var agendaService = new AgendaService(db);
        var turnoCitaService = new TurnoCitaService(db);

        db.Profesionales.Add(new Profesional { Cuil = "20111111111", Nombre = "Ana", Apellido = "Gómez" });
        db.Consultorios.Add(new Consultorio { Cuit = "30888888888", Nombre = "Clínica Norte" });
        db.Pacientes.Add(new Paciente { Cuil = "27222222222", Nombre = "Juan", Apellido = "López" });
        db.Pacientes.Add(new Paciente { Cuil = "27333333333", Nombre = "Maria", Apellido = "Sosa" });
        await db.SaveChangesAsync();

        var agendaDto = new AltaAgendaDto("20111111111", "30888888888", 20, 8, 2026, new TimeSpan(8, 0, 0), new TimeSpan(9, 0, 0), 30);
        var agendaRes = await agendaService.AltaAgendaAsync(agendaDto);

        var turnos = await turnoCitaService.ObtenerTurnosDisponiblesAsync("20111111111", new DateTime(2026, 8, 20));
        int primerTurnoId = turnos.First().Id;

        // Primer reserva
        var cita1 = await turnoCitaService.AltaCitaAsync(new AltaCitaDto("27222222222", "20111111111", primerTurnoId, TipoCita.Consulta, null));
        Assert.NotNull(cita1);

        // Intento de segunda reserva en el mismo turno
        await Assert.ThrowsAsync<ConflictException>(() =>
            turnoCitaService.AltaCitaAsync(new AltaCitaDto("27333333333", "20111111111", primerTurnoId, TipoCita.Consulta, null)));
    }

    [Fact]
    public async Task RN04_ObraSocialCoverageValidation_ShouldSetCoverageCorrectly()
    {
        // Arrange
        var db = GetInMemoryDbContext(nameof(RN04_ObraSocialCoverageValidation_ShouldSetCoverageCorrectly));
        var agendaService = new AgendaService(db);
        var turnoCitaService = new TurnoCitaService(db);

        var obraSocialAceptada = new ObraSocial { Id = 1, Nombre = "OSDE" };
        var obraSocialNoAceptada = new ObraSocial { Id = 2, Nombre = "Subsidio de Salud" };
        db.ObrasSociales.AddRange(obraSocialAceptada, obraSocialNoAceptada);

        var prof = new Profesional { Cuil = "20444444444", Nombre = "Elena", Apellido = "Torres" };
        prof.ObrasSociales.Add(new ProfesionalObraSocial { ProfesionalCuil = prof.Cuil, ObraSocialId = 1 });
        db.Profesionales.Add(prof);

        db.Consultorios.Add(new Consultorio { Cuit = "30777777777", Nombre = "Consultorio Sur" });
        db.Pacientes.Add(new Paciente { Cuil = "27555555555", Nombre = "Pedro", Apellido = "Rios" });
        await db.SaveChangesAsync();

        await agendaService.AltaAgendaAsync(new AltaAgendaDto("20444444444", "30777777777", 22, 8, 2026, new TimeSpan(10, 0, 0), new TimeSpan(11, 0, 0), 30));
        var turnos = await turnoCitaService.ObtenerTurnosDisponiblesAsync("20444444444", new DateTime(2026, 8, 22));

        // Reserva con obra social aceptada
        var cita1 = await turnoCitaService.AltaCitaAsync(new AltaCitaDto("27555555555", "20444444444", turnos[0].Id, TipoCita.Consulta, 1));
        Assert.Equal(CoberturaCita.ObraSocial, cita1.Cobertura);

        // Reserva con obra social NO aceptada por el médico (pasa a Particular sin bloquear)
        var cita2 = await turnoCitaService.AltaCitaAsync(new AltaCitaDto("27555555555", "20444444444", turnos[1].Id, TipoCita.Consulta, 2));
        Assert.Equal(CoberturaCita.Particular, cita2.Cobertura);
    }

    [Fact]
    public async Task CancelarCita_ShouldRevertTurnoToDisponible()
    {
        // Arrange
        var db = GetInMemoryDbContext(nameof(CancelarCita_ShouldRevertTurnoToDisponible));
        var agendaService = new AgendaService(db);
        var turnoCitaService = new TurnoCitaService(db);

        db.Profesionales.Add(new Profesional { Cuil = "20666666666", Nombre = "Marcos", Apellido = "Vazquez" });
        db.Consultorios.Add(new Consultorio { Cuit = "30666666666", Nombre = "Centro Medico" });
        db.Pacientes.Add(new Paciente { Cuil = "27666666666", Nombre = "Sofia", Apellido = "Diaz" });
        await db.SaveChangesAsync();

        await agendaService.AltaAgendaAsync(new AltaAgendaDto("20666666666", "30666666666", 25, 8, 2026, new TimeSpan(14, 0, 0), new TimeSpan(15, 0, 0), 30));
        var turnosDisponibles = await turnoCitaService.ObtenerTurnosDisponiblesAsync("20666666666", new DateTime(2026, 8, 25));

        var cita = await turnoCitaService.AltaCitaAsync(new AltaCitaDto("27666666666", "20666666666", turnosDisponibles[0].Id, TipoCita.Consulta, null));
        Assert.Equal(1, (await turnoCitaService.ObtenerTurnosDisponiblesAsync("20666666666", new DateTime(2026, 8, 25))).Count);

        // Cancelar Cita
        await turnoCitaService.BajaCitaAsync(cita.Id);

        // El turno debe haber vuelto a estar disponible
        var turnosNuevamenteDisponibles = await turnoCitaService.ObtenerTurnosDisponiblesAsync("20666666666", new DateTime(2026, 8, 25));
        Assert.Equal(2, turnosNuevamenteDisponibles.Count);
    }

    [Fact]
    public async Task CancelarTurnoPorMedico_ShouldAutomaticallyCancelAssociatedCita()
    {
        // Arrange
        var db = GetInMemoryDbContext(nameof(CancelarTurnoPorMedico_ShouldAutomaticallyCancelAssociatedCita));
        var agendaService = new AgendaService(db);
        var turnoCitaService = new TurnoCitaService(db);

        db.Profesionales.Add(new Profesional { Cuil = "20777777777", Nombre = "Hugo", Apellido = "Mendoza" });
        db.Consultorios.Add(new Consultorio { Cuit = "30555555555", Nombre = "Sanatorio Tucuman" });
        db.Pacientes.Add(new Paciente { Cuil = "27777777777", Nombre = "Lucia", Apellido = "Roldan" });
        await db.SaveChangesAsync();

        await agendaService.AltaAgendaAsync(new AltaAgendaDto("20777777777", "30555555555", 28, 8, 2026, new TimeSpan(16, 0, 0), new TimeSpan(17, 0, 0), 30));
        var turnos = await turnoCitaService.ObtenerTurnosDisponiblesAsync("20777777777", new DateTime(2026, 8, 28));

        var cita = await turnoCitaService.AltaCitaAsync(new AltaCitaDto("27777777777", "20777777777", turnos[0].Id, TipoCita.Consulta, null));

        // El médico cancela el turno por fuerza mayor
        await turnoCitaService.ModificarTurnoAsync(turnos[0].Id, "Cancelado por emergencia médica", EstadoTurno.Cancelado);

        var citaActualizada = (await turnoCitaService.ObtenerCitasPacienteAsync("27777777777")).First(c => c.Id == cita.Id);
        Assert.Equal(EstadoCita.Cancelada, citaActualizada.Estado);
    }
}
