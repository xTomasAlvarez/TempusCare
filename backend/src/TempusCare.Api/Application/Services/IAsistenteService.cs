using TempusCare.Api.Application.DTOs;

namespace TempusCare.Api.Application.Services;

public interface IAsistenteService
{
    Task<AsistenteResponseDto> AltaAsistenteAsync(AltaAsistenteDto dto);
    Task<AsistenteResponseDto> ModificarAsistenteAsync(ModificarAsistenteDto dto);
    Task BajaAsistenteAsync(string cuil);
    Task<AsistenteResponseDto> ObtenerPorCuilAsync(string cuil);
    Task<List<AsistenteResponseDto>> ObtenerTodosAsync();
    Task AsignarAgendaAsync(string asistenteCuil, int agendaId);
    Task RemoverAgendaAsync(string asistenteCuil, int agendaId);
    Task<List<AgendaResponseDto>> ObtenerAgendasAsignadasAsync(string asistenteCuil);
    Task<bool> ValidarPermisoAsistenteAgendaAsync(string asistenteCuil, int agendaId);
}
