using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging.Abstractions;
using TempusCare.Api.Application.DTOs;
using TempusCare.Api.Application.Exceptions;
using TempusCare.Api.Application.Services;
using TempusCare.Api.Domain.Entities;
using TempusCare.Api.Domain.Enums;
using TempusCare.Api.Infrastructure.Data;
using Xunit;

namespace TempusCare.Tests;

public class AgendaYTurnoServiceTests
{
    private TempusCareDbContext GetInMemoryDbContext(string dbName)
    {
        var options = new DbContextOptionsBuilder<TempusCareDbContext>()
            .UseInMemoryDatabase(dbName)
            .Options;
        return new TempusCareDbContext(options);
    }

    [Fact]
    public async Task AltaAgenda_GeneraCantidadCorrectaDeTurnosDisponibles()
    {
        var db = GetInMemoryDbContext(nameof(AltaAgenda_GeneraCantidadCorrectaDeTurnosDisponibles));
        var agendaService = new AgendaService(db, NullLogger<AgendaService>.Instance);
        var turnoService = new TurnoService(db, NullLogger<TurnoService>.Instance);

        db.Profesionales.Add(new Profesional { Cuil = "20111999888", Nombre = "Dr.", Apellido = "Test" });
        db.Consultorios.Add(new Consultorio { Cuit = "30111999888", Nombre = "Sede A" });
        await db.SaveChangesAsync();

        // 8:00 a 10:00 con turnos de 30 min => 4 turnos (8:00, 8:30, 9:00, 9:30)
        var dto = new AltaAgendaDto("20111999888", "30111999888", DateTime.Today.AddDays(15).Day, DateTime.Today.AddDays(15).Month, DateTime.Today.AddDays(15).Year, new TimeSpan(8, 0, 0), new TimeSpan(10, 0, 0), 30);
        var agenda = await agendaService.AltaAgendaAsync(dto);

        Assert.NotNull(agenda);
        Assert.Equal(4, agenda.CantidadTurnos);

        var turnos = await turnoService.ObtenerTurnosDisponiblesAsync("20111999888", DateTime.Today.AddDays(15));
        Assert.Equal(4, turnos.Count);
        Assert.All(turnos, t => Assert.Equal(EstadoTurno.Disponible, t.Estado));
    }

    [Fact]
    public async Task ModificarTurno_CancelarTurno_ActualizaEstado()
    {
        var db = GetInMemoryDbContext(nameof(ModificarTurno_CancelarTurno_ActualizaEstado));
        var agendaService = new AgendaService(db, NullLogger<AgendaService>.Instance);
        var turnoService = new TurnoService(db, NullLogger<TurnoService>.Instance);

        db.Profesionales.Add(new Profesional { Cuil = "20222888777", Nombre = "Dr.", Apellido = "B" });
        db.Consultorios.Add(new Consultorio { Cuit = "30222888777", Nombre = "Sede B" });
        await db.SaveChangesAsync();

        var dto = new AltaAgendaDto("20222888777", "30222888777", DateTime.Today.AddDays(20).Day, DateTime.Today.AddDays(20).Month, DateTime.Today.AddDays(20).Year, new TimeSpan(9, 0, 0), new TimeSpan(10, 0, 0), 30);
        await agendaService.AltaAgendaAsync(dto);

        var turnos = await turnoService.ObtenerTurnosDisponiblesAsync("20222888777", DateTime.Today.AddDays(20));
        var turnoId = turnos.First().Id;

        // Modificar a Cancelado
        var modificado = await turnoService.ModificarTurnoAsync(turnoId, "Cancelado por mantenimiento", EstadoTurno.Cancelado);

        Assert.Equal(EstadoTurno.Cancelado, modificado.Estado);

        // Ahora solo debe haber 1 turno disponible (de los 2 iniciales)
        var disponibles = await turnoService.ObtenerTurnosDisponiblesAsync("20222888777", DateTime.Today.AddDays(20));
        Assert.Single(disponibles);
    }

