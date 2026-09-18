using Microsoft.AspNetCore.Mvc;
using TempusCare.Api.Application.DTOs;
using TempusCare.Api.Application.Services;

namespace TempusCare.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class AgendasController : ControllerBase
{
    private readonly IAgendaService _agendaService;

    public AgendasController(IAgendaService agendaService)
    {
        _agendaService = agendaService;
    }

    [HttpPost]
    public async Task<IActionResult> Alta([FromBody] AltaAgendaDto dto)
    {
        var res = await _agendaService.AltaAgendaAsync(dto);
        return Ok(res);
    }

    [HttpPut("{id}")]
    public async Task<IActionResult> Modificar(int id, [FromBody] ModificarAgendaDto dto)
    {
        if (id != dto.IdAgenda)
            return BadRequest("El ID de la URL no coincide con el cuerpo.");

        var res = await _agendaService.ModificarAgendaAsync(dto);
        return Ok(res);
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> Eliminar(int id)
    {
        await _agendaService.EliminarAgendaAsync(id);
        return NoContent();
    }

    [HttpGet("profesional/{cuil}")]
    public async Task<IActionResult> ObtenerPorProfesional(string cuil)
    {
        var res = await _agendaService.ObtenerAgendasPorProfesionalAsync(cuil);
        return Ok(res);
    }
}
