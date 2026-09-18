using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging.Abstractions;
using TempusCare.Api.Application.DTOs;
using TempusCare.Api.Application.Exceptions;
using TempusCare.Api.Application.Services;
using TempusCare.Api.Domain.Entities;
using TempusCare.Api.Infrastructure.Data;
using Xunit;

namespace TempusCare.Tests;

public class PacienteServiceTests
{
    private TempusCareDbContext GetInMemoryDbContext(string dbName)
    {
        var options = new DbContextOptionsBuilder<TempusCareDbContext>()
            .UseInMemoryDatabase(dbName)
            .Options;
        return new TempusCareDbContext(options);
    }

    [Fact]
    public async Task AltaPerfil_PacienteNuevo_GuardaCorrectamente()
    {
        var db = GetInMemoryDbContext(nameof(AltaPerfil_PacienteNuevo_GuardaCorrectamente));
        var service = new PacienteService(db, NullLogger<PacienteService>.Instance);

        var dto = new AltaPerfilPacienteDto(
            "27123456789",
            "Luciana",
            "Salas",
            new DateTime(1998, 3, 14),
            "Femenino",
            "3815559900",
            "San Juan",
            "550",
            "2B",
            "San Miguel de Tucumán",
            "Tucumán",
            "4000",
            null
        );

        var res = await service.AltaPerfilAsync(dto);

        Assert.NotNull(res);
        Assert.Equal("27123456789", res.Cuil);
        Assert.Equal("Luciana", res.Nombre);
        Assert.Equal("Salas", res.Apellido);
        Assert.Contains("San Juan 550", res.DireccionCompleta!);

        var enDb = await db.Pacientes.Include(p => p.Direccion).FirstOrDefaultAsync(p => p.Cuil == dto.Cuil);
        Assert.NotNull(enDb);
        Assert.NotNull(enDb.Direccion);
        Assert.Equal("San Juan", enDb.Direccion.Calle);
    }

    [Fact]
    public async Task AltaPerfil_CuilExistente_ThrowsConflictException()
    {
        var db = GetInMemoryDbContext(nameof(AltaPerfil_CuilExistente_ThrowsConflictException));
        var service = new PacienteService(db, NullLogger<PacienteService>.Instance);

        db.Pacientes.Add(new Paciente { Cuil = "27111222334", Nombre = "Pedro", Apellido = "Gomez" });
        await db.SaveChangesAsync();

        var dto = new AltaPerfilPacienteDto("27111222334", "Otro", "Nombre", DateTime.Now, "M", "123", null, null, null, null, null, null, null);
        await Assert.ThrowsAsync<ConflictException>(() => service.AltaPerfilAsync(dto));
    }

    [Fact]
    public async Task ModificarPerfil_PacienteExistente_ActualizaCampos()
    {
        var db = GetInMemoryDbContext(nameof(ModificarPerfil_PacienteExistente_ActualizaCampos));
        var service = new PacienteService(db, NullLogger<PacienteService>.Instance);

        var pac = new Paciente { Cuil = "27999888776", Nombre = "Original", Apellido = "Apellido", Telefono = "111" };
        db.Pacientes.Add(pac);
        await db.SaveChangesAsync();

        var dto = new ModificacionPerfilPacienteDto("27999888776", "Modificado", "Nuevo", DateTime.Now, "F", "3814449999", "Calle Nueva", "123", null, "Yerba Buena", "Tucumán", "4107", null);
        var res = await service.ModificarPerfilAsync(dto);

        Assert.Equal("Modificado", res.Nombre);
        Assert.Equal("Nuevo", res.Apellido);
        Assert.Equal("3814449999", res.Telefono);
        Assert.Contains("Calle Nueva 123", res.DireccionCompleta!);
    }

    [Fact]
    public async Task ModificarPerfil_Inexistente_ThrowsPacienteNotFoundException()
    {
        var db = GetInMemoryDbContext(nameof(ModificarPerfil_Inexistente_ThrowsPacienteNotFoundException));
        var service = new PacienteService(db, NullLogger<PacienteService>.Instance);

        var dto = new ModificacionPerfilPacienteDto("27000000000", "No", "Existe", DateTime.Now, "M", "111", null, null, null, null, null, null, null);
        await Assert.ThrowsAsync<PacienteNotFoundException>(() => service.ModificarPerfilAsync(dto));
    }

    [Fact]
    public async Task ObtenerPerfil_Inexistente_ThrowsPacienteNotFoundException()
    {
        var db = GetInMemoryDbContext(nameof(ObtenerPerfil_Inexistente_ThrowsPacienteNotFoundException));
        var service = new PacienteService(db, NullLogger<PacienteService>.Instance);

        await Assert.ThrowsAsync<PacienteNotFoundException>(() => service.ObtenerPerfilAsync("27999999999"));
    }

    [Fact]
    public async Task BajaPerfil_Existente_EliminaRegistro()
    {
        var db = GetInMemoryDbContext(nameof(BajaPerfil_Existente_EliminaRegistro));
        var service = new PacienteService(db, NullLogger<PacienteService>.Instance);

        db.Pacientes.Add(new Paciente { Cuil = "27444555666", Nombre = "Borrar", Apellido = "Me" });
        await db.SaveChangesAsync();

        await service.BajaPerfilAsync("27444555666");

        var enDb = await db.Pacientes.FindAsync("27444555666");
        Assert.Null(enDb);
    }
}
