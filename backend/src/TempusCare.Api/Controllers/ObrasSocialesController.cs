using Microsoft.AspNetCore.Mvc;
using TempusCare.Api.Application.DTOs;
using TempusCare.Api.Application.Services;

namespace TempusCare.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class ObrasSocialesController : ControllerBase
{
    private readonly IObraSocialService _obraSocialService;

    public ObrasSocialesController(IObraSocialService obraSocialService)
    {
        _obraSocialService = obraSocialService;
    }

    [HttpPost]
    public async Task<IActionResult> Alta([FromBody] AltaObraSocialDto dto)
    {
        var res = await _obraSocialService.AltaObraSocialAsync(dto);
        return CreatedAtAction(nameof(ObtenerPorId), new { id = res.Id }, res);
    }

    [HttpPut("{id}")]
    public async Task<IActionResult> Modificar(int id, [FromBody] ModificarObraSocialDto dto)
    {
        if (id != dto.Id)
            return BadRequest("El ID de la URL no coincide con el cuerpo de la solicitud.");

        var res = await _obraSocialService.ModificarObraSocialAsync(dto);
        return Ok(res);
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> Eliminar(int id)
    {
        await _obraSocialService.EliminarObraSocialAsync(id);
        return NoContent();
    }

    [HttpGet]
    public async Task<IActionResult> ObtenerTodas()
    {
        var res = await _obraSocialService.ObtenerTodasAsync();
        return Ok(res);
    }

    [HttpGet("{id}")]
    public async Task<IActionResult> ObtenerPorId(int id)
    {
        var res = await _obraSocialService.ObtenerPorIdAsync(id);
        return Ok(res);
    }
}
