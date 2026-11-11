using System.ComponentModel.DataAnnotations;

namespace TempusCare.Api.Application.DTOs;

public record CompletarObservacionDto(
    int? CitaId,
    int? HistoriaClinicaId,
    [RegularExpression(@"^$|^\d{11}$", ErrorMessage = "El CUIL del profesional debe ser una cadena numérica de 11 dígitos.")]
    string? ProfesionalCuil,
    string Motivo,
    string Detalle
);

public record ObservacionResponseDto(
    int Id,
    int? CitaId,
    int? HistoriaClinicaId,
    string? ProfesionalCuil,
    string? ProfesionalNombre,
    string Motivo,
    string Detalle
);
