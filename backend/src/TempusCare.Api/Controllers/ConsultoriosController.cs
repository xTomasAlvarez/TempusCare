using Microsoft.AspNetCore.Mvc;
using TempusCare.Api.Application.DTOs;
using TempusCare.Api.Application.Services;

namespace TempusCare.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class ConsultoriosController : ControllerBase
{
    private readonly IConsultorioService _consultorioService;

    public ConsultoriosController(IConsultorioService consultorioService)
    {
        _consultorioService = consultorioService;
    }

    [HttpPost]
    public async Task<IActionResult> Alta([FromBody] AltaConsultorioDto dto)
    {
        var res = await _consultorioService.AltaConsultorioAsync(dto);
        return CreatedAtAction(nameof(ObtenerPorCuit), new { cuit = res.Cuit }, res);
    }

    [HttpPut("{cuit}")]
    public async Task<IActionResult> Modificar(string cuit, [FromBody] ModificarConsultorioDto dto)
    {
        if (cuit != dto.Cuit)
            return BadRequest("El CUIT de la URL no coincide con el cuerpo de la solicitud.");

        var res = await _consultorioService.ModificarConsultorioAsync(dto);
        return Ok(res);
    }

    [HttpDelete("{cuit}")]
    public async Task<IActionResult> Baja(string cuit)
    {
        await _consultorioService.BajaConsultorioAsync(cuit);
        return NoContent();
    }

    [HttpGet]
    public async Task<IActionResult> ObtenerTodos()
    {
        var res = await _consultorioService.ObtenerTodosAsync();
        return Ok(res);
    }

    [HttpGet("{cuit}")]
    public async Task<IActionResult> ObtenerPorCuit(string cuit)
    {
        var res = await _consultorioService.ObtenerPorCuitAsync(cuit);
        return Ok(res);
    }
}
