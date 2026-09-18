using Microsoft.AspNetCore.Mvc;
using TempusCare.Api.Application.DTOs;
using TempusCare.Api.Application.Services;

namespace TempusCare.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class InstitucionesController : ControllerBase
{
    private readonly IInstitucionService _institucionService;

    public InstitucionesController(IInstitucionService institucionService)
    {
        _institucionService = institucionService;
    }

    [HttpPost]
    public async Task<IActionResult> Alta([FromBody] AltaInstitucionDto dto)
    {
        var res = await _institucionService.AltaInstitucionAsync(dto);
        return CreatedAtAction(nameof(ObtenerPorId), new { id = res.Id }, res);
    }

    [HttpPut("{id}")]
    public async Task<IActionResult> Modificar(int id, [FromBody] ModificarInstitucionDto dto)
    {
        if (id != dto.Id)
            return BadRequest("El ID de la URL no coincide con el cuerpo de la solicitud.");

        var res = await _institucionService.ModificarInstitucionAsync(dto);
        return Ok(res);
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> Baja(int id)
    {
        await _institucionService.BajaInstitucionAsync(id);
        return NoContent();
    }

    [HttpGet]
    public async Task<IActionResult> ObtenerTodas()
    {
        var res = await _institucionService.ObtenerTodasAsync();
        return Ok(res);
    }

    [HttpGet("{id}")]
    public async Task<IActionResult> ObtenerPorId(int id)
    {
        var res = await _institucionService.ObtenerPorIdAsync(id);
        return Ok(res);
    }

    [HttpGet("{id}/asistentes")]
    public async Task<IActionResult> ObtenerAsistentes(int id)
    {
        var res = await _institucionService.ObtenerAsistentesInstitucionAsync(id);
        return Ok(res);
    }

    [HttpGet("{id}/consultorios")]
    public async Task<IActionResult> ObtenerConsultorios(int id)
    {
        var res = await _institucionService.ObtenerConsultoriosInstitucionAsync(id);
        return Ok(res);
    }
}
