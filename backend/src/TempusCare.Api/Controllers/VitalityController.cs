using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using TempusCare.Api.Application.DTOs;
using TempusCare.Api.Application.Services;

namespace TempusCare.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize(Roles = "SuperAdmin")]
public class VitalityController : ControllerBase
{
    private readonly IVitalityService _vitalityService;
    private readonly ILogger<VitalityController> _logger;

    public VitalityController(IVitalityService vitalityService, ILogger<VitalityController> logger)
    {
        _vitalityService = vitalityService;
        _logger = logger;
    }

    private int? GetCurrentUserId()
    {
        var userIdClaim = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;
        if (int.TryParse(userIdClaim, out var userId) && userId > 0)
        {
            return userId;
        }

        if (Request.Headers.TryGetValue("X-SuperAdmin-Id", out var hVal) && int.TryParse(hVal, out var hId))
        {
            return hId;
        }

        return null;
    }

    [HttpGet("metrics")]
    public async Task<IActionResult> GetMetrics()
    {
        var res = await _vitalityService.GetMetricsAsync();
        return Ok(res);
    }

    [HttpGet("system")]
    public async Task<IActionResult> GetSystemStatus()
    {
        var res = await _vitalityService.GetSystemStatusAsync();
        return Ok(res);
    }

    [HttpGet("admins/solicitudes")]
    public async Task<IActionResult> GetSolicitudesAdmins()
    {
        var res = await _vitalityService.GetSolicitudesAdminsAsync();
        return Ok(res);
    }

    [HttpGet("admins")]
    public async Task<IActionResult> GetSuperAdmins()
    {
        var res = await _vitalityService.GetSuperAdminsAsync();
        return Ok(res);
    }

    [HttpPost("admins/proponer")]
    public async Task<IActionResult> ProponerSuperAdmin([FromBody] ProponerAdminDto dto)
    {
        var res = await _vitalityService.ProponerSuperAdminAsync(dto, GetCurrentUserId());
        return StatusCode(201, res);
    }

    [HttpPost("admins/aprobar/{id}")]
    public async Task<IActionResult> AprobarSuperAdmin(int id)
    {
        var res = await _vitalityService.AprobarSuperAdminAsync(id, GetCurrentUserId());
        return Ok(res);
    }

    [HttpPost("admins/rechazar/{id}")]
    public async Task<IActionResult> RechazarSuperAdmin(int id)
    {
        var res = await _vitalityService.RechazarSuperAdminAsync(id, GetCurrentUserId());
        return Ok(res);
    }
}
