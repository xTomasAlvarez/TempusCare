using Microsoft.EntityFrameworkCore;
using TempusCare.Api.Application.DTOs;
using TempusCare.Api.Application.Exceptions;
using TempusCare.Api.Domain.Entities;
using TempusCare.Api.Infrastructure.Data;

namespace TempusCare.Api.Application.Services;

public class RecetaService : IRecetaService
{
    private readonly TempusCareDbContext _db;
    private readonly ILogger<RecetaService> _logger;

    public RecetaService(TempusCareDbContext db, ILogger<RecetaService> logger)
    {
        _db = db;
        _logger = logger;
    }

    public async Task<RecetaResponseDto> AltaRecetaAsync(AltaRecetaDto dto)
    {
        _logger.LogInformation("Creando receta médica para cita ID {CitaId}", dto.CitaId);

        var cita = await _db.Citas
            .Include(c => c.Paciente)
            .Include(c => c.Turno).ThenInclude(t => t!.Agenda).ThenInclude(a => a!.Profesional)
            .FirstOrDefaultAsync(c => c.Id == dto.CitaId);

        if (cita == null)
        {
            _logger.LogWarning("Cita ID {CitaId} no encontrada para emitir receta", dto.CitaId);
            throw new CitaNotFoundException(dto.CitaId);
        }

        var receta = new Receta
        {
            CitaId = cita.Id,
            FechaEmision = DateTime.UtcNow,
            Medicamentos = dto.Medicamentos,
            Dosis = dto.Dosis,
            Indicaciones = dto.Indicaciones,
            Estado = Domain.Enums.EstadoReceta.Activa
        };

        _db.Recetas.Add(receta);
        await _db.SaveChangesAsync();
        _logger.LogInformation("Receta médica ID {RecetaId} creada exitosamente", receta.Id);

        string pacNom = $"{cita.Paciente?.Nombre} {cita.Paciente?.Apellido}";
        string profNom = $"{cita.Turno?.Agenda?.Profesional?.Nombre} {cita.Turno?.Agenda?.Profesional?.Apellido}";

        return new RecetaResponseDto(
            receta.Id,
            receta.CitaId,
            receta.FechaEmision,
            receta.Medicamentos,
            receta.Dosis,
            receta.Indicaciones,
            receta.Estado,
            pacNom,
            profNom
        );
    }

    public async Task<RecetaResponseDto> ModificarRecetaAsync(ModificarRecetaDto dto)
    {
        _logger.LogInformation("Modificando receta ID {Id}", dto.Id);

        var receta = await _db.Recetas
            .Include(r => r.Cita).ThenInclude(c => c!.Paciente)
            .Include(r => r.Cita).ThenInclude(c => c!.Turno).ThenInclude(t => t!.Agenda).ThenInclude(a => a!.Profesional)
            .FirstOrDefaultAsync(r => r.Id == dto.Id);

        if (receta == null)
        {
            _logger.LogWarning("Receta ID {Id} no encontrada", dto.Id);
            throw new RecetaNotFoundException(dto.Id);
        }

        receta.Medicamentos = dto.Medicamentos;
        receta.Dosis = dto.Dosis;
        receta.Indicaciones = dto.Indicaciones;
        receta.Estado = dto.Estado;

        await _db.SaveChangesAsync();
        _logger.LogInformation("Receta ID {Id} modificada correctamente", receta.Id);

        string pacNom = $"{receta.Cita?.Paciente?.Nombre} {receta.Cita?.Paciente?.Apellido}";
        string profNom = $"{receta.Cita?.Turno?.Agenda?.Profesional?.Nombre} {receta.Cita?.Turno?.Agenda?.Profesional?.Apellido}";

        return new RecetaResponseDto(
            receta.Id,
            receta.CitaId,
            receta.FechaEmision,
            receta.Medicamentos,
            receta.Dosis,
            receta.Indicaciones,
            receta.Estado,
            pacNom,
            profNom
        );
    }

    public async Task<List<RecetaResponseDto>> ObtenerRecetasPorCitaAsync(int citaId)
    {
        _logger.LogInformation("Obteniendo recetas para cita ID {CitaId}", citaId);

        var recetas = await _db.Recetas
            .Include(r => r.Cita).ThenInclude(c => c!.Paciente)
            .Include(r => r.Cita).ThenInclude(c => c!.Turno).ThenInclude(t => t!.Agenda).ThenInclude(a => a!.Profesional)
            .Where(r => r.CitaId == citaId)
            .ToListAsync();

        return recetas.Select(r => new RecetaResponseDto(
            r.Id,
            r.CitaId,
            r.FechaEmision,
            r.Medicamentos,
            r.Dosis,
            r.Indicaciones,
            r.Estado,
            $"{r.Cita?.Paciente?.Nombre} {r.Cita?.Paciente?.Apellido}",
            $"{r.Cita?.Turno?.Agenda?.Profesional?.Nombre} {r.Cita?.Turno?.Agenda?.Profesional?.Apellido}"
        )).ToList();
    }

    public async Task<RecetaResponseDto> ObtenerPorIdAsync(int id)
    {
        _logger.LogInformation("Obteniendo receta ID {Id}", id);

        var receta = await _db.Recetas
            .Include(r => r.Cita).ThenInclude(c => c!.Paciente)
            .Include(r => r.Cita).ThenInclude(c => c!.Turno).ThenInclude(t => t!.Agenda).ThenInclude(a => a!.Profesional)
            .FirstOrDefaultAsync(r => r.Id == id);

        if (receta == null)
        {
            _logger.LogWarning("Receta ID {Id} no encontrada", id);
            throw new RecetaNotFoundException(id);
        }

        string pacNom = $"{receta.Cita?.Paciente?.Nombre} {receta.Cita?.Paciente?.Apellido}";
        string profNom = $"{receta.Cita?.Turno?.Agenda?.Profesional?.Nombre} {receta.Cita?.Turno?.Agenda?.Profesional?.Apellido}";

        return new RecetaResponseDto(
            receta.Id,
            receta.CitaId,
            receta.FechaEmision,
            receta.Medicamentos,
            receta.Dosis,
            receta.Indicaciones,
            receta.Estado,
            pacNom,
            profNom
        );
    }
}
