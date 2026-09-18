using TempusCare.Api.Application.DTOs;
using TempusCare.Api.Domain.Enums;

namespace TempusCare.Api.Application.Services;

public interface ITurnoService
{
    Task<List<TurnoResponseDto>> ObtenerTurnosDisponiblesAsync(string profesionalCuil, DateTime? fecha);
    Task<TurnoResponseDto> ModificarTurnoAsync(int turnoId, string? detalle, EstadoTurno? estado);
    Task<TurnoResponseDto> ObtenerPorIdAsync(int turnoId);
}
