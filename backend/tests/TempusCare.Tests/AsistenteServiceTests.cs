using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging.Abstractions;
using TempusCare.Api.Application.DTOs;
using TempusCare.Api.Application.Exceptions;
using TempusCare.Api.Application.Services;
using TempusCare.Api.Domain.Entities;
using TempusCare.Api.Infrastructure.Data;
using Xunit;

namespace TempusCare.Tests;

public class AsistenteServiceTests
{
    private TempusCareDbContext GetInMemoryDbContext(string dbName)
    {
        var options = new DbContextOptionsBuilder<TempusCareDbContext>()
            .UseInMemoryDatabase(dbName)
            .Options;
        return new TempusCareDbContext(options);
    }

    [Fact]
    public async Task AltaAsistente_Valido_GuardaConConsultorioYDireccion()
    {
        var db = GetInMemoryDbContext(nameof(AltaAsistente_Valido_GuardaConConsultorioYDireccion));
        var service = new AsistenteService(db, NullLogger<AsistenteService>.Instance);

        var cons = new Consultorio { Cuit = "30555444332", Nombre = "Sede Norte" };
        db.Consultorios.Add(cons);
        await db.SaveChangesAsync();

        var dto = new AltaAsistenteDto(
            "27333222110",
            "Carolina",
            "Molina",
            new DateTime(1992, 6, 15),
            "3815123456",
            "Femenino",
            "25 de Mayo",
            "300",
            "4A",
            "San Miguel de Tucumán",
            "Tucumán",
            "4000"
        );

        var res = await service.AltaAsistenteAsync(dto);

        Assert.NotNull(res);
        Assert.Equal("27333222110", res.Cuil);
        Assert.Equal("Carolina", res.Nombre);
        Assert.Contains("25 de Mayo 300", res.DireccionCompleta!);
    }

    [Fact]
    public async Task AltaAsistente_CuilDuplicado_ThrowsConflictException()
    {
        var db = GetInMemoryDbContext(nameof(AltaAsistente_CuilDuplicado_ThrowsConflictException));
        var service = new AsistenteService(db, NullLogger<AsistenteService>.Instance);

        db.Asistentes.Add(new Asistente { Cuil = "27999111222", Nombre = "Elena", Apellido = "Reyes" });
        await db.SaveChangesAsync();

        var dto = new AltaAsistenteDto("27999111222", "Otro", "Nombre", DateTime.Now, "111", "F", null, null, null, null, null, null);
        await Assert.ThrowsAsync<ConflictException>(() => service.AltaAsistenteAsync(dto));
    }

    [Fact]
    public async Task ModificarAsistente_Inexistente_ThrowsAsistenteNotFoundException()
    {
        var db = GetInMemoryDbContext(nameof(ModificarAsistente_Inexistente_ThrowsAsistenteNotFoundException));
        var service = new AsistenteService(db, NullLogger<AsistenteService>.Instance);

        var dto = new ModificarAsistenteDto("27000111222", "No", "Existe", DateTime.Now, "111", "F", null, null, null, null, null, null);
        await Assert.ThrowsAsync<AsistenteNotFoundException>(() => service.ModificarAsistenteAsync(dto));
    }

    [Fact]
    public async Task BajaAsistente_Existente_EliminaCorrectamente()
    {
        var db = GetInMemoryDbContext(nameof(BajaAsistente_Existente_EliminaCorrectamente));
        var service = new AsistenteService(db, NullLogger<AsistenteService>.Instance);

        db.Asistentes.Add(new Asistente { Cuil = "27888777666", Nombre = "A", Apellido = "B" });
        await db.SaveChangesAsync();

        await service.BajaAsistenteAsync("27888777666");

        var enDb = await db.Asistentes.FindAsync("27888777666");
        Assert.Null(enDb);
    }
}
