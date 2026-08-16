using TempusCare.Api.Application.DTOs;

namespace TempusCare.Api.Application.Services;

public interface IInstitucionService
{
    Task<InstitucionResponseDto> AltaInstitucionAsync(AltaInstitucionDto dto);
    Task<InstitucionResponseDto> ModificarInstitucionAsync(ModificarInstitucionDto dto);
    Task BajaInstitucionAsync(int id);
    Task<List<InstitucionResponseDto>> ObtenerTodasAsync();
    Task<InstitucionResponseDto> ObtenerPorIdAsync(int id);
}
