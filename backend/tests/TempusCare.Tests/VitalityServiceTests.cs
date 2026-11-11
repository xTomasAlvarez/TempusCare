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

public class VitalityServiceTests
{
    private TempusCareDbContext GetInMemoryDbContext(string dbName)
    {
        var options = new DbContextOptionsBuilder<TempusCareDbContext>()
            .UseInMemoryDatabase(dbName)
            .Options;
        return new TempusCareDbContext(options);
    }

    [Fact]
    public async Task ProponerSuperAdmin_EmailYaPerteneceAPaciente_LanzaConflictException()
    {
        var db = GetInMemoryDbContext(nameof(ProponerSuperAdmin_EmailYaPerteneceAPaciente_LanzaConflictException));
        var service = new VitalityService(db, NullLogger<VitalityService>.Instance);

        var admin = new Usuario { Id = 1, Mail = "admin1@tempuscare.com", NombreUsuario = "admin1", Rol = RolUsuario.SuperAdmin };
        var pacienteUser = new Usuario { Id = 2, Mail = "paciente@tempuscare.com", NombreUsuario = "paciente", Rol = RolUsuario.Paciente };
        db.Usuarios.AddRange(admin, pacienteUser);
        await db.SaveChangesAsync();

        var dto = new ProponerAdminDto { Email = "paciente@tempuscare.com" };
        var ex = await Assert.ThrowsAsync<ConflictException>(() => service.ProponerSuperAdminAsync(dto, admin.Id));
        Assert.Contains("Paciente", ex.Message);
    }

    [Fact]
    public async Task AprobarSuperAdmin_MismoSuperAdminProponente_LanzaBusinessException()
    {
        var db = GetInMemoryDbContext(nameof(AprobarSuperAdmin_MismoSuperAdminProponente_LanzaBusinessException));
        var service = new VitalityService(db, NullLogger<VitalityService>.Instance);

        var admin1 = new Usuario { Id = 1, Mail = "admin1@tempuscare.com", NombreUsuario = "admin1", Rol = RolUsuario.SuperAdmin };
        db.Usuarios.Add(admin1);

        var solicitud = new SolicitudSuperAdmin
        {
            Id = 1,
            EmailPropuesto = "nuevo@tempuscare.com",
            ProponenteId = admin1.Id,
            Estado = "Pendiente",
            FechaCreacion = DateTime.UtcNow
        };
        db.SolicitudesSuperAdmin.Add(solicitud);
        await db.SaveChangesAsync();

        var ex = await Assert.ThrowsAsync<BusinessException>(() => service.AprobarSuperAdminAsync(solicitud.Id, admin1.Id));
        Assert.Contains("distinto", ex.Message);
    }

    [Fact]
    public async Task AprobarSuperAdmin_AprobadorInexistenteOInvalido_LanzaBusinessException()
    {
        var db = GetInMemoryDbContext(nameof(AprobarSuperAdmin_AprobadorInexistenteOInvalido_LanzaBusinessException));
        var service = new VitalityService(db, NullLogger<VitalityService>.Instance);

        var admin1 = new Usuario { Id = 1, Mail = "admin1@tempuscare.com", NombreUsuario = "admin1", Rol = RolUsuario.SuperAdmin };
        db.Usuarios.Add(admin1);

        var solicitud = new SolicitudSuperAdmin
        {
            Id = 1,
            EmailPropuesto = "nuevo@tempuscare.com",
            ProponenteId = admin1.Id,
            Estado = "Pendiente",
            FechaCreacion = DateTime.UtcNow
        };
        db.SolicitudesSuperAdmin.Add(solicitud);
        await db.SaveChangesAsync();

        var ex = await Assert.ThrowsAsync<BusinessException>(() => service.AprobarSuperAdminAsync(solicitud.Id, null));
        Assert.Contains("distinto", ex.Message);
    }

    [Fact]
    public async Task AprobarSuperAdmin_SegundoSuperAdminValido_ApruebaYCreaUsuario()
    {
        var db = GetInMemoryDbContext(nameof(AprobarSuperAdmin_SegundoSuperAdminValido_ApruebaYCreaUsuario));
        var service = new VitalityService(db, NullLogger<VitalityService>.Instance);

        var admin1 = new Usuario { Id = 1, Mail = "admin1@tempuscare.com", NombreUsuario = "admin1", Rol = RolUsuario.SuperAdmin };
        var admin2 = new Usuario { Id = 2, Mail = "admin2@tempuscare.com", NombreUsuario = "admin2", Rol = RolUsuario.SuperAdmin };
        db.Usuarios.AddRange(admin1, admin2);

        var solicitud = new SolicitudSuperAdmin
        {
            Id = 1,
            EmailPropuesto = "nuevo@tempuscare.com",
            ProponenteId = admin1.Id,
            Estado = "Pendiente",
            FechaCreacion = DateTime.UtcNow
        };
        db.SolicitudesSuperAdmin.Add(solicitud);
        await db.SaveChangesAsync();

        var res = await service.AprobarSuperAdminAsync(solicitud.Id, admin2.Id);
        Assert.NotNull(res);

        var nuevo = await db.Usuarios.FirstOrDefaultAsync(u => u.Mail == "nuevo@tempuscare.com");
        Assert.NotNull(nuevo);
        Assert.Equal(RolUsuario.SuperAdmin, nuevo.Rol);
    }
}
