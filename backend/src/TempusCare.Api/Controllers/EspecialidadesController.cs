using Microsoft.AspNetCore.Mvc;
using TempusCare.Api.Application.DTOs;
using TempusCare.Api.Application.Services;

namespace TempusCare.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class EspecialidadesController : ControllerBase
{
    private readonly IEspecialidadService _especialidadService;

    public EspecialidadesController(IEspecialidadService especialidadService)
    {
        _especialidadService = especialidadService;
    }

    [HttpPost]
    public async Task<IActionResult> Alta([FromBody] AltaEspecialidadDto dto)
    {
        var res = await _especialidadService.AltaEspecialidadAsync(dto);
        return CreatedAtAction(nameof(ObtenerPorId), new { id = res.Id }, res);
    }

    [HttpPut("{id}")]
    public async Task<IActionResult> Modificar(int id, [FromBody] ModificarEspecialidadDto dto)
    {
        if (id != dto.Id)
            return BadRequest("El ID de la URL no coincide con el cuerpo de la solicitud.");

        var res = await _especialidadService.ModificarEspecialidadAsync(dto);
        return Ok(res);
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> Eliminar(int id)
    {
        await _especialidadService.EliminarEspecialidadAsync(id);
        return NoContent();
    }

    [HttpGet]
    public async Task<IActionResult> ObtenerTodas()
    {
        var res = await _especialidadService.ObtenerTodasAsync();
        return Ok(res);
    }

    [HttpGet("{id}")]
    public async Task<IActionResult> ObtenerPorId(int id)
    {
        var res = await _especialidadService.ObtenerPorIdAsync(id);
        return Ok(res);
    }
}
