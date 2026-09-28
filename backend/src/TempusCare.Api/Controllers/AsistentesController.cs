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
public class AsistentesController : ControllerBase
{
    private readonly IAsistenteService _asistenteService;
    private readonly TempusCareDbContext _db;

    public AsistentesController(IAsistenteService asistenteService, TempusCareDbContext db)
    {
        _asistenteService = asistenteService;
        _db = db;
    }

    [HttpPost]
    [Authorize(Roles = "AdminSede")]
    public async Task<IActionResult> Alta([FromBody] AltaAsistenteDto dto)
    {
        var (adminConsultorioCuit, adminCuil) = await ObtenerDatosAdminSedeAsync();
        if (string.IsNullOrEmpty(adminConsultorioCuit))
        {
            return BadRequest("El administrador no posee una sede física asignada para asociar asistentes.");
        }

        // Asignación automática estricta del consultorio y cuil del administrador logueado
        dto = dto with
        {
            ConsultorioCuit = adminConsultorioCuit,
            AdminConsultorioCuil = adminCuil
        };

        var res = await _asistenteService.AltaAsistenteAsync(dto);
        return CreatedAtAction(nameof(ObtenerPorCuil), new { cuil = res.Cuil }, res);
    }

    [HttpPut("{cuil}")]
    [Authorize(Roles = "AdminSede")]
    public async Task<IActionResult> Modificar(string cuil, [FromBody] ModificarAsistenteDto dto)
    {
        if (cuil != dto.Cuil)
            return BadRequest("El CUIL de la URL no coincide con el cuerpo de la solicitud.");

        var (adminConsultorioCuit, adminCuil) = await ObtenerDatosAdminSedeAsync();
        if (string.IsNullOrEmpty(adminConsultorioCuit))
        {
            return BadRequest("El administrador no posee una sede física asignada.");
        }

        // Restricción: verificar que el asistente pertenezca a la sede del administrador logueado
        var asistente = await _db.Asistentes.FirstOrDefaultAsync(a => a.Cuil == cuil);
        if (asistente == null)
        {
            return NotFound("Asistente no encontrado.");
        }

        if (asistente.ConsultorioCuit != adminConsultorioCuit)
        {
            return StatusCode(StatusCodes.Status403Forbidden, "No tiene permisos para modificar asistentes de otra sede.");
        }

        // Preservar la sede del administrador logueado
        dto = dto with
        {
            ConsultorioCuit = adminConsultorioCuit,
            AdminConsultorioCuil = adminCuil
        };

        var res = await _asistenteService.ModificarAsistenteAsync(dto);
        return Ok(res);
    }

    [HttpDelete("{cuil}")]
    [Authorize(Roles = "AdminSede")]
    public async Task<IActionResult> Baja(string cuil)
    {
        var (adminConsultorioCuit, _) = await ObtenerDatosAdminSedeAsync();
        if (!string.IsNullOrEmpty(adminConsultorioCuit))
        {
            var asistente = await _db.Asistentes.FirstOrDefaultAsync(a => a.Cuil == cuil);
            if (asistente == null)
            {
                return NotFound("Asistente no encontrado.");
            }

            if (asistente.ConsultorioCuit != adminConsultorioCuit)
            {
                return StatusCode(StatusCodes.Status403Forbidden, "No tiene permisos para dar de baja asistentes de otra sede.");
            }
        }

        await _asistenteService.BajaAsistenteAsync(cuil);
        return NoContent();
    }

    [HttpGet]
    [Authorize(Roles = "AdminSede,AdminConsultorio,SuperAdmin")]
    public async Task<IActionResult> ObtenerTodos([FromQuery] string? consultorioCuit)
    {
        var cuitFiltro = consultorioCuit;
        if (string.IsNullOrEmpty(cuitFiltro))
        {
            var (adminConsultorioCuit, _) = await ObtenerDatosAdminSedeAsync();
            cuitFiltro = adminConsultorioCuit;
        }

        if (!string.IsNullOrEmpty(cuitFiltro))
        {
            var filtrados = await _asistenteService.ObtenerPorConsultorioAsync(cuitFiltro);
            return Ok(filtrados);
        }

        var res = await _asistenteService.ObtenerTodosAsync();
        return Ok(res);
    }

    [HttpGet("consultorio/{cuit}")]
    [Authorize(Roles = "AdminSede,AdminConsultorio,SuperAdmin")]
    public async Task<IActionResult> ObtenerPorConsultorio(string cuit)
    {
        var res = await _asistenteService.ObtenerPorConsultorioAsync(cuit);
        return Ok(res);
    }

    [HttpGet("{cuil}")]
    [Authorize(Roles = "AdminSede,AdminConsultorio,AdminInstitucion,Institucion,SuperAdmin")]
    public async Task<IActionResult> ObtenerPorCuil(string cuil)
    {
        var res = await _asistenteService.ObtenerPorCuilAsync(cuil);
        return Ok(res);
    }

    private async Task<(string? Cuit, string? Cuil)> ObtenerDatosAdminSedeAsync()
    {
        var cuitClaim = User.FindFirst("ConsultorioCuit")?.Value;
        var userIdStr = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        if (int.TryParse(userIdStr, out int userId))
        {
            var admin = await _db.AdministradoresConsultorio
                .FirstOrDefaultAsync(a => a.UsuarioId == userId);
            if (admin != null)
                return (admin.ConsultorioCuit, admin.Cuil);
        }

        if (!string.IsNullOrEmpty(cuitClaim))
            return (cuitClaim, null);

        var fallbackAdmin = await _db.AdministradoresConsultorio.FirstOrDefaultAsync();
        return (fallbackAdmin?.ConsultorioCuit, fallbackAdmin?.Cuil);
    }

    [HttpPost("{cuil}/agendas/{agendaId}")]
    public async Task<IActionResult> AsignarAgenda(string cuil, int agendaId)
    {
        await _asistenteService.AsignarAgendaAsync(cuil, agendaId);
        return NoContent();
    }

    [HttpDelete("{cuil}/agendas/{agendaId}")]
    public async Task<IActionResult> RemoverAgenda(string cuil, int agendaId)
    {
        await _asistenteService.RemoverAgendaAsync(cuil, agendaId);
        return NoContent();
    }

    [HttpGet("{cuil}/agendas")]
    public async Task<IActionResult> ObtenerAgendasAsignadas(string cuil)
    {
        var res = await _asistenteService.ObtenerAgendasAsignadasAsync(cuil);
        return Ok(res);
    }

    [HttpGet("{cuil}/agendas/{agendaId}/permiso")]
    public async Task<IActionResult> ValidarPermisoAgenda(string cuil, int agendaId)
    {
        var tienePermiso = await _asistenteService.ValidarPermisoAsistenteAgendaAsync(cuil, agendaId);
        return Ok(new { cuil, agendaId, tienePermiso });
    }
}
