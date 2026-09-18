using Microsoft.EntityFrameworkCore;
using TempusCare.Api.Application.DTOs;
using TempusCare.Api.Application.Exceptions;
using TempusCare.Api.Domain.Entities;
using TempusCare.Api.Infrastructure.Data;

namespace TempusCare.Api.Application.Services;

public class HistoriaClinicaService : IHistoriaClinicaService
{
    private readonly TempusCareDbContext _db;
    private readonly ILogger<HistoriaClinicaService> _logger;

    public HistoriaClinicaService(TempusCareDbContext db, ILogger<HistoriaClinicaService> logger)
    {
        _db = db;
        _logger = logger;
    }

    public async Task<HistoriaClinicaResponseDto> AltaHistoriaClinicaAsync(AltaHistoriaClinicaDto dto)
    {
        _logger.LogInformation("Creando historia clínica para paciente con CUIL {Cuil}", dto.PacienteCuil);

        var paciente = await _db.Pacientes.FirstOrDefaultAsync(p => p.Cuil == dto.PacienteCuil);
        if (paciente == null)
        {
            _logger.LogWarning("Paciente con CUIL {Cuil} no encontrado", dto.PacienteCuil);
            throw new PacienteNotFoundException(dto.PacienteCuil);
        }

        if (await _db.HistoriasClinicas.AnyAsync(h => h.PacienteCuil == dto.PacienteCuil))
        {
            _logger.LogWarning("El paciente {Cuil} ya posee historia clínica", dto.PacienteCuil);
            throw new ConflictException($"El paciente con CUIL '{dto.PacienteCuil}' ya posee una historia clínica.");
        }

        var hc = new HistoriaClinica
        {
            PacienteCuil = dto.PacienteCuil,
            Discapacidad = dto.Discapacidad,
            GrupSang = dto.GrupSang,
            Alergias = dto.Alergias,
            EnfermedadesCronicas = dto.EnfermedadesCronicas,
            Medicamentos = dto.Medicamentos,
            NombreContacto = dto.NombreContacto,
            ApellidoContacto = dto.ApellidoContacto,
            TelefonoContacto = dto.TelefonoContacto
        };

        _db.HistoriasClinicas.Add(hc);
        await _db.SaveChangesAsync();
        _logger.LogInformation("Historia clínica ID {Id} creada con éxito", hc.Id);

        return await ObtenerPorIdAsync(hc.Id);
    }

    public async Task<HistoriaClinicaResponseDto> ModificarHistoriaClinicaAsync(ModificarHistoriaClinicaDto dto)
    {
        _logger.LogInformation("Modificando historia clínica ID {Id}", dto.Id);

        var hc = await _db.HistoriasClinicas.FindAsync(dto.Id);
        if (hc == null)
        {
            _logger.LogWarning("Historia clínica ID {Id} no encontrada", dto.Id);
            throw new HistoriaClinicaNotFoundException(dto.Id);
        }

        hc.Discapacidad = dto.Discapacidad;
        hc.GrupSang = dto.GrupSang;
        hc.Alergias = dto.Alergias;
        hc.EnfermedadesCronicas = dto.EnfermedadesCronicas;
        hc.Medicamentos = dto.Medicamentos;
        hc.NombreContacto = dto.NombreContacto;
        hc.ApellidoContacto = dto.ApellidoContacto;
        hc.TelefonoContacto = dto.TelefonoContacto;

        await _db.SaveChangesAsync();
        _logger.LogInformation("Historia clínica ID {Id} modificada con éxito", hc.Id);

        return await ObtenerPorIdAsync(hc.Id);
    }

    public async Task<HistoriaClinicaResponseDto> ObtenerPorPacienteCuilAsync(string pacienteCuil)
    {
        _logger.LogInformation("Obteniendo historia clínica para paciente CUIL {Cuil}", pacienteCuil);

        var hc = await _db.HistoriasClinicas
            .Include(h => h.Paciente)
            .Include(h => h.Observaciones).ThenInclude(o => o.Profesional)
            .FirstOrDefaultAsync(h => h.PacienteCuil == pacienteCuil);

        if (hc == null)
        {
            _logger.LogWarning("Historia clínica no encontrada para paciente CUIL {Cuil}", pacienteCuil);
            throw new HistoriaClinicaNotFoundException(pacienteCuil);
        }

        return MapToDto(hc);
    }

    public async Task<HistoriaClinicaResponseDto> ObtenerPorIdAsync(int id)
    {
        _logger.LogInformation("Obteniendo historia clínica ID {Id}", id);

        var hc = await _db.HistoriasClinicas
            .Include(h => h.Paciente)
            .Include(h => h.Observaciones).ThenInclude(o => o.Profesional)
            .FirstOrDefaultAsync(h => h.Id == id);

        if (hc == null)
        {
            _logger.LogWarning("Historia clínica ID {Id} no encontrada", id);
            throw new HistoriaClinicaNotFoundException(id);
        }

        return MapToDto(hc);
    }

    private static HistoriaClinicaResponseDto MapToDto(HistoriaClinica hc)
    {
        var observacionesDto = hc.Observaciones.Select(o => new ObservacionResponseDto(
            o.Id,
            o.CitaId,
            o.HistoriaClinicaId,
            o.ProfesionalCuil,
            $"{o.Profesional?.Nombre} {o.Profesional?.Apellido}".Trim(),
            o.Motivo,
            o.Detalle
        )).ToList();

        return new HistoriaClinicaResponseDto(
            hc.Id,
            hc.PacienteCuil,
            $"{hc.Paciente?.Nombre} {hc.Paciente?.Apellido}".Trim(),
            hc.Discapacidad,
            hc.GrupSang,
            hc.Alergias,
            hc.EnfermedadesCronicas,
            hc.Medicamentos,
            hc.NombreContacto,
            hc.ApellidoContacto,
            hc.TelefonoContacto,
            observacionesDto
        );
    }
}
