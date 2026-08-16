namespace TempusCare.Api.Application.DTOs;

public record CompletarCuestionarioDto(
    int CitaId,
    int Puntualidad,
    int Atencion,
    int Profesionalismo,
    string? Comentario
);

public record CuestionarioResponseDto(
    int Id,
    int CitaId,
    int Puntualidad,
    int Atencion,
    int Profesionalismo,
    string? Comentario,
    double Promedio
);
