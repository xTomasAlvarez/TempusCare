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

public class AuthServiceTests
{
    private TempusCareDbContext GetInMemoryDbContext(string dbName)
    {
        var options = new DbContextOptionsBuilder<TempusCareDbContext>()
            .UseInMemoryDatabase(dbName)
            .Options;
        return new TempusCareDbContext(options);
    }

    [Fact]
    public async Task RegistrarUsuario_Paciente_GeneratesProfileAndToken()
    {
        var db = GetInMemoryDbContext(nameof(RegistrarUsuario_Paciente_GeneratesProfileAndToken));
        var authService = new AuthService(db, NullLogger<AuthService>.Instance);

        var dto = new RegistrarUsuarioDto("juanperez", "contra123", "juan@test.com", RolUsuario.Paciente);
        var res = await authService.RegistrarUsuarioAsync(dto);

        Assert.NotNull(res);
        Assert.Equal("juanperez", res.Usuario);
        Assert.Equal(RolUsuario.Paciente, res.Rol);
        Assert.NotNull(res.Cuil);
        Assert.Contains("JWT-TOKEN", res.Token);

        var pac = await db.Pacientes.FirstOrDefaultAsync(p => p.Cuil == res.Cuil);
        Assert.NotNull(pac);
    }

    [Fact]
    public async Task RegistrarUsuario_NombreUsuarioDuplicado_ThrowsConflictException()
    {
        var db = GetInMemoryDbContext(nameof(RegistrarUsuario_NombreUsuarioDuplicado_ThrowsConflictException));
        var authService = new AuthService(db, NullLogger<AuthService>.Instance);

        var dto1 = new RegistrarUsuarioDto("usuariorepetido", "pass1", "mail1@test.com", RolUsuario.Paciente);
        await authService.RegistrarUsuarioAsync(dto1);

        var dto2 = new RegistrarUsuarioDto("usuariorepetido", "pass2", "mail2@test.com", RolUsuario.Profesional);
        await Assert.ThrowsAsync<ConflictException>(() => authService.RegistrarUsuarioAsync(dto2));
    }

    [Fact]
    public async Task RegistrarUsuario_MailDuplicado_ThrowsConflictException()
    {
        var db = GetInMemoryDbContext(nameof(RegistrarUsuario_MailDuplicado_ThrowsConflictException));
        var authService = new AuthService(db, NullLogger<AuthService>.Instance);

        var dto1 = new RegistrarUsuarioDto("user1", "pass1", "mismo@test.com", RolUsuario.Paciente);
        await authService.RegistrarUsuarioAsync(dto1);

        var dto2 = new RegistrarUsuarioDto("user2", "pass2", "mismo@test.com", RolUsuario.Paciente);
        await Assert.ThrowsAsync<ConflictException>(() => authService.RegistrarUsuarioAsync(dto2));
    }

    [Fact]
    public async Task IniciarSesion_CredencialesValidas_ReturnsTokenYCuil()
    {
        var db = GetInMemoryDbContext(nameof(IniciarSesion_CredencialesValidas_ReturnsTokenYCuil));
        var authService = new AuthService(db, NullLogger<AuthService>.Instance);

        var user = new Usuario
        {
            NombreUsuario = "doctorhouse",
            Contrasena = "vicodin123",
            Mail = "house@hospital.com",
            Rol = RolUsuario.Profesional
        };
        db.Usuarios.Add(user);
        await db.SaveChangesAsync();

        var prof = new Profesional
        {
            Cuil = "20123456780",
            Nombre = "Gregory",
            Apellido = "House",
            Matricula = "MP9988",
            UsuarioId = user.Id
        };
        db.Profesionales.Add(prof);
        await db.SaveChangesAsync();

        var res = await authService.IniciarSesionAsync(new IniciarSesionDto("doctorhouse", "vicodin123"));

        Assert.NotNull(res);
        Assert.Equal("20123456780", res.Cuil);
        Assert.Equal(RolUsuario.Profesional, res.Rol);
    }

    [Fact]
    public async Task IniciarSesion_UsuarioInexistente_ThrowsNotAuthenticatedException()
    {
        var db = GetInMemoryDbContext(nameof(IniciarSesion_UsuarioInexistente_ThrowsNotAuthenticatedException));
        var authService = new AuthService(db, NullLogger<AuthService>.Instance);

        await Assert.ThrowsAsync<NotAuthenticatedException>(() =>
            authService.IniciarSesionAsync(new IniciarSesionDto("noexiste", "123456")));
    }

    [Fact]
    public async Task IniciarSesion_ContrasenaInvalida_ThrowsNotAuthenticatedException()
    {
        var db = GetInMemoryDbContext(nameof(IniciarSesion_ContrasenaInvalida_ThrowsNotAuthenticatedException));
        var authService = new AuthService(db, NullLogger<AuthService>.Instance);

        db.Usuarios.Add(new Usuario
        {
            NombreUsuario = "validuser",
            Contrasena = "correctpassword",
            Mail = "valid@test.com",
            Rol = RolUsuario.Paciente
        });
        await db.SaveChangesAsync();

        await Assert.ThrowsAsync<NotAuthenticatedException>(() =>
            authService.IniciarSesionAsync(new IniciarSesionDto("validuser", "wrongpassword")));
    }
}
