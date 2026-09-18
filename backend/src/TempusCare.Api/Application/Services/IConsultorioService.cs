using TempusCare.Api.Application.DTOs;

namespace TempusCare.Api.Application.Services;

public interface IConsultorioService
{
    Task<ConsultorioResponseDto> AltaConsultorioAsync(AltaConsultorioDto dto);
    Task<ConsultorioResponseDto> ModificarConsultorioAsync(ModificarConsultorioDto dto);
    Task BajaConsultorioAsync(string cuit);
    Task<List<ConsultorioResponseDto>> ObtenerTodosAsync();
    Task<ConsultorioResponseDto> ObtenerPorCuitAsync(string cuit);
    Task<List<ConsultorioResponseDto>> ObtenerPorInstitucionAsync(int institucionId);
    Task<List<ProfesionalVinculadoDto>> ObtenerProfesionalesPorConsultorioAsync(string consultorioCuit);
    Task AsignarProfesionalAsync(string consultorioCuit, string profesionalCuil);
    Task DesasignarProfesionalAsync(string consultorioCuit, string profesionalCuil);
}
