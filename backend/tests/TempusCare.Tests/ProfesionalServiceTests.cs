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

public class ProfesionalServiceTests
{
    private TempusCareDbContext GetInMemoryDbContext(string dbName)
    {
        var options = new DbContextOptionsBuilder<TempusCareDbContext>()
            .UseInMemoryDatabase(dbName)
            .Options;
        return new TempusCareDbContext(options);
    }

    [Fact]
    public async Task AltaProfesional_Valido_GuardaYRetornaConEspecialidades()
    {
        var db = GetInMemoryDbContext(nameof(AltaProfesional_Valido_GuardaYRetornaConEspecialidades));
        var service = new ProfesionalService(db, NullLogger<ProfesionalService>.Instance);

        var esp = new Especialidad { Id = 1, Nombre = "Pediatría" };
        var cons = new Consultorio { Cuit = "30111111111", Nombre = "Consultorio A" };
        var os = new ObraSocial { Id = 10, Nombre = "OSDE" };
        db.Especialidades.Add(esp);
        db.Consultorios.Add(cons);
        db.ObrasSociales.Add(os);
        await db.SaveChangesAsync();

        var dto = new AltaProfesionalDto(
            "20111222333",
            "Martín",
            "Palermo",
            new DateTime(1973, 11, 7),
            "3815000000",
            "MP1234",
            "M",
            "Av. Aconquija",
            "1000",
            null,
            "Yerba Buena",
            "Tucumán",
            "4107",
            new List<int> { 1 },
            new List<string> { "30111111111" },
            new List<int> { 10 },
            null
        );

        var res = await service.AltaProfesionalAsync(dto);

        Assert.NotNull(res);
        Assert.Equal("20111222333", res.Cuil);
        Assert.Equal("Martín", res.Nombre);
        Assert.Single(res.Especialidades);
        Assert.Contains("Pediatría", res.Especialidades);
        Assert.Single(res.Consultorios);
        Assert.Single(res.ObrasSociales);
    }

    [Fact]
    public async Task AltaProfesional_CuilOMatriculaDuplicada_ThrowsConflictException()
    {
        var db = GetInMemoryDbContext(nameof(AltaProfesional_CuilOMatriculaDuplicada_ThrowsConflictException));
        var service = new ProfesionalService(db, NullLogger<ProfesionalService>.Instance);

        db.Profesionales.Add(new Profesional { Cuil = "20222333444", Nombre = "A", Apellido = "B", Matricula = "MP555" });
        await db.SaveChangesAsync();

        var dtoMismoCuil = new AltaProfesionalDto("20222333444", "Otro", "Otro", DateTime.Now, "111", "MP999", "M", null, null, null, null, null, null, null, null, null, null);
        await Assert.ThrowsAsync<ConflictException>(() => service.AltaProfesionalAsync(dtoMismoCuil));

        var dtoMismaMatricula = new AltaProfesionalDto("20777888999", "Otro", "Otro", DateTime.Now, "111", "MP555", "M", null, null, null, null, null, null, null, null, null, null);
        await Assert.ThrowsAsync<ConflictException>(() => service.AltaProfesionalAsync(dtoMismaMatricula));
    }

    [Fact]
    public async Task BajaProfesional_Existente_MarcaComoInactivo()
    {
        var db = GetInMemoryDbContext(nameof(BajaProfesional_Existente_MarcaComoInactivo));
        var service = new ProfesionalService(db, NullLogger<ProfesionalService>.Instance);

        db.Profesionales.Add(new Profesional { Cuil = "20333444555", Nombre = "Juan", Apellido = "Pérez", Matricula = "MP001", Estado = EstadoProfesional.Activo });
        await db.SaveChangesAsync();

        await service.BajaProfesionalAsync("20333444555");

        var prof = await db.Profesionales.FindAsync("20333444555");
        Assert.NotNull(prof);
        Assert.Equal(EstadoProfesional.Inactivo, prof.Estado);
    }

    [Fact]
    public async Task AsignarEstudio_ProfesionalInexistente_ThrowsProfesionalNotFoundException()
    {
        var db = GetInMemoryDbContext(nameof(AsignarEstudio_ProfesionalInexistente_ThrowsProfesionalNotFoundException));
        var service = new ProfesionalService(db, NullLogger<ProfesionalService>.Instance);

        var dto = new AsignarEstudioProfesionalDto(1, 30, 10000m, null);
        await Assert.ThrowsAsync<ProfesionalNotFoundException>(() => service.AsignarEstudioAsync("20000000000", dto));
    }

    [Fact]
    public async Task AsignarEstudio_EstudioInexistente_ThrowsEstudioNotFoundException()
    {
        var db = GetInMemoryDbContext(nameof(AsignarEstudio_EstudioInexistente_ThrowsEstudioNotFoundException));
        var service = new ProfesionalService(db, NullLogger<ProfesionalService>.Instance);

        db.Profesionales.Add(new Profesional { Cuil = "20444555666", Nombre = "Ana", Apellido = "Diaz", Matricula = "MP002" });
        await db.SaveChangesAsync();

        var dto = new AsignarEstudioProfesionalDto(999, 30, 10000m, null);
        await Assert.ThrowsAsync<EstudioNotFoundException>(() => service.AsignarEstudioAsync("20444555666", dto));
    }

    [Fact]
    public async Task DesasignarEstudio_Existente_RemueveEstudio()
    {
        var db = GetInMemoryDbContext(nameof(DesasignarEstudio_Existente_RemueveEstudio));
        var service = new ProfesionalService(db, NullLogger<ProfesionalService>.Instance);

        var prof = new Profesional { Cuil = "20555666777", Nombre = "Luis", Apellido = "Gómez", Matricula = "MP003" };
        var est = new Estudio { Id = 5, Nombre = "Radiografía" };
        db.Profesionales.Add(prof);
        db.Estudios.Add(est);
        db.ProfesionalEstudios.Add(new ProfesionalEstudio { ProfesionalCuil = prof.Cuil, EstudioId = est.Id, DuracionTurno = 20, PrecioParticular = 5000 });
        await db.SaveChangesAsync();

        await service.DesasignarEstudioAsync(prof.Cuil, est.Id);

        var estudios = await service.ObtenerEstudiosPorProfesionalAsync(prof.Cuil);
        Assert.Empty(estudios);
    }
}
