using TempusCare.Api.Application.DTOs;

namespace TempusCare.Api.Application.Services;

public interface IAdministradorService
{
    Task<AdminInstitucionResponseDto> AltaAdminInstitucionAsync(AltaAdminInstitucionDto dto);
    Task<List<AdminInstitucionResponseDto>> ObtenerAdminsInstitucionAsync(int? institucionId);
    Task<AdminInstitucionResponseDto> ObtenerAdminInstitucionPorCuilAsync(string cuil);

    Task<AdminConsultorioResponseDto> AltaAdminConsultorioAsync(AltaAdminConsultorioDto dto);
    Task<List<AdminConsultorioResponseDto>> ObtenerAdminsConsultorioAsync(string? consultorioCuit);
    Task<AdminConsultorioResponseDto> ObtenerAdminConsultorioPorCuilAsync(string cuil);
}
