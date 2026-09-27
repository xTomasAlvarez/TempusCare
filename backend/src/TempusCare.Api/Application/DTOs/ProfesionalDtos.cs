using System.ComponentModel.DataAnnotations;
using TempusCare.Api.Domain.Enums;

namespace TempusCare.Api.Application.DTOs;

public record AltaProfesionalDto(
    [property: Required, RegularExpression(@"^\d{11}$", ErrorMessage = "El CUIL debe ser una cadena numérica de exactamente 11 dígitos.")]
    string Cuil,
    string Nombre,
    string Apellido,
    DateTime FecNac,
    string Telefono,
    string Matricula,
    string Genero,
    string? Calle,
    string? Nro,
    string? Depto,
    string? Localidad,
    string? Provincia,
    string? CodPostal,
    List<int>? EspecialidadesIds,
    List<string>? ConsultoriosCuits,
    List<int>? ObrasSocialesIds,
    List<AsignarEstudioProfesionalDto>? Estudios
);

public record ModificarProfesionalDto(
    [property: Required, RegularExpression(@"^\d{11}$", ErrorMessage = "El CUIL debe ser una cadena numérica de exactamente 11 dígitos.")]
    string Cuil,
    string Nombre,
    string Apellido,
    DateTime FecNac,
    string Telefono,
    string Matricula,
    string Genero,
    string? Calle,
    string? Nro,
    string? Depto,
    string? Localidad,
    string? Provincia,
    string? CodPostal,
    List<int>? EspecialidadesIds,
    List<string>? ConsultoriosCuits,
    List<int>? ObrasSocialesIds
);

public record AsignarEstudioProfesionalDto(
    int EstudioId,
    int DuracionTurno,
    decimal PrecioParticular,
    List<int>? ObrasSocialesAceptadasIds
);

public record ProfesionalEstudioResponseDto(
    int Id,
    int EstudioId,
    string EstudioNombre,
    int DuracionTurno,
    decimal PrecioParticular,
    bool Activo,
    List<string> ObrasSocialesAceptadas
);

public record ProfesionalResponseDto(
    string Cuil,
    string Nombre,
    string Apellido,
    DateTime FechaNacimiento,
    string Telefono,
    string Matricula,
    string Genero,
    EstadoProfesional Estado,
    double Puntuacion,
    string? DireccionCompleta,
    List<string> Especialidades,
    List<string> Consultorios,
    List<string> ObrasSociales,
    List<ProfesionalEstudioResponseDto> Estudios,
    List<ConsultorioUbicacionDto>? ConsultoriosDetalle = null,
    List<string>? Instituciones = null
);
