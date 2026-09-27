using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using TempusCare.Api.Application.DTOs;
using TempusCare.Api.Application.Services;

namespace TempusCare.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class CitasController : ControllerBase
{
    private readonly ICitaService _citaService;

    public CitasController(ICitaService citaService)
    {
        _citaService = citaService;
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

        var res = await _citaService.ModificarCitaEstadoAsync(id, dto.Estado);
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
        return Ok(res);
    }
}
