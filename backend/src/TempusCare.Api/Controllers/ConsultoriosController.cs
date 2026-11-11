using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using TempusCare.Api.Application.DTOs;
using TempusCare.Api.Application.Services;

namespace TempusCare.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class ConsultoriosController : ControllerBase
{
    private readonly IConsultorioService _consultorioService;

    public ConsultoriosController(IConsultorioService consultorioService)
    {
        _consultorioService = consultorioService;
    }

    [HttpPost]
    [Authorize(Roles = "AdminInstitucion,Institucion,SuperAdmin")]
    public async Task<IActionResult> Alta([FromBody] AltaConsultorioDto dto)
    {
        var res = await _consultorioService.AltaConsultorioAsync(dto);
        return CreatedAtAction(nameof(ObtenerPorCuit), new { cuit = res.Cuit }, res);
    }

    [HttpPut("{cuit}")]
    [Authorize(Roles = "AdminInstitucion,Institucion,SuperAdmin")]
    public async Task<IActionResult> Modificar(string cuit, [FromBody] ModificarConsultorioDto dto)
    {
        if (cuit != dto.Cuit)
            return BadRequest("El CUIT de la URL no coincide con el cuerpo de la solicitud.");

        var res = await _consultorioService.ModificarConsultorioAsync(dto);
        return Ok(res);
    }

    [HttpDelete("{cuit}")]
    [Authorize(Roles = "AdminInstitucion,Institucion,SuperAdmin")]
    public async Task<IActionResult> Baja(string cuit)
    {
        await _consultorioService.BajaConsultorioAsync(cuit);
        return NoContent();
    }

    [HttpGet]
    [AllowAnonymous]
    public async Task<IActionResult> ObtenerTodos([FromQuery] string? profesionalCuil = null)
    {
        if (!string.IsNullOrWhiteSpace(profesionalCuil))
        {
            var porProf = await _consultorioService.ObtenerPorProfesionalAsync(profesionalCuil);
            return Ok(porProf);
        }

        var res = await _consultorioService.ObtenerTodosAsync();
        return Ok(res);
    }

    [HttpGet("profesional/{profesionalCuil}")]
    [AllowAnonymous]
    public async Task<IActionResult> ObtenerPorProfesional(string profesionalCuil)
    {
        var res = await _consultorioService.ObtenerPorProfesionalAsync(profesionalCuil);
        return Ok(res);
    }

    [HttpGet("{cuit}")]
    [AllowAnonymous]
    public async Task<IActionResult> ObtenerPorCuit(string cuit)
    {
        var res = await _consultorioService.ObtenerPorCuitAsync(cuit);
        return Ok(res);
    }

    [HttpGet("{cuit}/profesionales")]
    [AllowAnonymous]
    public async Task<IActionResult> ObtenerProfesionales(string cuit)
    {
        var res = await _consultorioService.ObtenerProfesionalesPorConsultorioAsync(cuit);
        return Ok(res);
    }

    [HttpPost("{cuit}/profesionales/{profesionalCuil}")]
    [Authorize(Roles = "AdminConsultorio,SuperAdmin")]
    public async Task<IActionResult> AsignarProfesional(string cuit, string profesionalCuil)
    {
        await _consultorioService.AsignarProfesionalAsync(cuit, profesionalCuil);
        return Ok(new { message = "Profesional vinculado correctamente al consultorio." });
    }

    [HttpPost("{cuit}/visita")]
    [AllowAnonymous]
    public async Task<IActionResult> RegistrarVisita(string cuit)
    {
        await _consultorioService.RegistrarVisitaAsync(cuit);
        return Ok(new { message = "Visita registrada correctamente al perfil del consultorio." });
    }

    [HttpGet("{cuit}/metricas")]
    [Authorize(Roles = "AdminConsultorio,AdminInstitucion,Institucion,SuperAdmin")]
    public async Task<IActionResult> ObtenerMetricas(string cuit)
    {
        var res = await _consultorioService.ObtenerMetricasAsync(cuit);
        return Ok(res);
    }

    [HttpDelete("{cuit}/profesionales/{profesionalCuil}")]
    [Authorize(Roles = "AdminConsultorio,SuperAdmin")]
    public async Task<IActionResult> DesasignarProfesional(string cuit, string profesionalCuil)
    {
        await _consultorioService.DesasignarProfesionalAsync(cuit, profesionalCuil);
        return NoContent();
    }
}
