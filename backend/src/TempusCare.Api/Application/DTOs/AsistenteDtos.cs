namespace TempusCare.Api.Application.DTOs;

public record AltaAsistenteDto(
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
    string? CodPostal
);

public record ModificarAsistenteDto(
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
    string? CodPostal
);

public record AsistenteResponseDto(
    string Cuil,
    string Nombre,
    string Apellido,
    DateTime FechaNacimiento,
    string Telefono,
    string Genero,
    string? DireccionCompleta
);
