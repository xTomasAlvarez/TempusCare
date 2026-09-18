namespace TempusCare.Api.Application.DTOs;

public record AltaCoberturaDto(
    int ProfesionalEstudioId,
    int ObraSocialId
);

public record CoberturaResponseDto(
    int Id,
    int ProfesionalEstudioId,
    string EstudioNombre,
    string ProfesionalNombre,
    int ObraSocialId,
    string ObraSocialNombre
);
