using TempusCare.Api.Domain.Enums;

namespace TempusCare.Api.Application.DTOs;

public record RegistrarUsuarioDto(string Usuario, string Contra, string Mail, RolUsuario Rol);

public record IniciarSesionDto(string Usuario, string Contra);

public record UsuarioAutenticadoDto(int Id, string Usuario, string Mail, RolUsuario Rol, string? Cuil, string Token);
