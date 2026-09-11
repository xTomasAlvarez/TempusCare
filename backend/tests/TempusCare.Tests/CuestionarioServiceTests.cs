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

public class CuestionarioServiceTests
{
    private TempusCareDbContext GetInMemoryDbContext(string dbName)
    {
        var options = new DbContextOptionsBuilder<TempusCareDbContext>()
            .UseInMemoryDatabase(dbName)
            .Options;
        return new TempusCareDbContext(options);
    }

    [Fact]
    public async Task CompletarCuestionario_Valido_CalculaPromedioYPersiste()
    {
        var db = GetInMemoryDbContext(nameof(CompletarCuestionario_Valido_CalculaPromedioYPersiste));
        var service = new CuestionarioService(db, NullLogger<CuestionarioService>.Instance);

        var cita = new Cita
        {
            PacienteCuil = "27111222333",
            Fecha = DateTime.Now,
            Estado = EstadoCita.Atendida,
            Tipo = TipoCita.Consulta
        };
        db.Citas.Add(cita);
        await db.SaveChangesAsync();

        var dto = new CompletarCuestionarioDto(cita.Id, 5, 4, 5, "Excelente atención del médico");
        var res = await service.CompletarCuestionarioAsync(dto);

        Assert.NotNull(res);
        Assert.Equal(cita.Id, res.CitaId);
        Assert.Equal(5, res.Puntualidad);
        Assert.Equal(4, res.Atencion);
        Assert.Equal(5, res.Profesionalismo);
        // Promedio: (5+4+5)/3 = 4.67
        Assert.Equal(4.67, res.Promedio);
        Assert.Equal("Excelente atención del médico", res.Comentario);
    }

    [Fact]
    public async Task CompletarCuestionario_CitaInexistente_ThrowsCitaNotFoundException()
    {
        var db = GetInMemoryDbContext(nameof(CompletarCuestionario_CitaInexistente_ThrowsCitaNotFoundException));
        var service = new CuestionarioService(db, NullLogger<CuestionarioService>.Instance);

        var dto = new CompletarCuestionarioDto(9999, 5, 5, 5, null);
        await Assert.ThrowsAsync<CitaNotFoundException>(() => service.CompletarCuestionarioAsync(dto));
    }

    [Fact]
    public async Task CompletarCuestionario_YaRespondido_ThrowsConflictException()
    {
        var db = GetInMemoryDbContext(nameof(CompletarCuestionario_YaRespondido_ThrowsConflictException));
        var service = new CuestionarioService(db, NullLogger<CuestionarioService>.Instance);

        var cita = new Cita
        {
            PacienteCuil = "27111222333",
            Fecha = DateTime.Now,
            Estado = EstadoCita.Atendida,
            Tipo = TipoCita.Consulta
        };
        db.Citas.Add(cita);
        await db.SaveChangesAsync();

        var dto = new CompletarCuestionarioDto(cita.Id, 4, 4, 4, "Primer feedback");
        await service.CompletarCuestionarioAsync(dto);

        // Intento de responder nuevamente
        var dtoDuplicado = new CompletarCuestionarioDto(cita.Id, 5, 5, 5, "Segundo feedback");
        await Assert.ThrowsAsync<ConflictException>(() => service.CompletarCuestionarioAsync(dtoDuplicado));
    }

    [Fact]
    public async Task ObtenerPorCita_Existente_RetornaDto()
    {
        var db = GetInMemoryDbContext(nameof(ObtenerPorCita_Existente_RetornaDto));
        var service = new CuestionarioService(db, NullLogger<CuestionarioService>.Instance);

        var cita = new Cita { PacienteCuil = "27111", Fecha = DateTime.Now, Estado = EstadoCita.Atendida, Tipo = TipoCita.Consulta };
        db.Citas.Add(cita);
        await db.SaveChangesAsync();

        await service.CompletarCuestionarioAsync(new CompletarCuestionarioDto(cita.Id, 3, 3, 3, "Regular"));

        var res = await service.ObtenerPorCitaIdAsync(cita.Id);
        Assert.NotNull(res);
        Assert.Equal(3.0, res.Promedio);
    }
}
