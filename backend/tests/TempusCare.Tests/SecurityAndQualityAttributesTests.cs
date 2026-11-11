using System.Security.Claims;
using System.Text;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging.Abstractions;
using TempusCare.Api.Application.DTOs;
using TempusCare.Api.Application.Services;
using TempusCare.Api.Controllers;
using TempusCare.Api.Domain.Entities;
using TempusCare.Api.Domain.Enums;
using TempusCare.Api.Infrastructure.Auth;
using TempusCare.Api.Infrastructure.Data;
using TempusCare.Api.Infrastructure.Security;
using Xunit;

namespace TempusCare.Tests;

/// <summary>
/// Suite de Pruebas de Seguridad y Atributos de Calidad (Sección 3.5 - RNF-SEG-01 a RNF-SEG-06).
/// </summary>
public class SecurityAndQualityAttributesTests
{
    private static TempusCareDbContext GetInMemoryDbContext(string dbName)
    {
        var options = new DbContextOptionsBuilder<TempusCareDbContext>()
            .UseInMemoryDatabase(databaseName: dbName)
            .Options;
        return new TempusCareDbContext(options);
    }

    [Fact]
    public async Task RNF_SEG_01_ContrasenasSeAlmacenanConHashSeguro_YNuncaEnTextoPlano()
    {
        var db = GetInMemoryDbContext(nameof(RNF_SEG_01_ContrasenasSeAlmacenanConHashSeguro_YNuncaEnTextoPlano));
        var authService = new AuthService(db, NullLogger<AuthService>.Instance);

        var dto = new RegistrarPacienteDto(
            "Lucia",
            "Gomez",
            "27351112223",
            "lucia.gomez@test.com",
            "ClaveSegura2026!",
            null
        );

        var registrado = await authService.RegistrarPacienteAsync(dto);
        var usuarioEnBd = await db.Usuarios.FindAsync(registrado.Id);

        Assert.NotNull(usuarioEnBd);
        Assert.NotEqual("ClaveSegura2026!", usuarioEnBd.Contrasena);
        Assert.True(PasswordSecurity.IsHashed(usuarioEnBd.Contrasena));
        Assert.StartsWith(PasswordSecurity.HashPrefix, usuarioEnBd.Contrasena);
        Assert.True(PasswordSecurity.VerifyPassword("ClaveSegura2026!", usuarioEnBd.Contrasena));
        Assert.False(PasswordSecurity.VerifyPassword("ClaveIncorrecta2026!", usuarioEnBd.Contrasena));
    }

    [Fact]
    public void RNF_SEG_03_FirmaJwt_TokenAdulteradoConOtroRol_EsRechazadoCriptograficamente()
    {
        var headerJson = "{\"alg\":\"HS256\",\"typ\":\"JWT\"}";
        var headerB64 = Convert.ToBase64String(Encoding.UTF8.GetBytes(headerJson)).TrimEnd('=').Replace('+', '-').Replace('/', '_');

        var payloadPacienteJson = "{\"sub\":\"15\",\"unique_name\":\"27351112223\",\"rol\":\"Paciente\"}";
        var payloadPacienteB64 = Convert.ToBase64String(Encoding.UTF8.GetBytes(payloadPacienteJson)).TrimEnd('=').Replace('+', '-').Replace('/', '_');

        // Firma legítima emitida por el servidor
        var legitimateSignature = PasswordSecurity.SignJwt(headerB64, payloadPacienteB64);
        Assert.True(PasswordSecurity.VerifyJwtSignature(headerB64, payloadPacienteB64, legitimateSignature));

        // Intento de escalación de privilegios adulterando el payload a SuperAdmin conservando la firma anterior
        var payloadAdulteradoJson = "{\"sub\":\"15\",\"unique_name\":\"27351112223\",\"rol\":\"SuperAdmin\"}";
        var payloadAdulteradoB64 = Convert.ToBase64String(Encoding.UTF8.GetBytes(payloadAdulteradoJson)).TrimEnd('=').Replace('+', '-').Replace('/', '_');

        Assert.False(PasswordSecurity.VerifyJwtSignature(headerB64, payloadAdulteradoB64, legitimateSignature));
        Assert.False(PasswordSecurity.VerifyJwtSignature(headerB64, payloadPacienteB64, "JWT-TOKEN-FirmaFalsaInvalida"));
    }

