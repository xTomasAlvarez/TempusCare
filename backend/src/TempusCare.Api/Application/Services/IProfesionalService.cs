using TempusCare.Api.Application.DTOs;

namespace TempusCare.Api.Application.Services;

public interface IProfesionalService
{
    Task<ProfesionalResponseDto> AltaProfesionalAsync(AltaProfesionalDto dto);
    Task<ProfesionalResponseDto> ModificarProfesionalAsync(ModificarProfesionalDto dto);
    Task BajaProfesionalAsync(string cuil);
    Task<List<ProfesionalResponseDto>> ConsultarProfesionalesAsync(string? nombre, int? especialidadId, int? obraSocialId, string? consultorioCuit);
    Task<ProfesionalResponseDto> ObtenerPorCuilAsync(string cuil);

    // Métodos de administración operativa del Asistente (Estudios y Coberturas)
    Task<ProfesionalEstudioResponseDto> AsignarEstudioAsync(string profesionalCuil, AsignarEstudioProfesionalDto dto);
    Task DesasignarEstudioAsync(string profesionalCuil, int estudioId);
    Task<List<ProfesionalEstudioResponseDto>> ObtenerEstudiosPorProfesionalAsync(string profesionalCuil);
}
