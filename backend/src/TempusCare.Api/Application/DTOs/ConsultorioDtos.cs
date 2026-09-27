using System.ComponentModel.DataAnnotations;

namespace TempusCare.Api.Application.DTOs;

public record AltaConsultorioDto(
    [property: Required, RegularExpression(@"^\d{11}$", ErrorMessage = "El CUIT de la sede debe ser una cadena numérica de exactamente 11 dígitos.")]
    string Cuit,
    string Nombre,
    string Email,
    string Telefono,
    string NivelAccesibilidad,
    int? InstitucionId,
    string Calle,
    string Nro,
    string? Depto,
    string Localidad,
    string Provincia,
    string CodPostal,
    List<string>? ProfesionalesCuils,
    double? Latitud = null,
    double? Longitud = null
);

public record ModificarConsultorioDto(
    [property: Required, RegularExpression(@"^\d{11}$", ErrorMessage = "El CUIT de la sede debe ser una cadena numérica de exactamente 11 dígitos.")]
    string Cuit,
    string Nombre,
    string Email,
    string Telefono,
    string NivelAccesibilidad,
    int? InstitucionId,
    string Calle,
    string Nro,
    string? Depto,
    string Localidad,
    string Provincia,
    string CodPostal,
    List<string>? ProfesionalesCuils,
    double? Latitud = null,
    double? Longitud = null
);

public record ConsultorioResponseDto(
    string Cuit,
    string Nombre,
    string Email,
    string Telefono,
    string NivelAccesibilidad,
    string? InstitucionNombre,
    string DireccionCompleta,
    List<string> ProfesionalesNombres,
    List<ProfesionalVinculadoDto> Profesionales,
    double? Latitud = null,
    double? Longitud = null,
    string? Calle = null,
    string? Nro = null,
    string? Localidad = null,
    string? Depto = null,
    string? Provincia = null,
    string? CodPostal = null,
    int? InstitucionId = null
);

public record ConsultorioUbicacionDto(
    string Cuit,
    string Nombre,
    string? InstitucionNombre,
    string DireccionCompleta,
    string? Calle,
    string? Nro,
    double? Latitud,
    double? Longitud
);

public record ProfesionalVinculadoDto(
    string Cuil,
    string Nombre,
    string Apellido,
    string Matricula,
    string Telefono,
    List<string> Especialidades
);
