using Microsoft.EntityFrameworkCore;
using TempusCare.Api.Application.DTOs;
using TempusCare.Api.Application.Exceptions;
using TempusCare.Api.Domain.Entities;
using TempusCare.Api.Domain.Enums;
using TempusCare.Api.Infrastructure.Data;

namespace TempusCare.Api.Application.Services;

public class AuthService : IAuthService
{
    private readonly TempusCareDbContext _db;
    private readonly ILogger<AuthService> _logger;

    public AuthService(TempusCareDbContext db, ILogger<AuthService> logger)
    {
        _db = db;
        _logger = logger;
    }

    public async Task<UsuarioAutenticadoDto> RegistrarUsuarioAsync(RegistrarUsuarioDto dto)
    {
        _logger.LogInformation("Iniciando registro de usuario: {Usuario} con rol {Rol}", dto.Usuario, dto.Rol);

        if (await _db.Usuarios.AnyAsync(u => u.NombreUsuario == dto.Usuario || u.Mail == dto.Mail))
        {
            _logger.LogWarning("El usuario o mail ya existe: {Usuario}, {Mail}", dto.Usuario, dto.Mail);
            throw new ConflictException("El nombre de usuario o correo electrónico ya se encuentra registrado.");
        }

        var usuario = new Usuario
        {
            NombreUsuario = dto.Usuario,
            Contrasena = dto.Contra,
            Mail = dto.Mail,
            Rol = dto.Rol
        };

        _db.Usuarios.Add(usuario);
        await _db.SaveChangesAsync();

        string? cuil = null;

        if (dto.Rol == RolUsuario.Paciente)
        {
            cuil = "PAC-" + usuario.Id;
            var paciente = new Paciente
            {
                Cuil = cuil,
                UsuarioId = usuario.Id,
                Nombre = dto.Usuario,
                Apellido = "",
                FechaNacimiento = DateTime.UtcNow,
                Telefono = "",
                Genero = ""
            };
            _db.Pacientes.Add(paciente);
            await _db.SaveChangesAsync();
            _logger.LogInformation("Perfil de paciente generado automáticamente para usuario ID {UsuarioId} con CUIL {Cuil}", usuario.Id, cuil);
        }

        string mockToken = $"JWT-TOKEN-USER-{usuario.Id}-{usuario.Rol}";
        _logger.LogInformation("Usuario registrado con éxito. ID: {UsuarioId}", usuario.Id);

        return new UsuarioAutenticadoDto(usuario.Id, usuario.NombreUsuario, usuario.Mail, usuario.Rol, cuil, mockToken);
    }

    public async Task<UsuarioAutenticadoDto> IniciarSesionAsync(IniciarSesionDto dto)
    {
        _logger.LogInformation("Intento de inicio de sesión para el usuario: {Usuario}", dto.Usuario);

        var usuario = await _db.Usuarios
            .Include(u => u.Paciente)
            .Include(u => u.Profesional)
            .Include(u => u.Asistente)
            .Include(u => u.Institucion)
            .FirstOrDefaultAsync(u => u.NombreUsuario == dto.Usuario && u.Contrasena == dto.Contra);

        if (usuario == null)
        {
            _logger.LogWarning("Inicio de sesión fallido para el usuario: {Usuario}", dto.Usuario);
            throw new NotAuthenticatedException("Credenciales inválidas.");
        }

        string? cuil = usuario.Rol switch
        {
            RolUsuario.Paciente => usuario.Paciente?.Cuil,
            RolUsuario.Profesional => usuario.Profesional?.Cuil,
            RolUsuario.Asistente => usuario.Asistente?.Cuil,
            RolUsuario.Institucion => usuario.Institucion?.Cuit,
            _ => null
        };

        string mockToken = $"JWT-TOKEN-USER-{usuario.Id}-{usuario.Rol}";
        _logger.LogInformation("Inicio de sesión exitoso para usuario ID {UsuarioId}, Rol: {Rol}", usuario.Id, usuario.Rol);

        return new UsuarioAutenticadoDto(usuario.Id, usuario.NombreUsuario, usuario.Mail, usuario.Rol, cuil, mockToken);
    }
}
