using Microsoft.AspNetCore.Mvc;
using TempusCare.Api.Application.DTOs;
using TempusCare.Api.Application.Services;

namespace TempusCare.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class AdministradoresController : ControllerBase
{
    private readonly IAdministradorService _administradorService;

    public AdministradoresController(IAdministradorService administradorService)
    {
        _administradorService = administradorService;
    }

    [HttpPost("institucion")]
    public async Task<IActionResult> AltaAdminInstitucion([FromBody] AltaAdminInstitucionDto dto)
    {
        var res = await _administradorService.AltaAdminInstitucionAsync(dto);
        return CreatedAtAction(nameof(ObtenerAdminInstitucionPorCuil), new { cuil = res.Cuil }, res);
    }

    [HttpGet("institucion")]
    public async Task<IActionResult> ObtenerAdminsInstitucion([FromQuery] int? institucionId)
    {
        var res = await _administradorService.ObtenerAdminsInstitucionAsync(institucionId);
        return Ok(res);
    }

    [HttpGet("institucion/{cuil}")]
    public async Task<IActionResult> ObtenerAdminInstitucionPorCuil(string cuil)
    {
        var res = await _administradorService.ObtenerAdminInstitucionPorCuilAsync(cuil);
        return Ok(res);
    }

    [HttpPost("consultorio")]
    public async Task<IActionResult> AltaAdminConsultorio([FromBody] AltaAdminConsultorioDto dto)
    {
        var res = await _administradorService.AltaAdminConsultorioAsync(dto);
        return CreatedAtAction(nameof(ObtenerAdminConsultorioPorCuil), new { cuil = res.Cuil }, res);
    }

    [HttpGet("consultorio")]
    public async Task<IActionResult> ObtenerAdminsConsultorio([FromQuery] string? consultorioCuit)
    {
        var res = await _administradorService.ObtenerAdminsConsultorioAsync(consultorioCuit);
        return Ok(res);
    }

    [HttpGet("consultorio/{cuil}")]
    public async Task<IActionResult> ObtenerAdminConsultorioPorCuil(string cuil)
    {
        var res = await _administradorService.ObtenerAdminConsultorioPorCuilAsync(cuil);
        return Ok(res);
    }
}
