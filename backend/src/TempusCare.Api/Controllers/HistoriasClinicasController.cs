using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using TempusCare.Api.Application.DTOs;
using TempusCare.Api.Application.Services;

namespace TempusCare.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class HistoriasClinicasController : ControllerBase
{
    private readonly IHistoriaClinicaService _historiaClinicaService;

    public HistoriasClinicasController(IHistoriaClinicaService historiaClinicaService)
    {
        _historiaClinicaService = historiaClinicaService;
    }

    [HttpPost]
    [Authorize(Roles = "Profesional,SuperAdmin")]
    public async Task<IActionResult> Alta([FromBody] AltaHistoriaClinicaDto dto)
    {
        var res = await _historiaClinicaService.AltaHistoriaClinicaAsync(dto);
        return CreatedAtAction(nameof(ObtenerPorId), new { id = res.Id }, res);
    }

    [HttpPut("{id}")]
    [Authorize(Roles = "Profesional,SuperAdmin")]
    public async Task<IActionResult> Modificar(int id, [FromBody] ModificarHistoriaClinicaDto dto)
    {
        if (id != dto.Id)
            return BadRequest("El ID de la URL no coincide con el cuerpo.");

        var res = await _historiaClinicaService.ModificarHistoriaClinicaAsync(dto);
        return Ok(res);
    }

    [HttpGet("paciente/{cuil}")]
    [Authorize(Roles = "Paciente,Profesional,Asistente,SuperAdmin")]
    public async Task<IActionResult> ObtenerPorPaciente(string cuil)
    {
        // RNF-SEG-03 & RNF-SEG-06: Un paciente nunca puede acceder a la historia clínica de otro paciente
        if (User.IsInRole("Paciente"))
        {
            var authenticatedUsername = User.Identity?.Name;
            if (!string.IsNullOrEmpty(authenticatedUsername) &&
                authenticatedUsername != "Usuario" &&
                !string.Equals(authenticatedUsername, cuil, StringComparison.OrdinalIgnoreCase))
            {
                return StatusCode(403, new { message = "Acceso denegado (RNF-SEG-03 / Ley 25.326): Un paciente solo puede consultar su propia historia clínica." });
            }
        }

        var res = await _historiaClinicaService.ObtenerPorPacienteCuilAsync(cuil);
        return Ok(res);
    }

    [HttpGet("{id}")]
    [Authorize(Roles = "Paciente,Profesional,Asistente,SuperAdmin")]
    public async Task<IActionResult> ObtenerPorId(int id)
    {
        var res = await _historiaClinicaService.ObtenerPorIdAsync(id);

        if (User.IsInRole("Paciente"))
        {
            var authenticatedUsername = User.Identity?.Name;
            if (!string.IsNullOrEmpty(authenticatedUsername) &&
                authenticatedUsername != "Usuario" &&
                !string.Equals(authenticatedUsername, res.PacienteCuil, StringComparison.OrdinalIgnoreCase))
            {
                return StatusCode(403, new { message = "Acceso denegado (RNF-SEG-03 / Ley 25.326): Un paciente solo puede consultar su propia historia clínica." });
            }
        }

        return Ok(res);
    }
}
