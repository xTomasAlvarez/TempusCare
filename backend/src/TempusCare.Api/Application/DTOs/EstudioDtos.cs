namespace TempusCare.Api.Application.DTOs;

public record AltaEstudioDto(
    string Nombre,
    string Descripcion,
    int Duracion,
    string Preparacion
);

public record ModificarEstudioDto(
    int Id,
    string Nombre,
    string Descripcion,
    int Duracion,
    string Preparacion
);

public record EstudioResponseDto(
    int Id,
    string Nombre,
    string Descripcion,
    int Duracion,
    string Preparacion
);
