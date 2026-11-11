using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;
using TempusCare.Api.Application.DTOs;
using TempusCare.Api.Application.Services;
using TempusCare.Api.Infrastructure.Data;

namespace TempusCare.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class CitasController : ControllerBase
{
    private readonly ICitaService _citaService;
    private readonly TempusCareDbContext _db;

    public CitasController(ICitaService citaService, TempusCareDbContext db)
    {
        _citaService = citaService;
        _db = db;
    }

    [HttpPost]
    [Authorize(Roles = "Paciente,Asistente,AdminConsultorio,SuperAdmin")]
    public async Task<IActionResult> Alta([FromBody] AltaCitaDto dto)
    {
        var res = await _citaService.AltaCitaAsync(dto);
        return Ok(res);
    }

    [HttpPut("{id}/estado")]
    [Authorize(Roles = "Asistente,Profesional,AdminConsultorio,SuperAdmin")]
    public async Task<IActionResult> ModificarEstado(int id, [FromBody] ModificarCitaEstadoDto dto)
    {
        if (id != dto.CitaId)
            return BadRequest("El ID de la cita no coincide.");

        var userRol = User.FindFirst(ClaimTypes.Role)?.Value ?? (User.IsInRole("Asistente") ? "Asistente" : null);
        if (dto.Estado == TempusCare.Api.Domain.Enums.EstadoCita.Atendida && User.IsInRole("Asistente"))
        {
            throw new TempusCare.Api.Application.Exceptions.BusinessException("Solo el profesional tratante puede finalizar la consulta mediante el registro de la evolución clínica.");
        }

        var res = await _citaService.ModificarCitaEstadoAsync(id, dto.Estado, userRol, dto.ForzarAtencionFueraDeHorario);
        return Ok(res);
    }

    [HttpDelete("{id}")]
    [Authorize(Roles = "Paciente,Asistente,AdminConsultorio,SuperAdmin")]
    public async Task<IActionResult> Baja(int id)
    {
        await _citaService.BajaCitaAsync(id);
        return NoContent();
    }

    [HttpGet("paciente/{cuil}")]
    [Authorize(Roles = "Paciente,Asistente,SuperAdmin")]
    public async Task<IActionResult> ObtenerCitasPaciente(string cuil)
    {
        if (User.IsInRole("Paciente"))
        {
            var authenticatedUsername = User.Identity?.Name;
            if (!string.IsNullOrEmpty(authenticatedUsername) &&
                authenticatedUsername != "Usuario" &&
                !string.Equals(authenticatedUsername, cuil, StringComparison.OrdinalIgnoreCase))
            {
                return StatusCode(403, new { message = "Acceso denegado (RNF-SEG-03): Un paciente solo puede consultar sus propias citas." });
            }
        }

        var res = await _citaService.ObtenerCitasPacienteAsync(cuil);
        return Ok(res);
    }

    [HttpGet("profesional/{cuil}")]
    [Authorize(Roles = "Profesional,Asistente,AdminConsultorio,SuperAdmin")]
    public async Task<IActionResult> ObtenerCitasProfesional(string cuil, [FromQuery] DateTime? fecha, [FromQuery] string? consultorioCuit)
    {
        var res = await _citaService.ObtenerCitasProfesionalAsync(cuil, fecha, consultorioCuit);
        return Ok(res);
    }

    [HttpGet("{id}")]
    [Authorize]
    public async Task<IActionResult> ObtenerPorId(int id)
    {
        var res = await _citaService.ObtenerPorIdAsync(id);

        if (User.IsInRole("SuperAdmin") || User.IsInRole("AdminInstitucion"))
        {
            return Ok(res);
        }

        var userIdStr = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        int.TryParse(userIdStr, out int userId);

        var citaInfo = await _db.Citas
            .Where(c => c.Id == id)
            .Select(c => new
            {
                c.PacienteCuil,
                ProfesionalCuil = c.Turno != null && c.Turno.Agenda != null ? c.Turno.Agenda.ProfesionalCuil : null,
                ConsultorioCuit = c.Turno != null && c.Turno.Agenda != null ? c.Turno.Agenda.ConsultorioCuit : null
            })
            .FirstOrDefaultAsync();

        if (citaInfo == null)
        {
            return NotFound();
        }

        if (User.IsInRole("Paciente"))
        {
            var paciente = await _db.Pacientes.FirstOrDefaultAsync(p => p.UsuarioId == userId);
            if (paciente == null || paciente.Cuil != citaInfo.PacienteCuil)
            {
                return Forbid();
            }
            return Ok(res);
        }

        if (User.IsInRole("Profesional"))
        {
            var prof = await _db.Profesionales.FirstOrDefaultAsync(p => p.UsuarioId == userId);
            if (prof == null || prof.Cuil != citaInfo.ProfesionalCuil)
            {
                return Forbid();
            }
            return Ok(res);
        }

        if (User.IsInRole("Asistente"))
        {
            var cuitClaim = User.FindFirst("ConsultorioCuit")?.Value;
            var asistente = await _db.Asistentes.FirstOrDefaultAsync(a => a.UsuarioId == userId);
            var cuitAsistente = cuitClaim ?? asistente?.ConsultorioCuit;
            if (string.IsNullOrEmpty(cuitAsistente) || cuitAsistente != citaInfo.ConsultorioCuit)
            {
                return Forbid();
            }
            return Ok(res);
        }

        if (User.IsInRole("AdminConsultorio") || User.IsInRole("AdminSede"))
        {
            var cuitClaim = User.FindFirst("ConsultorioCuit")?.Value;
            var admin = await _db.AdministradoresConsultorio.FirstOrDefaultAsync(a => a.UsuarioId == userId);
            var cuitAdmin = cuitClaim ?? admin?.ConsultorioCuit;
            if (string.IsNullOrEmpty(cuitAdmin) || cuitAdmin != citaInfo.ConsultorioCuit)
            {
                return Forbid();
            }
            return Ok(res);
        }

        return Forbid();
    }
}
