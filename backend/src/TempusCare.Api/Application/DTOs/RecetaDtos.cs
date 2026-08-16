using TempusCare.Api.Domain.Enums;

namespace TempusCare.Api.Application.DTOs;

public record AltaRecetaDto(
    int CitaId,
    string Medicamentos,
    string Dosis,
    string Indicaciones
);

public record ModificarRecetaDto(
    int Id,
    string Medicamentos,
    string Dosis,
    string Indicaciones,
    EstadoReceta Estado
);

public record RecetaResponseDto(
    int Id,
    int CitaId,
    DateTime FechaEmision,
    string Medicamentos,
    string Dosis,
    string Indicaciones,
    EstadoReceta Estado,
    string PacienteNombre,
    string ProfesionalNombre
);
