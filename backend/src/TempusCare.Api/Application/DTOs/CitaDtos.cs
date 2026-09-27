using System.ComponentModel.DataAnnotations;
using TempusCare.Api.Domain.Enums;

namespace TempusCare.Api.Application.DTOs;

public record AltaCitaDto(
    [Required, RegularExpression(@"^\d{11}$", ErrorMessage = "El CUIL del paciente debe ser exactamente una cadena numérica de 11 dígitos.")]
    string PacienteCuil,
    [Required, RegularExpression(@"^\d{11}$", ErrorMessage = "El CUIL del profesional debe ser exactamente una cadena numérica de 11 dígitos.")]
    string ProfesionalCuil,
    int TurnoId,
    TipoCita Tipo,
    int? ObraSocialId,
    int? EstudioId,
    string? DocumentoPedidoMedico = null
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
    double? PuntualidadEncuesta,
    int? EstudioId = null,
    string? EstudioNombre = null,
    string? DocumentoPedidoMedico = null,
    int CantidadTurnosCubiertos = 1,
    string? ConsultorioNombre = null,
    string? EspecialidadNombre = null
);
