using TempusCare.Api.Domain.Enums;

namespace TempusCare.Api.Application.DTOs;

public record AltaTurnoDto(int AgendaId, DateTime Fecha, TimeSpan HoraInicio, TimeSpan HoraFin);

public record ModificarTurnoDto(int IdTurno, string? Detalle, EstadoTurno? Estado);

public record TurnoResponseDto(
    int Id,
    int AgendaId,
    DateTime Fecha,
    TimeSpan HoraInicio,
    TimeSpan HoraFin,
    EstadoTurno Estado,
    string ProfesionalCuil,
    string ProfesionalNombre,
    string ConsultorioNombre
);
