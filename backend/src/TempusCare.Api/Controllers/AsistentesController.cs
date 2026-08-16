using Microsoft.AspNetCore.Mvc;
using TempusCare.Api.Application.DTOs;
using TempusCare.Api.Application.Services;

namespace TempusCare.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class AsistentesController : ControllerBase
{
    private readonly IAsistenteService _asistenteService;

    public AsistentesController(IAsistenteService asistenteService)
    {
        _asistenteService = asistenteService;
    }

    [HttpPost]
    public async Task<IActionResult> Alta([FromBody] AltaAsistenteDto dto)
    {
        var res = await _asistenteService.AltaAsistenteAsync(dto);
        return CreatedAtAction(nameof(ObtenerPorCuil), new { cuil = res.Cuil }, res);
    }

    [HttpPut("{cuil}")]
    public async Task<IActionResult> Modificar(string cuil, [FromBody] ModificarAsistenteDto dto)
    {
        if (cuil != dto.Cuil)
            return BadRequest("El CUIL de la URL no coincide con el cuerpo de la solicitud.");

        var res = await _asistenteService.ModificarAsistenteAsync(dto);
        return Ok(res);
    }

    [HttpDelete("{cuil}")]
    public async Task<IActionResult> Baja(string cuil)
    {
        await _asistenteService.BajaAsistenteAsync(cuil);
        return NoContent();
    }

    [HttpGet]
    public async Task<IActionResult> ObtenerTodos()
    {
        var res = await _asistenteService.ObtenerTodosAsync();
        return Ok(res);
    }

    [HttpGet("{cuil}")]
    public async Task<IActionResult> ObtenerPorCuil(string cuil)
    {
        var res = await _asistenteService.ObtenerPorCuilAsync(cuil);
        return Ok(res);
    }
}
