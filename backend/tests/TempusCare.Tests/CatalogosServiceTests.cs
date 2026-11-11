using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging.Abstractions;
using TempusCare.Api.Application.DTOs;
using TempusCare.Api.Application.Exceptions;
using TempusCare.Api.Application.Services;
using TempusCare.Api.Infrastructure.Data;
using Xunit;

namespace TempusCare.Tests;

public class CatalogosServiceTests
{
    private TempusCareDbContext GetInMemoryDbContext(string dbName)
    {
        var options = new DbContextOptionsBuilder<TempusCareDbContext>()
            .UseInMemoryDatabase(dbName)
            .Options;
        return new TempusCareDbContext(options);
    }

    [Fact]
    public async Task EspecialidadService_CRUD_FlujoCompleto()
    {
        var db = GetInMemoryDbContext(nameof(EspecialidadService_CRUD_FlujoCompleto));
        var service = new EspecialidadService(db, NullLogger<EspecialidadService>.Instance);

        // Alta
        var res = await service.AltaEspecialidadAsync(new AltaEspecialidadDto("Neurología", "Sistema nervioso"));
        Assert.NotNull(res);
        Assert.Equal("Neurología", res.Nombre);

        // Modificar
        var mod = await service.ModificarEspecialidadAsync(new ModificarEspecialidadDto(res.Id, "Neurología Clínica", "Sistema nervioso central y periférico"));
        Assert.Equal("Neurología Clínica", mod.Nombre);

        // Obtener Por ID
        var obtenida = await service.ObtenerPorIdAsync(res.Id);
        Assert.Equal("Neurología Clínica", obtenida.Nombre);

        // Baja
        await service.EliminarEspecialidadAsync(res.Id);
        await Assert.ThrowsAsync<EspecialidadNotFoundException>(() => service.ObtenerPorIdAsync(res.Id));
    }

    [Fact]
    public async Task EstudioService_CRUD_FlujoCompleto()
    {
        var db = GetInMemoryDbContext(nameof(EstudioService_CRUD_FlujoCompleto));
        var service = new EstudioService(db, NullLogger<EstudioService>.Instance);

        // Alta
        var res = await service.AltaEstudioAsync(new AltaEstudioDto("Tomografía Computada", "Cortes axiales", 30, "Con contraste"));
        Assert.NotNull(res);
        Assert.Equal("Tomografía Computada", res.Nombre);

        // Modificar
        var mod = await service.ModificarEstudioAsync(new ModificarEstudioDto(res.Id, "TC de Tórax", "Tomografía axial computada de tórax", 25, "Ayuno"));
        Assert.Equal("TC de Tórax", mod.Nombre);

        // Obtener Por ID
        var obtenida = await service.ObtenerPorIdAsync(res.Id);
        Assert.Equal(25, obtenida.Duracion);

        // Baja
        await service.BajaEstudioAsync(res.Id);
        await Assert.ThrowsAsync<EstudioNotFoundException>(() => service.ObtenerPorIdAsync(res.Id));
    }

    [Fact]
    public async Task ObraSocialService_CRUD_FlujoCompleto()
    {
        var db = GetInMemoryDbContext(nameof(ObraSocialService_CRUD_FlujoCompleto));
        var service = new ObraSocialService(db, NullLogger<ObraSocialService>.Instance);

        // Alta
        var res = await service.AltaObraSocialAsync(new AltaObraSocialDto("Medifé", "Prepaga nacional"));
        Assert.NotNull(res);
        Assert.Equal("Medifé", res.Nombre);

        // Modificar
        var mod = await service.ModificarObraSocialAsync(new ModificarObraSocialDto(res.Id, "Medifé Oro", "Plan premium"));
        Assert.Equal("Medifé Oro", mod.Nombre);

        // Obtener Por ID
        var obtenida = await service.ObtenerPorIdAsync(res.Id);
        Assert.Equal("Plan premium", obtenida.Catalogo);

        // Baja
        await service.EliminarObraSocialAsync(res.Id);
        await Assert.ThrowsAsync<ObraSocialNotFoundException>(() => service.ObtenerPorIdAsync(res.Id));
    }
}
