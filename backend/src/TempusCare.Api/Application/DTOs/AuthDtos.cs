using TempusCare.Api.Domain.Enums;

namespace TempusCare.Api.Application.DTOs;

public record RegistrarUsuarioDto(string Usuario, string Contra, string Mail, RolUsuario Rol);

public record RegistrarPacienteDto(
    string Nombre,
    string Apellido,
    string Dni,
    string Email,
    string Contrasena,
    int? ObraSocialId = null
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
    string? SedeNombre = null
);
