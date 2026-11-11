using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using TempusCare.Api.Application.DTOs;
using TempusCare.Api.Application.Services;

namespace TempusCare.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class PacientesController : ControllerBase
{
    private readonly IPacienteService _pacienteService;

    public PacientesController(IPacienteService pacienteService)
    {
        _pacienteService = pacienteService;
    }

    [HttpPost]
    [AllowAnonymous]
    public async Task<IActionResult> Alta([FromBody] AltaPerfilPacienteDto dto)
    {
        var res = await _pacienteService.AltaPerfilAsync(dto);
        return CreatedAtAction(nameof(ObtenerPerfil), new { cuil = res.Cuil }, res);
    }

    [HttpPost("presencial")]
    [Authorize(Roles = "Asistente,AdminConsultorio,SuperAdmin")]
    public async Task<IActionResult> RegistrarPresencial([FromBody] RegistroPacientePresencialDto dto)
    {
        var res = await _pacienteService.RegistrarPresencialAsync(dto);
        return Ok(res);
    }

    [HttpPut("{cuil}")]
    [Authorize(Roles = "Paciente,SuperAdmin")]
    public async Task<IActionResult> Modificar(string cuil, [FromBody] ModificacionPerfilPacienteDto dto)
    {
        if (cuil != dto.Cuil)
            return BadRequest("El CUIL de la URL no coincide con el cuerpo de la solicitud.");

        if (User.IsInRole("Paciente"))
        {
            var authenticatedUsername = User.Identity?.Name;
            if (!string.IsNullOrEmpty(authenticatedUsername) &&
                authenticatedUsername != "Usuario" &&
                !string.Equals(authenticatedUsername, cuil, StringComparison.OrdinalIgnoreCase))
            {
                return StatusCode(403, new { message = "Acceso denegado (RNF-SEG-03): Un paciente solo puede modificar su propio perfil." });
            }
        }

        var res = await _pacienteService.ModificarPerfilAsync(dto);
        return Ok(res);
    }

    [HttpDelete("{cuil}")]
    [Authorize(Roles = "Paciente,SuperAdmin")]
    public async Task<IActionResult> Baja(string cuil)
    {
        if (User.IsInRole("Paciente"))
        {
            var authenticatedUsername = User.Identity?.Name;
            if (!string.IsNullOrEmpty(authenticatedUsername) &&
                authenticatedUsername != "Usuario" &&
                !string.Equals(authenticatedUsername, cuil, StringComparison.OrdinalIgnoreCase))
            {
                return StatusCode(403, new { message = "Acceso denegado (RNF-SEG-03): Un paciente solo puede dar de baja su propio perfil." });
            }
        }

        await _pacienteService.BajaPerfilAsync(cuil);
        return NoContent();
    }

    [HttpGet]
    [Authorize(Roles = "Asistente,AdminConsultorio,SuperAdmin")]
    public async Task<IActionResult> ObtenerTodos()
    {
        var res = await _pacienteService.ObtenerTodosAsync();
        return Ok(res);
    }

    [HttpGet("{cuil}")]
    [Authorize]
    public async Task<IActionResult> ObtenerPerfil(string cuil)
    {
        if (User.IsInRole("Paciente"))
        {
            var authenticatedUsername = User.Identity?.Name;
            if (!string.IsNullOrEmpty(authenticatedUsername) &&
                authenticatedUsername != "Usuario" &&
                !string.Equals(authenticatedUsername, cuil, StringComparison.OrdinalIgnoreCase))
            {
                return StatusCode(403, new { message = "Acceso denegado (RNF-SEG-03): Un paciente solo puede consultar su propio perfil." });
            }
        }

        var res = await _pacienteService.ObtenerPerfilAsync(cuil);
        return Ok(res);
    }
}
