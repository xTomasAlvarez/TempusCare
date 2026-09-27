using Microsoft.AspNetCore.Authorization;
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
    [Authorize(Roles = "SuperAdmin")]
    public async Task<IActionResult> Alta([FromBody] AltaEstudioDto dto)
    {
        var res = await _estudioService.AltaEstudioAsync(dto);
        return CreatedAtAction(nameof(ObtenerPorId), new { id = res.Id }, res);
    }

    [HttpPut("{id}")]
    [Authorize(Roles = "SuperAdmin")]
    public async Task<IActionResult> Modificar(int id, [FromBody] ModificarEstudioDto dto)
    {
        if (id != dto.Id)
            return BadRequest("El ID de la URL no coincide con el cuerpo de la solicitud.");

        var res = await _estudioService.ModificarEstudioAsync(dto);
        return Ok(res);
    }

    [HttpDelete("{id}")]
    [Authorize(Roles = "SuperAdmin")]
    public async Task<IActionResult> Baja(int id)
    {
        await _estudioService.BajaEstudioAsync(id);
        return NoContent();
    }

    [HttpGet]
    [AllowAnonymous]
    public async Task<IActionResult> ObtenerTodos([FromQuery] int? especialidadId)
    {
        var res = await _estudioService.ObtenerTodosAsync(especialidadId);
        return Ok(res);
    }

    [HttpGet("{id}")]
    public async Task<IActionResult> ObtenerPorId(int id)
    {
        var res = await _estudioService.ObtenerPorIdAsync(id);
        return Ok(res);
    }
}
