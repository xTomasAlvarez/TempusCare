using TempusCare.Api.Application.DTOs;

namespace TempusCare.Api.Application.Services;

public interface IAgendaService
{
    Task<AgendaResponseDto> AltaAgendaAsync(AltaAgendaDto dto);
    Task<AgendaResponseDto> ModificarAgendaAsync(ModificarAgendaDto dto);
    Task EliminarAgendaAsync(int idAgenda);
    Task<List<AgendaResponseDto>> ObtenerAgendasPorProfesionalAsync(string cuilOMatricula);
}
