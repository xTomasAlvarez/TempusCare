using TempusCare.Api.Application.DTOs;

namespace TempusCare.Api.Application.Services;

public interface IVitalityService
{
    Task<VitalityMetricsDto> GetMetricsAsync();
    Task<SystemStatusDto> GetSystemStatusAsync();
    Task<List<SolicitudAdminResponseDto>> GetSolicitudesAdminsAsync();
    Task<List<SuperAdminResponseDto>> GetSuperAdminsAsync();
    Task<object> ProponerSuperAdminAsync(ProponerAdminDto dto, int? proponenteUsuarioId);
    Task<object> AprobarSuperAdminAsync(int solicitudId, int? aprobadorUsuarioId);
    Task<object> RechazarSuperAdminAsync(int solicitudId, int? resolutorUsuarioId);
}
