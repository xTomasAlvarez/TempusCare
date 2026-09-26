namespace TempusCare.Api.Application.DTOs;

public record AltaConsultorioDto(
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
    string? Localidad = null
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
