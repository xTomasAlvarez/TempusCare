using TempusCare.Api.Application.DTOs;
using TempusCare.Api.Domain.Enums;

namespace TempusCare.Api.Application.Services;

public interface ICitaService
{
    Task<CitaResponseDto> AltaCitaAsync(AltaCitaDto dto);
    Task<CitaResponseDto> ModificarCitaEstadoAsync(int citaId, EstadoCita estado);
    Task BajaCitaAsync(int citaId);
    Task<List<CitaResponseDto>> ObtenerCitasPacienteAsync(string pacienteCuil);
    Task<List<CitaResponseDto>> ObtenerCitasProfesionalAsync(string profesionalCuil, DateTime? fecha);
    Task<CitaResponseDto> ObtenerPorIdAsync(int citaId);
}
