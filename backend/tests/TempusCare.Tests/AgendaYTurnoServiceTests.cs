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
        var dto = new AltaAgendaDto("20111999888", "30111999888", 10, 10, 2026, new TimeSpan(8, 0, 0), new TimeSpan(10, 0, 0), 30);
        var agenda = await agendaService.AltaAgendaAsync(dto);

        Assert.NotNull(agenda);
        Assert.Equal(4, agenda.CantidadTurnos);

        var turnos = await turnoService.ObtenerTurnosDisponiblesAsync("20111999888", new DateTime(2026, 10, 10));
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

        var dto = new AltaAgendaDto("20222888777", "30222888777", 12, 10, 2026, new TimeSpan(9, 0, 0), new TimeSpan(10, 0, 0), 30);
        await agendaService.AltaAgendaAsync(dto);

        var turnos = await turnoService.ObtenerTurnosDisponiblesAsync("20222888777", new DateTime(2026, 10, 12));
        var turnoId = turnos.First().Id;

        // Modificar a Cancelado
        var modificado = await turnoService.ModificarTurnoAsync(turnoId, "Cancelado por mantenimiento", EstadoTurno.Cancelado);

        Assert.Equal(EstadoTurno.Cancelado, modificado.Estado);

        // Ahora solo debe haber 1 turno disponible (de los 2 iniciales)
        var disponibles = await turnoService.ObtenerTurnosDisponiblesAsync("20222888777", new DateTime(2026, 10, 12));
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

        var dto = new AltaAgendaDto("20333777666", "30333777666", 15, 10, 2026, new TimeSpan(14, 0, 0), new TimeSpan(15, 0, 0), 30);
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
}
