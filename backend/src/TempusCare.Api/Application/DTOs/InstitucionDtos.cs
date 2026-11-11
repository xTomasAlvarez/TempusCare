using System.ComponentModel.DataAnnotations;

namespace TempusCare.Api.Application.DTOs;

public record AltaInstitucionDto(
    string Nombre,
    [Required, RegularExpression(@"^\d{11}$", ErrorMessage = "El CUIT institucional debe ser una cadena numérica de exactamente 11 dígitos.")]
    string Cuit,
    string Email,
    string? Plan = "Profesional"
);

public record ModificarInstitucionDto(
    int Id,
    string Nombre,
    [Required, RegularExpression(@"^\d{11}$", ErrorMessage = "El CUIT institucional debe ser una cadena numérica de exactamente 11 dígitos.")]
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


public record MetricasInstitucionDto(
    int PacientesAtendidos,
    double CalificacionPromedio,
    int VisitasPerfil
);
