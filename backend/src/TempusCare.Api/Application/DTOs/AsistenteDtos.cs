using System.ComponentModel.DataAnnotations;

namespace TempusCare.Api.Application.DTOs;

public record AltaAsistenteDto(
    [property: Required, RegularExpression(@"^\d{7,11}$", ErrorMessage = "El DNI/CUIL del asistente debe ser una cadena numérica de entre 7 y 11 dígitos.")]
    string Cuil,
    string Nombre,
    string Apellido,
    DateTime FecNac,
    string Telefono,
    string Genero,
    string? Calle,
    string? Nro,
    string? Depto,
    string? Localidad,
    string? Provincia,
    string? CodPostal,
    int? InstitucionId = null,
    [property: RegularExpression(@"^\d{11}$", ErrorMessage = "El CUIT del consultorio debe ser una cadena numérica de exactamente 11 dígitos.")]
    string? ConsultorioCuit = null,
    [property: RegularExpression(@"^\d{11}$", ErrorMessage = "El CUIL del administrador de consultorio debe ser una cadena numérica de exactamente 11 dígitos.")]
    string? AdminConsultorioCuil = null,
    string? Email = null
);

public record ModificarAsistenteDto(
    [property: Required, RegularExpression(@"^\d{7,11}$", ErrorMessage = "El DNI/CUIL del asistente debe ser una cadena numérica de entre 7 y 11 dígitos.")]
    string Cuil,
    string Nombre,
    string Apellido,
    DateTime FecNac,
    string Telefono,
    string Genero,
    string? Calle,
    string? Nro,
    string? Depto,
    string? Localidad,
    string? Provincia,
    string? CodPostal,
    int? InstitucionId = null,
    [property: RegularExpression(@"^\d{11}$", ErrorMessage = "El CUIT del consultorio debe ser una cadena numérica de exactamente 11 dígitos.")]
    string? ConsultorioCuit = null,
    [property: RegularExpression(@"^\d{11}$", ErrorMessage = "El CUIL del administrador de consultorio debe ser una cadena numérica de exactamente 11 dígitos.")]
    string? AdminConsultorioCuil = null,
    string? Email = null
);

public record AsistenteResponseDto(
    string Cuil,
    string Nombre,
    string Apellido,
    DateTime FechaNacimiento,
    string Telefono,
    string Genero,
    string? DireccionCompleta,
    int? InstitucionId = null,
    string? InstitucionNombre = null,
    string? ConsultorioCuit = null,
    string? ConsultorioNombre = null,
    string? AdminConsultorioCuil = null,
    string? Email = null
);
