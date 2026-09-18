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

public class CitaServiceTests
{
    private TempusCareDbContext GetInMemoryDbContext(string dbName)
    {
        var options = new DbContextOptionsBuilder<TempusCareDbContext>()
            .UseInMemoryDatabase(dbName)
            .Options;
        return new TempusCareDbContext(options);
    }

    [Fact]
    public async Task AltaCita_TurnoDisponible_CreaCitaYMarcaTurnoReservado()
    {
        var db = GetInMemoryDbContext(nameof(AltaCita_TurnoDisponible_CreaCitaYMarcaTurnoReservado));
        var citaService = new CitaService(db, NullLogger<CitaService>.Instance);

        var prof = new Profesional { Cuil = "20111222999", Nombre = "Esteban", Apellido = "Quito" };
        var cons = new Consultorio { Cuit = "30111222999", Nombre = "Consultorio Central" };
        var pac = new Paciente { Cuil = "27111222999", Nombre = "Clara", Apellido = "Soria" };
        var agenda = new Agenda { ProfesionalCuil = prof.Cuil, ConsultorioCuit = cons.Cuit, Dia = 15, Mes = 11, Anio = 2026, HoraEntrada = new TimeSpan(9, 0, 0), HoraSalida = new TimeSpan(10, 0, 0) };
        var turno = new Turno { Agenda = agenda, Fecha = new DateTime(2026, 11, 15, 9, 0, 0), HoraInicio = new TimeSpan(9, 0, 0), HoraFin = new TimeSpan(9, 30, 0), Estado = EstadoTurno.Disponible };

        db.Profesionales.Add(prof);
        db.Consultorios.Add(cons);
        db.Pacientes.Add(pac);
        db.Agendas.Add(agenda);
        db.Turnos.Add(turno);
        await db.SaveChangesAsync();

        var dto = new AltaCitaDto(pac.Cuil, prof.Cuil, turno.Id, TipoCita.Consulta, null, null);
        var cita = await citaService.AltaCitaAsync(dto);

        Assert.NotNull(cita);
        Assert.Equal(pac.Cuil, cita.PacienteCuil);
        Assert.Equal(prof.Cuil, cita.ProfesionalCuil);
        Assert.Equal(EstadoCita.Confirmada, cita.Estado);

        // Turno pasa a Reservado
        var turnoActualizado = await db.Turnos.FindAsync(turno.Id);
        Assert.Equal(EstadoTurno.Reservado, turnoActualizado?.Estado);
    }

    [Fact]
    public async Task AltaCita_PacienteInexistente_ThrowsPacienteNotFoundException()
    {
        var db = GetInMemoryDbContext(nameof(AltaCita_PacienteInexistente_ThrowsPacienteNotFoundException));
        var citaService = new CitaService(db, NullLogger<CitaService>.Instance);

        var turno = new Turno { Fecha = DateTime.Now, HoraInicio = new TimeSpan(9, 0, 0), HoraFin = new TimeSpan(9, 30, 0), Estado = EstadoTurno.Disponible };
        db.Turnos.Add(turno);
        await db.SaveChangesAsync();

        var dto = new AltaCitaDto("27000000000", "20000000000", turno.Id, TipoCita.Consulta, null, null);
        await Assert.ThrowsAsync<PacienteNotFoundException>(() => citaService.AltaCitaAsync(dto));
    }

    [Fact]
    public async Task AltaCita_TurnoInexistente_ThrowsTurnoNotFoundException()
    {
        var db = GetInMemoryDbContext(nameof(AltaCita_TurnoInexistente_ThrowsTurnoNotFoundException));
        var citaService = new CitaService(db, NullLogger<CitaService>.Instance);

        var prof = new Profesional { Cuil = "20000000000", Nombre = "Dr", Apellido = "Test" };
        var pac = new Paciente { Cuil = "27222333444", Nombre = "P", Apellido = "Q" };
        db.Profesionales.Add(prof);
        db.Pacientes.Add(pac);
        await db.SaveChangesAsync();

        var dto = new AltaCitaDto(pac.Cuil, prof.Cuil, 9999, TipoCita.Consulta, null, null);
        await Assert.ThrowsAsync<TurnoNotFoundException>(() => citaService.AltaCitaAsync(dto));
    }

    private async Task<(CitaResponseDto Cita, Turno Turno)> CrearCitaValidaAsync(TempusCareDbContext db, CitaService citaService, string testSuffix)
    {
        var prof = new Profesional { Cuil = $"20{testSuffix}", Nombre = "Prof", Apellido = "Test" };
        var cons = new Consultorio { Cuit = $"30{testSuffix}", Nombre = "Cons Test" };
        var pac = new Paciente { Cuil = $"27{testSuffix}", Nombre = "Pac", Apellido = "Test" };
        var agenda = new Agenda { ProfesionalCuil = prof.Cuil, ConsultorioCuit = cons.Cuit, Dia = 1, Mes = 1, Anio = 2026, HoraEntrada = new TimeSpan(8, 0, 0), HoraSalida = new TimeSpan(9, 0, 0) };
        var turno = new Turno { Agenda = agenda, Fecha = new DateTime(2026, 1, 1, 8, 0, 0), HoraInicio = new TimeSpan(8, 0, 0), HoraFin = new TimeSpan(8, 30, 0), Estado = EstadoTurno.Disponible };

        db.Profesionales.Add(prof);
        db.Consultorios.Add(cons);
        db.Pacientes.Add(pac);
        db.Agendas.Add(agenda);
        db.Turnos.Add(turno);
        await db.SaveChangesAsync();

        var cita = await citaService.AltaCitaAsync(new AltaCitaDto(pac.Cuil, prof.Cuil, turno.Id, TipoCita.Consulta, null, null));
        return (cita, turno);
    }

    [Fact]
    public async Task CancelarCita_Existente_LiberaTurnoYMarcaCitaCancelada()
    {
        var db = GetInMemoryDbContext(nameof(CancelarCita_Existente_LiberaTurnoYMarcaCitaCancelada));
        var citaService = new CitaService(db, NullLogger<CitaService>.Instance);

        var (cita, turno) = await CrearCitaValidaAsync(db, citaService, "991000000");

        await citaService.BajaCitaAsync(cita.Id);

        var citaActualizada = await db.Citas.FindAsync(cita.Id);
        Assert.Equal(EstadoCita.Cancelada, citaActualizada?.Estado);

        var turnoActualizado = await db.Turnos.FindAsync(turno.Id);
        Assert.Equal(EstadoTurno.Disponible, turnoActualizado?.Estado);
    }

    [Fact]
    public async Task ModificarEstadoCita_ACompletada_ActualizaCorrectamente()
    {
        var db = GetInMemoryDbContext(nameof(ModificarEstadoCita_ACompletada_ActualizaCorrectamente));
        var citaService = new CitaService(db, NullLogger<CitaService>.Instance);

        var (cita, _) = await CrearCitaValidaAsync(db, citaService, "992000000");

        var modificado = await citaService.ModificarCitaEstadoAsync(cita.Id, EstadoCita.Atendida);
        Assert.Equal(EstadoCita.Atendida, modificado.Estado);
    }
}
