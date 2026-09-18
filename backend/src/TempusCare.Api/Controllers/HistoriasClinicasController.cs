using Microsoft.AspNetCore.Mvc;
using TempusCare.Api.Application.DTOs;
using TempusCare.Api.Application.Services;

namespace TempusCare.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class HistoriasClinicasController : ControllerBase
{
    private readonly IHistoriaClinicaService _historiaClinicaService;

    public HistoriasClinicasController(IHistoriaClinicaService historiaClinicaService)
    {
        _historiaClinicaService = historiaClinicaService;
    }

    [HttpPost]
    public async Task<IActionResult> Alta([FromBody] AltaHistoriaClinicaDto dto)
    {
        var res = await _historiaClinicaService.AltaHistoriaClinicaAsync(dto);
        return CreatedAtAction(nameof(ObtenerPorId), new { id = res.Id }, res);
    }

    [HttpPut("{id}")]
    public async Task<IActionResult> Modificar(int id, [FromBody] ModificarHistoriaClinicaDto dto)
    {
        if (id != dto.Id)
            return BadRequest("El ID de la URL no coincide con el cuerpo.");

        var res = await _historiaClinicaService.ModificarHistoriaClinicaAsync(dto);
        return Ok(res);
    }

    [HttpGet("paciente/{cuil}")]
    public async Task<IActionResult> ObtenerPorPaciente(string cuil)
    {
        var res = await _historiaClinicaService.ObtenerPorPacienteCuilAsync(cuil);
        return Ok(res);
    }

    [HttpGet("{id}")]
    public async Task<IActionResult> ObtenerPorId(int id)
    {
        var res = await _historiaClinicaService.ObtenerPorIdAsync(id);
        return Ok(res);
    }
}
