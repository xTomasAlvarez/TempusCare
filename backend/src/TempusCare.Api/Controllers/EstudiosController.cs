using Microsoft.AspNetCore.Mvc;
using TempusCare.Api.Application.DTOs;
using TempusCare.Api.Application.Services;

namespace TempusCare.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class EstudiosController : ControllerBase
{
    private readonly IEstudioService _estudioService;

    public EstudiosController(IEstudioService estudioService)
    {
        _estudioService = estudioService;
    }

    [HttpPost]
    public async Task<IActionResult> Alta([FromBody] AltaEstudioDto dto)
    {
        var res = await _estudioService.AltaEstudioAsync(dto);
        return CreatedAtAction(nameof(ObtenerPorId), new { id = res.Id }, res);
    }

    [HttpPut("{id}")]
    public async Task<IActionResult> Modificar(int id, [FromBody] ModificarEstudioDto dto)
    {
        if (id != dto.Id)
            return BadRequest("El ID de la URL no coincide con el cuerpo de la solicitud.");

        var res = await _estudioService.ModificarEstudioAsync(dto);
        return Ok(res);
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> Baja(int id)
    {
        await _estudioService.BajaEstudioAsync(id);
        return NoContent();
    }

    [HttpGet]
    public async Task<IActionResult> ObtenerTodos()
    {
        var res = await _estudioService.ObtenerTodosAsync();
        return Ok(res);
    }

    [HttpGet("{id}")]
    public async Task<IActionResult> ObtenerPorId(int id)
    {
        var res = await _estudioService.ObtenerPorIdAsync(id);
        return Ok(res);
    }
}
