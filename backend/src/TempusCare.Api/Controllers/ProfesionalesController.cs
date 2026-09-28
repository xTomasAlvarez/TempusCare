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
public class ProfesionalesController : ControllerBase
{
    private readonly IProfesionalService _profesionalService;
    private readonly TempusCareDbContext _db;

    public ProfesionalesController(IProfesionalService profesionalService, TempusCareDbContext db)
    {
        _profesionalService = profesionalService;
        _db = db;
    }

    [HttpPost]
    [Authorize(Roles = "AdminSede")]
    public async Task<IActionResult> Alta([FromBody] AltaProfesionalDto dto)
    {
        var adminConsultorioCuit = await ObtenerConsultorioCuitAdminAsync();
        if (string.IsNullOrEmpty(adminConsultorioCuit))
        {
            return BadRequest("El administrador no posee una sede física asignada para asociar profesionales.");
        }

        // Asignación automática estricta del consultorio del administrador logueado
        var cuits = new List<string> { adminConsultorioCuit };
        dto = dto with { ConsultoriosCuits = cuits };

        var res = await _profesionalService.AltaProfesionalAsync(dto);
        return CreatedAtAction(nameof(ObtenerPorCuil), new { cuil = res.Cuil }, res);
    }

    [HttpPut("{cuil}")]
    [Authorize(Roles = "AdminSede")]
    public async Task<IActionResult> Modificar(string cuil, [FromBody] ModificarProfesionalDto dto)
    {
        if (cuil != dto.Cuil)
            return BadRequest("El CUIL de la URL no coincide con el cuerpo de la solicitud.");

        var adminConsultorioCuit = await ObtenerConsultorioCuitAdminAsync();
        if (string.IsNullOrEmpty(adminConsultorioCuit))
        {
            return BadRequest("El administrador no posee una sede física asignada.");
        }

        // Restricción: verificar que el profesional pertenezca a la sede del administrador logueado
        var pertenece = await _db.ProfesionalConsultorios
            .AnyAsync(pc => pc.ProfesionalCuil == cuil && pc.ConsultorioCuit == adminConsultorioCuit);
        if (!pertenece)
        {
            return StatusCode(StatusCodes.Status403Forbidden, "No tiene permisos para modificar profesionales de otra sede.");
        }

        // Preservar la sede del administrador en la lista de consultorios
        var cuits = dto.ConsultoriosCuits != null ? new List<string>(dto.ConsultoriosCuits) : new List<string>();
        if (!cuits.Contains(adminConsultorioCuit))
        {
            cuits.Add(adminConsultorioCuit);
        }
        dto = dto with { ConsultoriosCuits = cuits };

        var res = await _profesionalService.ModificarProfesionalAsync(dto);
        return Ok(res);
    }

    [HttpDelete("{cuil}")]
    [Authorize(Roles = "AdminSede")]
    public async Task<IActionResult> Baja(string cuil)
    {
        var adminConsultorioCuit = await ObtenerConsultorioCuitAdminAsync();
        if (!string.IsNullOrEmpty(adminConsultorioCuit))
        {
            var pertenece = await _db.ProfesionalConsultorios
                .AnyAsync(pc => pc.ProfesionalCuil == cuil && pc.ConsultorioCuit == adminConsultorioCuit);
            if (!pertenece)
            {
                return StatusCode(StatusCodes.Status403Forbidden, "No tiene permisos para dar de baja profesionales de otra sede.");
            }
        }

        await _profesionalService.BajaProfesionalAsync(cuil);
        return NoContent();
    }

    private async Task<string?> ObtenerConsultorioCuitAdminAsync()
    {
        var cuitClaim = User.FindFirst("ConsultorioCuit")?.Value;
        if (!string.IsNullOrEmpty(cuitClaim))
            return cuitClaim;

        var userIdStr = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        if (int.TryParse(userIdStr, out int userId))
        {
            var admin = await _db.AdministradoresConsultorio
                .FirstOrDefaultAsync(a => a.UsuarioId == userId);
            if (admin != null)
                return admin.ConsultorioCuit;
        }

        var fallbackAdmin = await _db.AdministradoresConsultorio.FirstOrDefaultAsync();
        return fallbackAdmin?.ConsultorioCuit;
    }

    [HttpGet]
    [AllowAnonymous]
    public async Task<IActionResult> Consultar(
        [FromQuery] string? nombre,
        [FromQuery] string? busqueda,
        [FromQuery] int? especialidadId,
        [FromQuery] int? obraSocialId,
        [FromQuery] string? consultorioCuit)
    {
        var termino = !string.IsNullOrWhiteSpace(busqueda) ? busqueda : nombre;
        var res = await _profesionalService.ConsultarProfesionalesAsync(termino, especialidadId, obraSocialId, consultorioCuit);
        return Ok(res);
    }

    [HttpGet("{cuil}")]
    [AllowAnonymous]
    public async Task<IActionResult> ObtenerPorCuil(string cuil)
    {
        var res = await _profesionalService.ObtenerPorCuilAsync(cuil);
        return Ok(res);
    }

    [HttpPost("{cuil}/estudios")]
    [Authorize(Roles = "Asistente,SuperAdmin")]
    public async Task<IActionResult> AsignarEstudio(string cuil, [FromBody] AsignarEstudioProfesionalDto dto)
    {
        var res = await _profesionalService.AsignarEstudioAsync(cuil, dto);
        return Ok(res);
    }

    [HttpDelete("{cuil}/estudios/{estudioId}")]
    [Authorize(Roles = "Asistente,SuperAdmin")]
    public async Task<IActionResult> DesasignarEstudio(string cuil, int estudioId)
    {
        await _profesionalService.DesasignarEstudioAsync(cuil, estudioId);
        return NoContent();
    }

    [HttpGet("{cuil}/estudios")]
    [AllowAnonymous]
    public async Task<IActionResult> ObtenerEstudios(string cuil)
    {
        var res = await _profesionalService.ObtenerEstudiosPorProfesionalAsync(cuil);
        return Ok(res);
    }
}
