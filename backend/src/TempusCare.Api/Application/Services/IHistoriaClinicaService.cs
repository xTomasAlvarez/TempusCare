using TempusCare.Api.Application.DTOs;

namespace TempusCare.Api.Application.Services;

public interface IHistoriaClinicaService
{
    Task<HistoriaClinicaResponseDto> AltaHistoriaClinicaAsync(AltaHistoriaClinicaDto dto);
    Task<HistoriaClinicaResponseDto> ModificarHistoriaClinicaAsync(ModificarHistoriaClinicaDto dto);
    Task<HistoriaClinicaResponseDto> ObtenerPorPacienteCuilAsync(string pacienteCuil);
    Task<HistoriaClinicaResponseDto> ObtenerPorIdAsync(int id);
}
