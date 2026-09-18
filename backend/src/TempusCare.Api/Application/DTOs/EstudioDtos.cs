namespace TempusCare.Api.Application.DTOs;

public record AltaEstudioDto(
    string Nombre,
    string Descripcion,
    int Duracion,
    string Preparacion,
    int? EspecialidadId = null
);

public record ModificarEstudioDto(
    int Id,
    string Nombre,
    string Descripcion,
    int Duracion,
    string Preparacion,
    int? EspecialidadId = null
);

public record EstudioResponseDto(
    int Id,
    string Nombre,
    string Descripcion,
    int Duracion,
    string Preparacion,
    int? EspecialidadId = null,
    string? EspecialidadNombre = null
);
