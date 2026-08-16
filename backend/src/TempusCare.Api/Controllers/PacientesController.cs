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
    public async Task<IActionResult> Alta([FromBody] AltaPerfilPacienteDto dto)
    {
        var res = await _pacienteService.AltaPerfilAsync(dto);
        return CreatedAtAction(nameof(ObtenerPerfil), new { cuil = res.Cuil }, res);
    }

    [HttpPut("{cuil}")]
    public async Task<IActionResult> Modificar(string cuil, [FromBody] ModificacionPerfilPacienteDto dto)
    {
        if (cuil != dto.Cuil)
            return BadRequest("El CUIL de la URL no coincide con el cuerpo de la solicitud.");

        var res = await _pacienteService.ModificarPerfilAsync(dto);
        return Ok(res);
    }

    [HttpDelete("{cuil}")]
    public async Task<IActionResult> Baja(string cuil)
    {
        await _pacienteService.BajaPerfilAsync(cuil);
        return NoContent();
    }

    [HttpGet]
    public async Task<IActionResult> ObtenerTodos()
    {
        var res = await _pacienteService.ObtenerTodosAsync();
        return Ok(res);
    }

    [HttpGet("{cuil}")]
    public async Task<IActionResult> ObtenerPerfil(string cuil)
    {
        var res = await _pacienteService.ObtenerPerfilAsync(cuil);
        return Ok(res);
    }
}
