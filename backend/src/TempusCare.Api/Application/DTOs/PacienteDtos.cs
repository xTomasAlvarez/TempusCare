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
