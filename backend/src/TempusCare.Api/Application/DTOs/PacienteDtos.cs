using System.ComponentModel.DataAnnotations;

namespace TempusCare.Api.Application.DTOs;

public record AltaPerfilPacienteDto(
    [property: Required, RegularExpression(@"^\d{11}$", ErrorMessage = "El CUIL del paciente debe ser una cadena numérica de exactamente 11 dígitos.")]
    string Cuil,
    string Nombre,
    string Apellido,
    DateTime FecNac,
    string Genero,
    string Telefono,
    string? Calle,
    string? Nro,
    string? Depto,
    string? Localidad,
    string? Provincia,
    string? CodPostal,
    List<int>? ObrasSocialesIds
);

public record ModificacionPerfilPacienteDto(
    [property: Required, RegularExpression(@"^\d{11}$", ErrorMessage = "El CUIL del paciente debe ser una cadena numérica de exactamente 11 dígitos.")]
    string Cuil,
    string Nombre,
    string Apellido,
    DateTime FecNac,
    string Genero,
    string Telefono,
    string? Calle,
    string? Nro,
    string? Depto,
    string? Localidad,
    string? Provincia,
    string? CodPostal,
    List<int>? ObrasSocialesIds
);

public record PacientePerfilResponseDto(
    string Cuil,
    string Nombre,
    string Apellido,
    DateTime FechaNacimiento,
    string Genero,
    string Telefono,
    string? DireccionCompleta,
    List<string> ObrasSociales
);

public record RegistroPacientePresencialDto(
    string Dni,
    string Nombre,
    string? Apellido,
    string? Telefono,
    string? Email = null,
    int? ObraSocialId = null
);

public record PacientePresencialResponseDto(
    string Cuil,
    string Nombre,
    string Apellido,
    string Email,
    string Telefono,
    string ContrasenaProvisoria,
    string Mensaje
);