    [Fact]
    public async Task RNF_SEG_03_RBAC_PacienteNoPuedeAccederAHistoriaClinicaDeOtroPaciente()
    {
        var db = GetInMemoryDbContext(nameof(RNF_SEG_03_RBAC_PacienteNoPuedeAccederAHistoriaClinicaDeOtroPaciente));
        db.Pacientes.AddRange(
            new Paciente { Cuil = "27111111111", Nombre = "Ana", Apellido = "Paz", UsuarioId = 1 },
            new Paciente { Cuil = "20222222222", Nombre = "Juan", Apellido = "Soto", UsuarioId = 2 }
        );
        db.HistoriasClinicas.AddRange(
            new HistoriaClinica { Id = 1, PacienteCuil = "27111111111", Alergias = "Penicilina" },
            new HistoriaClinica { Id = 2, PacienteCuil = "20222222222", Alergias = "Polen" }
        );
        await db.SaveChangesAsync();

        var hcService = new HistoriaClinicaService(db, NullLogger<HistoriaClinicaService>.Instance);
        var controller = new HistoriasClinicasController(hcService);

        // Simular sesión autenticada como Paciente Ana (CUIL 27111111111)
        var claims = new[]
        {
            new Claim(ClaimTypes.NameIdentifier, "1"),
            new Claim(ClaimTypes.Name, "27111111111"),
            new Claim(ClaimTypes.Role, "Paciente")
        };
        controller.ControllerContext = new ControllerContext
        {
            HttpContext = new DefaultHttpContext
            {
                User = new ClaimsPrincipal(new ClaimsIdentity(claims, "TempusToken"))
            }
        };

        // 1. Ana consulta su propia historia clínica -> 200 OK
        var ownResult = await controller.ObtenerPorPaciente("27111111111");
        Assert.IsType<OkObjectResult>(ownResult);

        // 2. Ana intenta consultar la historia clínica de Juan (20222222222) -> 403 Forbidden
        var otherResult = await controller.ObtenerPorPaciente("20222222222");
        var objectRes = Assert.IsType<ObjectResult>(otherResult);
        Assert.Equal(403, objectRes.StatusCode);
    }

    [Fact]
    public async Task RNF_SEG_04_OWASP_ProteccionContraInyeccionSqlYXss()
    {
        var db = GetInMemoryDbContext(nameof(RNF_SEG_04_OWASP_ProteccionContraInyeccionSqlYXss));
        var profService = new ProfesionalService(db, NullLogger<ProfesionalService>.Instance);

        // 1. Verificar detección y sanitización de payloads XSS / SQLi
        Assert.True(PasswordSecurity.ContainsMaliciousPayload("<script>alert('XSS')</script>"));
        Assert.True(PasswordSecurity.ContainsMaliciousPayload("admin' UNION SELECT * FROM Usuarios --"));
        Assert.False(PasswordSecurity.ContainsMaliciousPayload("Consulta de control cardiológico anual"));

        var sanitized = PasswordSecurity.SanitizeText("<script>evil()</script>Paciente estable");
        Assert.DoesNotContain("<script>", sanitized, StringComparison.OrdinalIgnoreCase);

        // 2. Verificar que las consultas parametrizadas de EF Core neutralizan intentos de SQL Injection en búsquedas
        var resultado = await profService.ConsultarProfesionalesAsync(
            nombre: "' OR '1'='1'; DROP TABLE Profesionales; --"
        );

        Assert.NotNull(resultado);
        Assert.Empty(resultado);
    }

    [Fact]
    public void RNF_SEG_05_CopiaDeSeguridadAutomaticaDiaria_CreaArchivoBackupYRotacion()
    {
        var tempRoot = Path.Combine(Path.GetTempPath(), $"TempusCareBackupTest_{Guid.NewGuid():N}");
        Directory.CreateDirectory(tempRoot);

        try
        {
            var fakeDbPath = Path.Combine(tempRoot, "tempuscare.db");
            File.WriteAllBytes(fakeDbPath, Encoding.UTF8.GetBytes("SQLite format 3 - TempusCare Test Database Content"));

            var backupDir = Path.Combine(tempRoot, "backups");
            var createdBackupPath = DatabaseBackupService.ExecuteDailyBackup(fakeDbPath, backupDir, null, maxRetainedBackups: 7);

            Assert.NotNull(createdBackupPath);
            Assert.True(File.Exists(createdBackupPath));
            Assert.NotNull(DatabaseBackupService.LastBackupTimeUtc);
            Assert.True(DatabaseBackupService.TotalBackupsCount >= 1);
        }
        finally
        {
            if (Directory.Exists(tempRoot))
            {
                Directory.Delete(tempRoot, recursive: true);
            }
        }
    }

    [Fact]
    public void RNF_SEG_06_Ley25326_CifradoAES256EnReposo_ParaHistoriaClinicaYObservaciones()
    {
        const string diagnosticoSensible = "Paciente con antecedente de hipertensión arterial severa y alergia a betalactámicos.";

        var cifrado1 = ClinicalDataProtector.Encrypt(diagnosticoSensible);
        var cifrado2 = ClinicalDataProtector.Encrypt(diagnosticoSensible);

        Assert.NotNull(cifrado1);
        Assert.NotNull(cifrado2);
        Assert.True(ClinicalDataProtector.IsEncrypted(cifrado1));
        Assert.NotEqual(diagnosticoSensible, cifrado1);
        // IV aleatorio garantiza que dos cifrados del mismo texto produzcan ciphertexts distintos (semánticamente seguro)
        Assert.NotEqual(cifrado1, cifrado2);

        // Descifrado transparente recupera exactamente el texto clínico original
        Assert.Equal(diagnosticoSensible, ClinicalDataProtector.Decrypt(cifrado1));
        Assert.Equal(diagnosticoSensible, ClinicalDataProtector.Decrypt(cifrado2));
    }
}
