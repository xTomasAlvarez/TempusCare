namespace TempusCare.Api.Application.DTOs;

public record AltaInstitucionDto(
    string Nombre,
    string Cuit,
    string Email
);

public record ModificarInstitucionDto(
    int Id,
    string Nombre,
    string Cuit,
    string Email
);

public record InstitucionResponseDto(
    int Id,
    string Nombre,
    string Cuit,
    string Email,
    List<string> ConsultoriosNombres
);
