using TempusCare.Api.Application.DTOs;

namespace TempusCare.Api.Application.Services;

public interface IObraSocialService
{
    Task<ObraSocialDto> AltaObraSocialAsync(AltaObraSocialDto dto);
    Task<ObraSocialDto> ModificarObraSocialAsync(ModificarObraSocialDto dto);
    Task EliminarObraSocialAsync(int id);
    Task<List<ObraSocialDto>> ObtenerTodasAsync();
    Task<ObraSocialDto> ObtenerPorIdAsync(int id);
}
