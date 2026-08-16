namespace TempusCare.Api.Application.DTOs;

public record CompletarObservacionDto(
    int? CitaId,
    int? HistoriaClinicaId,
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
