using TempusCare.Api.Application.DTOs;

namespace TempusCare.Api.Application.Services;

public interface IRecetaService
{
    Task<RecetaResponseDto> AltaRecetaAsync(AltaRecetaDto dto);
    Task<RecetaResponseDto> ModificarRecetaAsync(ModificarRecetaDto dto);
    Task<List<RecetaResponseDto>> ObtenerRecetasPorCitaAsync(int citaId);
    Task<RecetaResponseDto> ObtenerPorIdAsync(int id);
}
