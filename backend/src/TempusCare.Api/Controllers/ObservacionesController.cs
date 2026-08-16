using Microsoft.AspNetCore.Mvc;
using TempusCare.Api.Application.DTOs;
using TempusCare.Api.Application.Services;

namespace TempusCare.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class ObservacionesController : ControllerBase
{
    private readonly IObservacionService _observacionService;

    public ObservacionesController(IObservacionService observacionService)
    {
        _observacionService = observacionService;
    }

    [HttpPost]
    public async Task<IActionResult> Completar([FromBody] CompletarObservacionDto dto)
    {
        var res = await _observacionService.CompletarObservacionAsync(dto);
        return Ok(res);
    }

    [HttpGet("historia-clinica/{id}")]
    public async Task<IActionResult> ObtenerPorHistoriaClinica(int id)
    {
        var res = await _observacionService.ObtenerObservacionesPorHistoriaClinicaAsync(id);
        return Ok(res);
    }

    [HttpGet("profesional/{cuil}")]
    public async Task<IActionResult> ObtenerPorProfesional(string cuil)
    {
        var res = await _observacionService.ObtenerObservacionesPorProfesionalAsync(cuil);
        return Ok(res);
    }

    [HttpGet("{id}")]
    public async Task<IActionResult> ObtenerPorId(int id)
    {
        var res = await _observacionService.ObtenerPorIdAsync(id);
        return Ok(res);
    }
}
