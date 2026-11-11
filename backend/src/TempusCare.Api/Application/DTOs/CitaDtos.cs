using System.ComponentModel.DataAnnotations;
using TempusCare.Api.Domain.Enums;

namespace TempusCare.Api.Application.DTOs;

public record AltaCitaDto(
    [Required, RegularExpression(@"^\d{7,11}$", ErrorMessage = "El CUIL o DNI del paciente debe ser una cadena numérica de entre 7 y 11 dígitos.")]
    string PacienteCuil,
    [Required, RegularExpression(@"^\d{7,11}$", ErrorMessage = "El CUIL del profesional debe ser una cadena numérica de entre 7 y 11 dígitos.")]
    string ProfesionalCuil,
    int TurnoId,
    TipoCita Tipo,
    int? ObraSocialId,
    int? EstudioId,
    string? DocumentoPedidoMedico = null
);

public record ModificarCitaEstadoDto(
    int CitaId, 
    EstadoCita Estado, 
    bool ForzarAtencionFueraDeHorario = false
);

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
