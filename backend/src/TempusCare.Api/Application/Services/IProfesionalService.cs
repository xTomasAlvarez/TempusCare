using TempusCare.Api.Application.DTOs;

namespace TempusCare.Api.Application.Services;

public interface IProfesionalService
{
    Task<ProfesionalResponseDto> AltaProfesionalAsync(AltaProfesionalDto dto);
    Task<ProfesionalResponseDto> ModificarProfesionalAsync(ModificarProfesionalDto dto);
    Task BajaProfesionalAsync(string cuil);
    Task<List<ProfesionalResponseDto>> ConsultarProfesionalesAsync(int? especialidadId, int? obraSocialId, string? consultorioCuit, string? matricula);
    Task<ProfesionalResponseDto> ObtenerPorCuilAsync(string cuil);
}
