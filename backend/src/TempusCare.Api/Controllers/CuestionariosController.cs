using Microsoft.AspNetCore.Mvc;
using TempusCare.Api.Application.DTOs;
using TempusCare.Api.Application.Services;

namespace TempusCare.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class CuestionariosController : ControllerBase
{
    private readonly ICuestionarioService _cuestionarioService;

    public CuestionariosController(ICuestionarioService cuestionarioService)
    {
        _cuestionarioService = cuestionarioService;
    }

    [HttpPost]
    public async Task<IActionResult> Completar([FromBody] CompletarCuestionarioDto dto)
    {
        var res = await _cuestionarioService.CompletarCuestionarioAsync(dto);
        return Ok(res);
    }

    [HttpGet("cita/{citaId}")]
    public async Task<IActionResult> ObtenerPorCita(int citaId)
    {
        var res = await _cuestionarioService.ObtenerPorCitaIdAsync(citaId);
        return Ok(res);
    }
}
