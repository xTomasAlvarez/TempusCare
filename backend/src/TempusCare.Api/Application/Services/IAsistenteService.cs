using TempusCare.Api.Application.DTOs;

namespace TempusCare.Api.Application.Services;

public interface IAsistenteService
{
    Task<AsistenteResponseDto> AltaAsistenteAsync(AltaAsistenteDto dto);
    Task<AsistenteResponseDto> ModificarAsistenteAsync(ModificarAsistenteDto dto);
    Task BajaAsistenteAsync(string cuil);
    Task<AsistenteResponseDto> ObtenerPorCuilAsync(string cuil);
    Task<List<AsistenteResponseDto>> ObtenerTodosAsync();
}
