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
    List<string>? ProfesionalesCuils
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
    List<string>? ProfesionalesCuils
);

public record ConsultorioResponseDto(
    string Cuit,
    string Nombre,
    string Email,
    string Telefono,
    string NivelAccesibilidad,
    string? InstitucionNombre,
    string DireccionCompleta,
    List<string> ProfesionalesNombres
);
