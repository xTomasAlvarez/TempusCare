using TempusCare.Api.Application.DTOs;

namespace TempusCare.Api.Application.Services;

public interface ICuestionarioService
{
    Task<CuestionarioResponseDto> CompletarCuestionarioAsync(CompletarCuestionarioDto dto);
    Task<CuestionarioResponseDto> ObtenerPorCitaIdAsync(int citaId);
}
