using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using TempusCare.Api.Application.DTOs;
using TempusCare.Api.Application.Services;

namespace TempusCare.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class TurnosController : ControllerBase
{
    private readonly ITurnoService _turnoService;

    public TurnosController(ITurnoService turnoService)
    {
        _turnoService = turnoService;
    }

    [HttpGet("disponibles")]
    [AllowAnonymous]
    public async Task<IActionResult> ObtenerDisponibles([FromQuery] string profesionalCuil, [FromQuery] DateTime? fecha, [FromQuery] string? consultorioCuit)
    {
        var res = await _turnoService.ObtenerTurnosDisponiblesAsync(profesionalCuil, fecha, consultorioCuit);
        return Ok(res);
    }

    [HttpPut("{id}")]
    [Authorize(Roles = "Asistente,Profesional,AdminConsultorio,SuperAdmin")]
    public async Task<IActionResult> Modificar(int id, [FromBody] ModificarTurnoDto dto)
    {
        if (id != dto.IdTurno)
            return BadRequest("El ID del turno no coincide.");

        var res = await _turnoService.ModificarTurnoAsync(id, dto.Detalle, dto.Estado);
        return Ok(res);
    }

    [HttpGet("{id}")]
    [AllowAnonymous]
    public async Task<IActionResult> ObtenerPorId(int id)
    {
        var res = await _turnoService.ObtenerPorIdAsync(id);
        return Ok(res);
    }
}
