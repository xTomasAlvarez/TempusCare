using System.ComponentModel.DataAnnotations;
using TempusCare.Api.Domain.Enums;

namespace TempusCare.Api.Application.DTOs;

public record RegistrarUsuarioDto(string Usuario, string Contra, string Mail, RolUsuario Rol);

public record RegistrarPacienteDto(
    string Nombre,
    string Apellido,
    string? Dni,
    string Email,
    string Contrasena,
    int? ObraSocialId = null,
    string? Cuil = null
);

public record IniciarSesionDto(string Usuario, string Contra);

public record UsuarioAutenticadoDto(
    int Id,
    string Usuario,
    string Mail,
    RolUsuario Rol,
    string? Cuil,
    string Token,
    string? ConsultorioCuit = null,
    int? InstitucionId = null,
    string? SedeNombre = null,
    string? NombreCompleto = null,
    string? Nombre = null,
    string? Apellido = null,
    List<string>? ObrasSociales = null
);


public record ForgotPasswordDto(
    [Required(ErrorMessage = "Debe ingresar su correo electrónico, CUIL o usuario.")]
    string Email
);

public record ResetPasswordDto(
    string? Email,
    [Required(ErrorMessage = "El token de restablecimiento es obligatorio.")]
    string Token,
    [Required, MinLength(8, ErrorMessage = "La contraseña debe tener al menos 8 caracteres.")]
    string NuevaContrasena
);

public record ForgotPasswordResponseDto(
    string Message,
    string? ResetToken = null,
    string? ResetUrl = null,
    bool Success = true
);

public record ResetPasswordResponseDto(
    string Message
);
