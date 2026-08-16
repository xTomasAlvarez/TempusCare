using TempusCare.Api.Application.DTOs;

namespace TempusCare.Api.Application.Services;

public interface IObservacionService
{
    Task<ObservacionResponseDto> CompletarObservacionAsync(CompletarObservacionDto dto);
    Task<List<ObservacionResponseDto>> ObtenerObservacionesPorHistoriaClinicaAsync(int historiaClinicaId);
    Task<List<ObservacionResponseDto>> ObtenerObservacionesPorProfesionalAsync(string profesionalCuil);
    Task<ObservacionResponseDto> ObtenerPorIdAsync(int id);
}
