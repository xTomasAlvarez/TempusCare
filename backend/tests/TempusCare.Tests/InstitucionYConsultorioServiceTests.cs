using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging.Abstractions;
using TempusCare.Api.Application.DTOs;
using TempusCare.Api.Application.Exceptions;
using TempusCare.Api.Application.Services;
using TempusCare.Api.Domain.Entities;
using TempusCare.Api.Infrastructure.Data;
using Xunit;

namespace TempusCare.Tests;

public class InstitucionYConsultorioServiceTests
{
    private TempusCareDbContext GetInMemoryDbContext(string dbName)
    {
        var options = new DbContextOptionsBuilder<TempusCareDbContext>()
            .UseInMemoryDatabase(dbName)
            .Options;
        return new TempusCareDbContext(options);
    }

    [Fact]
    public async Task Institucion_AltaModificarYBaja_FlujoCompleto()
    {
        var db = GetInMemoryDbContext(nameof(Institucion_AltaModificarYBaja_FlujoCompleto));
        var service = new InstitucionService(db, NullLogger<InstitucionService>.Instance);

        // Alta
        var dto = new AltaInstitucionDto("Sanatorio del Valle", "30708090102", "info@valle.com");
        var resAlta = await service.AltaInstitucionAsync(dto);
        Assert.NotNull(resAlta);
        Assert.Equal("Sanatorio del Valle", resAlta.Nombre);

        // Modificar
        var dtoMod = new ModificarInstitucionDto(resAlta.Id, "Sanatorio del Valle S.A.", "30708090102", "contacto@valle.com");
        var resMod = await service.ModificarInstitucionAsync(dtoMod);
        Assert.Equal("Sanatorio del Valle S.A.", resMod.Nombre);

        // Obtener por ID
        var obtenida = await service.ObtenerPorIdAsync(resAlta.Id);
        Assert.Equal("contacto@valle.com", obtenida.Email);

        // Baja
        await service.BajaInstitucionAsync(resAlta.Id);
        await Assert.ThrowsAsync<InstitucionNotFoundException>(() => service.ObtenerPorIdAsync(resAlta.Id));
    }

    [Fact]
    public async Task Consultorio_AltaModificarYBaja_FlujoCompleto()
    {
        var db = GetInMemoryDbContext(nameof(Consultorio_AltaModificarYBaja_FlujoCompleto));
        var consService = new ConsultorioService(db, NullLogger<ConsultorioService>.Instance);
        var instService = new InstitucionService(db, NullLogger<InstitucionService>.Instance);

        var inst = await instService.AltaInstitucionAsync(new AltaInstitucionDto("Clínica Sur", "30999000111", "sur@clinica.com"));

        // Alta Consultorio
        var dtoCons = new AltaConsultorioDto(
            "30888999111",
            "Consultorio Planta Alta",
            "pa@sur.com",
            "3815554433",
            "Rampa de acceso",
            inst.Id,
            "Congreso",
            "150",
            null,
            "San Miguel de Tucumán",
            "Tucumán",
            "4000",
            null
        );

        var resAlta = await consService.AltaConsultorioAsync(dtoCons);
        Assert.NotNull(resAlta);
        Assert.Equal("30888999111", resAlta.Cuit);
        Assert.Equal("Clínica Sur", resAlta.InstitucionNombre);
        Assert.Contains("Congreso 150", resAlta.DireccionCompleta!);

        // Cuit duplicado
        await Assert.ThrowsAsync<ConflictException>(() => consService.AltaConsultorioAsync(dtoCons));

        // Modificar
        var dtoMod = new ModificarConsultorioDto(
            "30888999111",
            "Consultorio Planta Baja",
            "pb@sur.com",
            "3815559999",
            "Totalmente accesible",
            inst.Id,
            "Congreso",
            "160",
            null,
            "San Miguel de Tucumán",
            "Tucumán",
            "4000",
            null
        );
        var resMod = await consService.ModificarConsultorioAsync(dtoMod);
        Assert.Equal("Consultorio Planta Baja", resMod.Nombre);
        Assert.Contains("Congreso 160", resMod.DireccionCompleta!);

        // Baja
        await consService.BajaConsultorioAsync("30888999111");
        await Assert.ThrowsAsync<ConsultorioNotFoundException>(() => consService.ObtenerPorCuitAsync("30888999111"));
    }
}
