using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging.Abstractions;
using TempusCare.Api.Application.DTOs;
using TempusCare.Api.Application.Exceptions;
using TempusCare.Api.Application.Services;
using TempusCare.Api.Domain.Entities;
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
}
