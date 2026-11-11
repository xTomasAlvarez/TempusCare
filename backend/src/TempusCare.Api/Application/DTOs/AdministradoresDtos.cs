using System.ComponentModel.DataAnnotations;

namespace TempusCare.Api.Application.DTOs;

public record AltaAdminInstitucionDto(
    [Required, RegularExpression(@"^\d{11}$", ErrorMessage = "El CUIL debe ser exactamente una cadena numérica de 11 dígitos.")]
    string Cuil,
    string Nombre,
    string Apellido,
    string Telefono,
    DateTime FechaNacimiento,
    int InstitucionId,
    string NombreUsuario,
    string Contrasena,
    string Mail
);

public record AdminInstitucionResponseDto(
    string Cuil,
    string Nombre,
    string Apellido,
    string Telefono,
    DateTime FechaNacimiento,
    int InstitucionId,
    string InstitucionNombre,
    int UsuarioId,
    string NombreUsuario,
    string Mail
);

public record AltaAdminConsultorioDto(
    [Required, RegularExpression(@"^\d{11}$", ErrorMessage = "El CUIL debe ser exactamente una cadena numérica de 11 dígitos.")]
    string Cuil,
    string Nombre,
    string Apellido,
    string Telefono,
    DateTime FechaNacimiento,
    [Required, RegularExpression(@"^\d{11}$", ErrorMessage = "El CUIT de consultorio debe ser exactamente una cadena numérica de 11 dígitos.")]
    string ConsultorioCuit,
    string NombreUsuario,
    string Contrasena,
    string Mail
);

public record AdminConsultorioResponseDto(
    string Cuil,
    string Nombre,
    string Apellido,
    string Telefono,
    DateTime FechaNacimiento,
    string ConsultorioCuit,
    string ConsultorioNombre,
    int UsuarioId,
    string NombreUsuario,
    string Mail
);
