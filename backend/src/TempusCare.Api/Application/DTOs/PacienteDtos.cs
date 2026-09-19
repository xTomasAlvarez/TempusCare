namespace TempusCare.Api.Application.DTOs;

public record AltaPerfilPacienteDto(
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