    [Fact]
    public async Task EliminarAgenda_RemueveAgendaYTurnos()
    {
        var db = GetInMemoryDbContext(nameof(EliminarAgenda_RemueveAgendaYTurnos));
        var agendaService = new AgendaService(db, NullLogger<AgendaService>.Instance);

        db.Profesionales.Add(new Profesional { Cuil = "20333777666", Nombre = "Dr.", Apellido = "C" });
        db.Consultorios.Add(new Consultorio { Cuit = "30333777666", Nombre = "Sede C" });
        await db.SaveChangesAsync();

        var dto = new AltaAgendaDto("20333777666", "30333777666", DateTime.Today.AddDays(5).Day, DateTime.Today.AddDays(5).Month, DateTime.Today.AddDays(5).Year, new TimeSpan(14, 0, 0), new TimeSpan(15, 0, 0), 30);
        var agenda = await agendaService.AltaAgendaAsync(dto);

        await agendaService.EliminarAgendaAsync(agenda.Id);

        var agendas = await agendaService.ObtenerAgendasPorProfesionalAsync("20333777666");
        Assert.Empty(agendas);

        var turnosEnDb = await db.Turnos.Where(t => t.AgendaId == agenda.Id).ToListAsync();
        Assert.Empty(turnosEnDb);
    }

    [Fact]
    public async Task ModificarAgenda_Inexistente_ThrowsAgendaNotFoundException()
    {
        var db = GetInMemoryDbContext(nameof(ModificarAgenda_Inexistente_ThrowsAgendaNotFoundException));
        var agendaService = new AgendaService(db, NullLogger<AgendaService>.Instance);

        var dto = new ModificarAgendaDto(999, new TimeSpan(8, 0, 0), new TimeSpan(12, 0, 0));
        await Assert.ThrowsAsync<AgendaNotFoundException>(() => agendaService.ModificarAgendaAsync(dto));
    }

    [Fact]
    public async Task ObtenerTurnoPorId_Inexistente_ThrowsTurnoNotFoundException()
    {
        var db = GetInMemoryDbContext(nameof(ObtenerTurnoPorId_Inexistente_ThrowsTurnoNotFoundException));
        var turnoService = new TurnoService(db, NullLogger<TurnoService>.Instance);

        await Assert.ThrowsAsync<TurnoNotFoundException>(() => turnoService.ObtenerPorIdAsync(9999));
    }

    [Fact]
    public async Task ObtenerTurnosDisponibles_Hoy_FiltraHorariosPasadosYDevuelveSoloFuturos()
    {
        // Arrange
        var db = GetInMemoryDbContext(nameof(ObtenerTurnosDisponibles_Hoy_FiltraHorariosPasadosYDevuelveSoloFuturos));
        var turnoService = new TurnoService(db, NullLogger<TurnoService>.Instance);

        var profCuil = "20999888777";
        var consCuit = "30999888777";
        db.Profesionales.Add(new Profesional { Cuil = profCuil, Nombre = "Dr.", Apellido = "Horarios" });
        db.Consultorios.Add(new Consultorio { Cuit = consCuit, Nombre = "Sede Horarios" });

        var hoy = DateTime.Today;
        var agenda = new Agenda
        {
            ProfesionalCuil = profCuil,
            ConsultorioCuit = consCuit,
            Dia = hoy.Day,
            Mes = hoy.Month,
            Anio = hoy.Year,
            HoraEntrada = new TimeSpan(0, 0, 0),
            HoraSalida = new TimeSpan(23, 59, 59)
        };
        db.Agendas.Add(agenda);
        await db.SaveChangesAsync();

        // Turno en horario pasado (1 hora antes de medianoche o hace 1 hora si no es madrugada)
        var horaPasada = DateTime.Now.TimeOfDay > TimeSpan.FromHours(1) 
            ? DateTime.Now.TimeOfDay.Subtract(TimeSpan.FromHours(1)) 
            : new TimeSpan(0, 0, 0);

        // Turno en horario futuro (cerca del final del día)
        var horaFutura = new TimeSpan(23, 30, 0);

        db.Turnos.Add(new Turno
        {
            AgendaId = agenda.Id,
            Fecha = hoy,
            HoraInicio = horaPasada,
            HoraFin = horaPasada.Add(TimeSpan.FromMinutes(30)),
            Estado = EstadoTurno.Disponible
        });

        db.Turnos.Add(new Turno
        {
            AgendaId = agenda.Id,
            Fecha = hoy,
            HoraInicio = horaFutura,
            HoraFin = horaFutura.Add(TimeSpan.FromMinutes(30)),
            Estado = EstadoTurno.Disponible
        });

        await db.SaveChangesAsync();

        // Act
        var disponibles = await turnoService.ObtenerTurnosDisponiblesAsync(profCuil, hoy);

        // Assert
        Assert.Single(disponibles);
        Assert.Equal(horaFutura, disponibles[0].HoraInicio);
    }

