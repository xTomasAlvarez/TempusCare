using Microsoft.AspNetCore.Mvc;
using TempusCare.Api.Application.DTOs;
using TempusCare.Api.Application.Services;

namespace TempusCare.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class RecetasController : ControllerBase
{
    private readonly IRecetaService _recetaService;

    public RecetasController(IRecetaService recetaService)
    {
        _recetaService = recetaService;
    }

    [HttpPost]
    public async Task<IActionResult> Alta([FromBody] AltaRecetaDto dto)
    {
        var res = await _recetaService.AltaRecetaAsync(dto);
        return CreatedAtAction(nameof(ObtenerPorId), new { id = res.Id }, res);
    }

    [HttpPut("{id}")]
    public async Task<IActionResult> Modificar(int id, [FromBody] ModificarRecetaDto dto)
    {
        if (id != dto.Id)
            return BadRequest("El ID de la URL no coincide con el cuerpo.");

        var res = await _recetaService.ModificarRecetaAsync(dto);
        return Ok(res);
    }

    [HttpGet("cita/{citaId}")]
    public async Task<IActionResult> ObtenerPorCita(int citaId)
    {
        var res = await _recetaService.ObtenerRecetasPorCitaAsync(citaId);
        return Ok(res);
    }

    [HttpGet("{id}")]
    public async Task<IActionResult> ObtenerPorId(int id)
    {
        var res = await _recetaService.ObtenerPorIdAsync(id);
        return Ok(res);
    }
}
