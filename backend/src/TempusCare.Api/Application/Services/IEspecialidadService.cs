using TempusCare.Api.Application.DTOs;

namespace TempusCare.Api.Application.Services;

public interface IEspecialidadService
{
    Task<EspecialidadDto> AltaEspecialidadAsync(AltaEspecialidadDto dto);
    Task<EspecialidadDto> ModificarEspecialidadAsync(ModificarEspecialidadDto dto);
    Task EliminarEspecialidadAsync(int id);
    Task<List<EspecialidadDto>> ObtenerTodasAsync();
    Task<EspecialidadDto> ObtenerPorIdAsync(int id);
}
