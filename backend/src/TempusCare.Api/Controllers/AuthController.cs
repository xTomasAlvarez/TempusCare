using Microsoft.AspNetCore.Mvc;
using TempusCare.Api.Application.DTOs;
using TempusCare.Api.Application.Services;

namespace TempusCare.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class AuthController : ControllerBase
{
    private readonly IAuthService _authService;

    public AuthController(IAuthService authService)
    {
        _authService = authService;
    }

    [HttpPost("registrar")]
    public async Task<IActionResult> Registrar([FromBody] RegistrarUsuarioDto dto)
    {
        var res = await _authService.RegistrarUsuarioAsync(dto);
        return Ok(res);
    }

    [HttpPost("iniciar-sesion")]
    public async Task<IActionResult> IniciarSesion([FromBody] IniciarSesionDto dto)
    {
        var res = await _authService.IniciarSesionAsync(dto);
        return Ok(res);
    }
}
