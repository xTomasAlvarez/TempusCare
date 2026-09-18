using Microsoft.EntityFrameworkCore;
using TempusCare.Api.Application.DTOs;
using TempusCare.Api.Application.Exceptions;
using TempusCare.Api.Domain.Entities;
using TempusCare.Api.Infrastructure.Data;

namespace TempusCare.Api.Application.Services;

public class CuestionarioService : ICuestionarioService
{
    private readonly TempusCareDbContext _db;
    private readonly ILogger<CuestionarioService> _logger;

    public CuestionarioService(TempusCareDbContext db, ILogger<CuestionarioService> logger)
    {
        _db = db;
        _logger = logger;
    }

    public async Task<CuestionarioResponseDto> CompletarCuestionarioAsync(CompletarCuestionarioDto dto)
    {
        _logger.LogInformation("Completando cuestionario de atención para la cita ID {CitaId}", dto.CitaId);

        var cita = await _db.Citas
            .Include(c => c.Cuestionario)
            .FirstOrDefaultAsync(c => c.Id == dto.CitaId);

        if (cita == null)
        {
            _logger.LogWarning("Cita ID {CitaId} no encontrada", dto.CitaId);
            throw new CitaNotFoundException(dto.CitaId);
        }

        if (cita.Cuestionario != null)
        {
            _logger.LogWarning("La cita ID {CitaId} ya posee una encuesta registrada", dto.CitaId);
            throw new ConflictException("Esta cita ya posee una encuesta registrada.");
        }

        var cuestionario = new Cuestionario
        {
            CitaId = cita.Id,
            Puntualidad = Math.Clamp(dto.Puntualidad, 1, 5),
            Atencion = Math.Clamp(dto.Atencion, 1, 5),
            Profesionalismo = Math.Clamp(dto.Profesionalismo, 1, 5),
            Comentario = dto.Comentario
        };

        _db.Cuestionarios.Add(cuestionario);
        await _db.SaveChangesAsync();
        _logger.LogInformation("Cuestionario registrado con éxito para cita ID {CitaId}", dto.CitaId);

        double promedio = Math.Round((cuestionario.Puntualidad + cuestionario.Atencion + cuestionario.Profesionalismo) / 3.0, 2);

        return new CuestionarioResponseDto(
            cuestionario.Id,
            cuestionario.CitaId,
            cuestionario.Puntualidad,
            cuestionario.Atencion,
            cuestionario.Profesionalismo,
            cuestionario.Comentario,
            promedio
        );
    }

    public async Task<CuestionarioResponseDto> ObtenerPorCitaIdAsync(int citaId)
    {
        _logger.LogInformation("Obteniendo cuestionario para cita ID {CitaId}", citaId);

        var cuestionario = await _db.Cuestionarios.FirstOrDefaultAsync(c => c.CitaId == citaId);
        if (cuestionario == null)
        {
            _logger.LogWarning("Cuestionario no encontrado para cita ID {CitaId}", citaId);
            throw new CuestionarioNotFoundException(citaId);
        }

        double promedio = Math.Round((cuestionario.Puntualidad + cuestionario.Atencion + cuestionario.Profesionalismo) / 3.0, 2);

        return new CuestionarioResponseDto(
            cuestionario.Id,
            cuestionario.CitaId,
            cuestionario.Puntualidad,
            cuestionario.Atencion,
            cuestionario.Profesionalismo,
            cuestionario.Comentario,
            promedio
        );
    }
}
