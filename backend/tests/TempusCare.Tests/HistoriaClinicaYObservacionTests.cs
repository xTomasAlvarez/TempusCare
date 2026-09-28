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

public class HistoriaClinicaYObservacionTests
{
    private TempusCareDbContext GetInMemoryDbContext(string dbName)
    {
        var options = new DbContextOptionsBuilder<TempusCareDbContext>()
            .UseInMemoryDatabase(dbName)
            .Options;
        return new TempusCareDbContext(options);
    }

    [Fact]
    public async Task AltaHistoriaClinica_Valida_GuardaYAsociaConPaciente()
    {
        var db = GetInMemoryDbContext(nameof(AltaHistoriaClinica_Valida_GuardaYAsociaConPaciente));
        var hcService = new HistoriaClinicaService(db, NullLogger<HistoriaClinicaService>.Instance);

        db.Pacientes.Add(new Paciente { Cuil = "27111222444", Nombre = "Florencia", Apellido = "Vargas" });
        await db.SaveChangesAsync();

        var dto = new AltaHistoriaClinicaDto("27111222444", "Ninguna", "A+", "Polen", "Asma", "Salbutamol", "Padre", "Vargas", "3815009988");
        var hc = await hcService.AltaHistoriaClinicaAsync(dto);

        Assert.NotNull(hc);
        Assert.Equal("27111222444", hc.PacienteCuil);
        Assert.Equal("Florencia Vargas", hc.PacienteNombreCompleto);
        Assert.Equal("A+", hc.GrupSang);
        Assert.Equal("Polen", hc.Alergias);
    }

    [Fact]
    public async Task AltaHistoriaClinica_PacienteInexistente_ThrowsPacienteNotFoundException()
    {
        var db = GetInMemoryDbContext(nameof(AltaHistoriaClinica_PacienteInexistente_ThrowsPacienteNotFoundException));
        var hcService = new HistoriaClinicaService(db, NullLogger<HistoriaClinicaService>.Instance);

        var dto = new AltaHistoriaClinicaDto("27000000000", "Ninguna", "0+", "Ninguna", "Ninguna", "Ninguna", "Tutor", "Test", "123");
        await Assert.ThrowsAsync<PacienteNotFoundException>(() => hcService.AltaHistoriaClinicaAsync(dto));
    }

    [Fact]
    public async Task AltaHistoriaClinica_YaExiste_ThrowsConflictException()
    {
        var db = GetInMemoryDbContext(nameof(AltaHistoriaClinica_YaExiste_ThrowsConflictException));
        var hcService = new HistoriaClinicaService(db, NullLogger<HistoriaClinicaService>.Instance);

        db.Pacientes.Add(new Paciente { Cuil = "27222333555", Nombre = "Gabriel", Apellido = "Sosa" });
        await db.SaveChangesAsync();

        var dto = new AltaHistoriaClinicaDto("27222333555", "Ninguna", "B+", "Ninguna", "Ninguna", "Ninguna", "Tutor", "Sosa", "123");
        await hcService.AltaHistoriaClinicaAsync(dto);

        // Intento de crear segunda historia clínica para el mismo paciente
        await Assert.ThrowsAsync<ConflictException>(() => hcService.AltaHistoriaClinicaAsync(dto));
    }

    [Fact]
    public async Task CompletarObservacion_Valida_RegistraEnHistoriaClinica()
    {
        var db = GetInMemoryDbContext(nameof(CompletarObservacion_Valida_RegistraEnHistoriaClinica));
        var obsService = new ObservacionService(db, NullLogger<ObservacionService>.Instance);

        var pac = new Paciente { Cuil = "27333444666", Nombre = "Marcos", Apellido = "Diaz" };
        var prof = new Profesional { Cuil = "20333444666", Nombre = "Dr. Raul", Apellido = "Alfaro" };
        var hc = new HistoriaClinica { PacienteCuil = pac.Cuil };

        db.Pacientes.Add(pac);
        db.Profesionales.Add(prof);
        db.HistoriasClinicas.Add(hc);
        await db.SaveChangesAsync();

        var dto = new CompletarObservacionDto(
            null,
            hc.Id,
            prof.Cuil,
            "Consulta general por dolor abdominal",
            "Se indica dieta blanda y ecografía de control"
        );

        var obs = await obsService.CompletarObservacionAsync(dto);

        Assert.NotNull(obs);
        Assert.Equal("Consulta general por dolor abdominal", obs.Motivo);
        Assert.Equal(prof.Cuil, obs.ProfesionalCuil);

        var lista = await obsService.ObtenerObservacionesPorHistoriaClinicaAsync(hc.Id);
        Assert.Single(lista);
    }

    [Fact]
    public async Task CompletarObservacion_CitaEnEstadoPendiente_ActualizaAtomicamenteA_Atendida()
    {
        var db = GetInMemoryDbContext(nameof(CompletarObservacion_CitaEnEstadoPendiente_ActualizaAtomicamenteA_Atendida));
        var obsService = new ObservacionService(db, NullLogger<ObservacionService>.Instance);

        var pac = new Paciente { Cuil = "27444555777", Nombre = "Elena", Apellido = "Vargas" };
        var prof = new Profesional { Cuil = "20444555777", Nombre = "Dr. Martin", Apellido = "Palermo" };
        var cons = new Consultorio { Cuit = "30444555777", Nombre = "Centro Médico Oeste" };
        var hc = new HistoriaClinica { PacienteCuil = pac.Cuil };
        var agenda = new Agenda { ProfesionalCuil = prof.Cuil, ConsultorioCuit = cons.Cuit, Dia = 15, Mes = 10, Anio = 2026, HoraEntrada = new TimeSpan(9, 0, 0), HoraSalida = new TimeSpan(10, 0, 0) };
        var turno = new Turno { Agenda = agenda, Fecha = new DateTime(2026, 10, 15), HoraInicio = new TimeSpan(9, 0, 0), HoraFin = new TimeSpan(9, 30, 0), Estado = EstadoTurno.Reservado };

        var cita = new Cita
        {
            Turno = turno,
            PacienteCuil = pac.Cuil,
            Fecha = new DateTime(2026, 10, 15),
            Estado = EstadoCita.Solicitada, // Cita en estado Pendiente
            Tipo = TipoCita.Consulta,
            Cobertura = CoberturaCita.Particular
        };

        db.Pacientes.Add(pac);
        db.Profesionales.Add(prof);
        db.Consultorios.Add(cons);
        db.HistoriasClinicas.Add(hc);
        db.Agendas.Add(agenda);
        db.Turnos.Add(turno);
        db.Citas.Add(cita);
        await db.SaveChangesAsync();

        // Vincular cita al turno
        turno.CitaId = cita.Id;
        cita.TurnoId = turno.Id;
        await db.SaveChangesAsync();

        // Act: El médico completa la evolución clínica
        var dto = new CompletarObservacionDto(
            cita.Id,
            hc.Id,
            prof.Cuil,
            "Evaluación clínica por cuadro febril",
            "Faringitis aguda. Se prescribe amoxicilina e ibuprofeno."
        );

        var obs = await obsService.CompletarObservacionAsync(dto);

        // Assert: Transición atómica de Pendiente -> Atendida
        Assert.NotNull(obs);
        var citaDb = await db.Citas.FindAsync(cita.Id);
        var turnoDb = await db.Turnos.FindAsync(turno.Id);

        Assert.Equal(EstadoCita.Atendida, citaDb?.Estado);
        Assert.Equal(EstadoTurno.Atendido, turnoDb?.Estado);
    }
}
