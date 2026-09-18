namespace TempusCare.Api.Application.DTOs;

public record AltaInstitucionDto(
    string Nombre,
    string Cuit,
    string Email,
    string? Plan = "Profesional"
);

public record ModificarInstitucionDto(
    int Id,
    string Nombre,
    string Cuit,
    string Email,
    string? Plan = null
);

public record InstitucionResponseDto(
    int Id,
    int UsuarioId,
    string Nombre,
    string Cuit,
    string Email,
    string Plan,
    List<string> ConsultoriosNombres,
    List<string> AsistentesNombres
);
