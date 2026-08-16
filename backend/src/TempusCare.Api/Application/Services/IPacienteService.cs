using TempusCare.Api.Application.DTOs;

namespace TempusCare.Api.Application.Services;

public interface IPacienteService
{
    Task<PacientePerfilResponseDto> AltaPerfilAsync(AltaPerfilPacienteDto dto);
    Task<PacientePerfilResponseDto> ModificarPerfilAsync(ModificacionPerfilPacienteDto dto);
    Task BajaPerfilAsync(string cuil);
    Task<PacientePerfilResponseDto> ObtenerPerfilAsync(string cuil);
    Task<List<PacientePerfilResponseDto>> ObtenerTodosAsync();
}
