using TempusCare.Api.Domain.Enums;

namespace TempusCare.Api.Application.DTOs;

public record AltaCitaDto(
    string PacienteCuil,
    string ProfesionalCuil,
    int TurnoId,
    TipoCita Tipo,
    int? ObraSocialId,
    int? EstudioId
);

public record ModificarCitaEstadoDto(int CitaId, EstadoCita Estado);

public record CitaResponseDto(
    int Id,
    int TurnoId,
    string PacienteCuil,
    string PacienteNombre,
    string ProfesionalCuil,
    string ProfesionalNombre,
    DateTime Fecha,
    TimeSpan HoraInicio,
    TimeSpan HoraFin,
    EstadoCita Estado,
    TipoCita Tipo,
    CoberturaCita Cobertura,
    string? MotivoObservacion,
    string? DetalleObservacion,
    double? PuntualidadEncuesta
);