    [Fact]
    public async Task AltaAgenda_FechaMayorA6Meses_LanzaBusinessException()
    {
        var db = GetInMemoryDbContext(nameof(AltaAgenda_FechaMayorA6Meses_LanzaBusinessException));
        var agendaService = new AgendaService(db, NullLogger<AgendaService>.Instance);

        db.Profesionales.Add(new Profesional { Cuil = "20111999881", Nombre = "Dr.", Apellido = "Test" });
        db.Consultorios.Add(new Consultorio { Cuit = "30111999881", Nombre = "Sede A" });
        await db.SaveChangesAsync();

        var fechaInvalida = DateTime.Today.AddMonths(7);
        var dto = new AltaAgendaDto("20111999881", "30111999881", fechaInvalida.Day, fechaInvalida.Month, fechaInvalida.Year, new TimeSpan(8, 0, 0), new TimeSpan(12, 0, 0), 30);
        var ex = await Assert.ThrowsAsync<BusinessException>(() => agendaService.AltaAgendaAsync(dto));
        Assert.Contains("antelación máxima de 6 meses", ex.Message);
    }

    [Fact]
    public async Task AltaAgenda_ConPausaDescanso_ExcluyeTurnosEnFranjaDeDescanso()
    {
        var db = GetInMemoryDbContext(nameof(AltaAgenda_ConPausaDescanso_ExcluyeTurnosEnFranjaDeDescanso));
        var agendaService = new AgendaService(db, NullLogger<AgendaService>.Instance);
        var turnoService = new TurnoService(db, NullLogger<TurnoService>.Instance);

        db.Profesionales.Add(new Profesional { Cuil = "20111999882", Nombre = "Dr.", Apellido = "Test" });
        db.Consultorios.Add(new Consultorio { Cuit = "30111999882", Nombre = "Sede A" });
        await db.SaveChangesAsync();

        var fechaPrueba = DateTime.Today.AddDays(10);
        // Jornada de 08:00 a 14:00 (6 hs = 12 slots), pero con descanso de 10:00 a 11:00 (excluye 2 slots: 10:00 y 10:30) => 10 slots
        var dto = new AltaAgendaDto(
            "20111999882",
            "30111999882",
            fechaPrueba.Day,
            fechaPrueba.Month,
            fechaPrueba.Year,
            new TimeSpan(8, 0, 0),
            new TimeSpan(14, 0, 0),
            30,
            new TimeSpan(10, 0, 0),
            new TimeSpan(11, 0, 0)
        );

        var agenda = await agendaService.AltaAgendaAsync(dto);
        Assert.Equal(10, agenda.CantidadTurnos);

        var turnos = await turnoService.ObtenerTurnosDisponiblesAsync("20111999882", fechaPrueba);
        Assert.Equal(10, turnos.Count);
        Assert.DoesNotContain(turnos, t => t.HoraInicio >= new TimeSpan(10, 0, 0) && t.HoraInicio < new TimeSpan(11, 0, 0));
    }
}
