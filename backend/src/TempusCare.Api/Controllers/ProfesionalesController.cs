using Microsoft.AspNetCore.Mvc;
using TempusCare.Api.Application.DTOs;
using TempusCare.Api.Application.Services;

namespace TempusCare.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class ProfesionalesController : ControllerBase
{
    private readonly IProfesionalService _profesionalService;

    public ProfesionalesController(IProfesionalService profesionalService)
    {
        _profesionalService = profesionalService;
    }

    [HttpPost]
    public async Task<IActionResult> Alta([FromBody] AltaProfesionalDto dto)
    {
        var res = await _profesionalService.AltaProfesionalAsync(dto);
        return CreatedAtAction(nameof(ObtenerPorCuil), new { cuil = res.Cuil }, res);
    }

    [HttpPut("{cuil}")]
    public async Task<IActionResult> Modificar(string cuil, [FromBody] ModificarProfesionalDto dto)
    {
        if (cuil != dto.Cuil)
            return BadRequest("El CUIL de la URL no coincide con el cuerpo de la solicitud.");

        var res = await _profesionalService.ModificarProfesionalAsync(dto);
        return Ok(res);
    }

    [HttpDelete("{cuil}")]
    public async Task<IActionResult> Baja(string cuil)
    {
        await _profesionalService.BajaProfesionalAsync(cuil);
        return NoContent();
    }

    [HttpGet]
    public async Task<IActionResult> Consultar(
        [FromQuery] string? nombre,
        [FromQuery] int? especialidadId,
        [FromQuery] int? obraSocialId,
        [FromQuery] string? consultorioCuit)
    {
        var res = await _profesionalService.ConsultarProfesionalesAsync(nombre, especialidadId, obraSocialId, consultorioCuit);
        return Ok(res);
    }

    [HttpGet("{cuil}")]
    public async Task<IActionResult> ObtenerPorCuil(string cuil)
    {
        var res = await _profesionalService.ObtenerPorCuilAsync(cuil);
        return Ok(res);
    }

    [HttpPost("{cuil}/estudios")]
    public async Task<IActionResult> AsignarEstudio(string cuil, [FromBody] AsignarEstudioProfesionalDto dto)
    {
        var res = await _profesionalService.AsignarEstudioAsync(cuil, dto);
        return Ok(res);
    }

    [HttpDelete("{cuil}/estudios/{estudioId}")]
    public async Task<IActionResult> DesasignarEstudio(string cuil, int estudioId)
    {
        await _profesionalService.DesasignarEstudioAsync(cuil, estudioId);
        return NoContent();
    }

    [HttpGet("{cuil}/estudios")]
    public async Task<IActionResult> ObtenerEstudios(string cuil)
    {
        var res = await _profesionalService.ObtenerEstudiosPorProfesionalAsync(cuil);
        return Ok(res);
    }
}
