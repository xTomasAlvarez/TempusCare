using TempusCare.Api.Application.DTOs;

namespace TempusCare.Api.Application.Services;

public interface IEstudioService
{
    Task<EstudioResponseDto> AltaEstudioAsync(AltaEstudioDto dto);
    Task<EstudioResponseDto> ModificarEstudioAsync(ModificarEstudioDto dto);
    Task BajaEstudioAsync(int id);
    Task<List<EstudioResponseDto>> ObtenerTodosAsync(int? especialidadId = null);
    Task<List<EstudioResponseDto>> ObtenerPorEspecialidadAsync(int especialidadId);
    Task<EstudioResponseDto> ObtenerPorIdAsync(int id);
}
