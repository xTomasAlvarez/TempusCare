using Microsoft.AspNetCore.Mvc;
using TempusCare.Api.Application.DTOs;
using TempusCare.Api.Application.Services;
using TempusCare.Api.Domain.Enums;

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

[ApiController]
[Route("api/[controller]")]
public class ProfesionalesController : ControllerBase
{
    private readonly IProfesionalService _profesionalService;

    public ProfesionalesController(IProfesionalService profesionalService)
    {
        _profesionalService = profesionalService;
    }

    [HttpPost]
    public async Task<IActionResult> Alta([FromBody] AltaProfesionalDto dto)
    {
        var res = await _profesionalService.AltaProfesionalAsync(dto);
        return CreatedAtAction(nameof(ObtenerPorCuil), new { cuil = res.Cuil }, res);
    }

    [HttpPut("{cuil}")]
    public async Task<IActionResult> Modificar(string cuil, [FromBody] ModificarProfesionalDto dto)
    {
        if (cuil != dto.Cuil)
            return BadRequest("El CUIL de la URL no coincide con el cuerpo de la solicitud.");

        var res = await _profesionalService.ModificarProfesionalAsync(dto);
        return Ok(res);
    }

    [HttpDelete("{cuil}")]
    public async Task<IActionResult> Baja(string cuil)
    {
        await _profesionalService.BajaProfesionalAsync(cuil);
        return NoContent();
    }

    [HttpGet]
    public async Task<IActionResult> Consultar([FromQuery] int? especialidadId, [FromQuery] int? obraSocialId, [FromQuery] string? consultorioCuit)
    {
        var res = await _profesionalService.ConsultarProfesionalesAsync(especialidadId, obraSocialId, consultorioCuit);
        return Ok(res);
    }

    [HttpGet("{cuil}")]
    public async Task<IActionResult> ObtenerPorCuil(string cuil)
    {
        var res = await _profesionalService.ObtenerPorCuilAsync(cuil);
        return Ok(res);
    }
}

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
    public async Task<IActionResult> Alta([FromBody] AltaConsultorioDto dto)
    {
        var res = await _consultorioService.AltaConsultorioAsync(dto);
        return CreatedAtAction(nameof(ObtenerPorCuit), new { cuit = res.Cuit }, res);
    }

    [HttpPut("{cuit}")]
    public async Task<IActionResult> Modificar(string cuit, [FromBody] ModificarConsultorioDto dto)
    {
        if (cuit != dto.Cuit)
            return BadRequest("El CUIT de la URL no coincide con el cuerpo de la solicitud.");

        var res = await _consultorioService.ModificarConsultorioAsync(dto);
        return Ok(res);
    }

    [HttpDelete("{cuit}")]
    public async Task<IActionResult> Baja(string cuit)
    {
        await _consultorioService.BajaConsultorioAsync(cuit);
        return NoContent();
    }

    [HttpGet]
    public async Task<IActionResult> ObtenerTodos()
    {
        var res = await _consultorioService.ObtenerTodosAsync();
        return Ok(res);
    }

    [HttpGet("{cuit}")]
    public async Task<IActionResult> ObtenerPorCuit(string cuit)
    {
        var res = await _consultorioService.ObtenerPorCuitAsync(cuit);
        return Ok(res);
    }
}

[ApiController]
[Route("api/[controller]")]
public class EspecialidadesController : ControllerBase
{
    private readonly IEspecialidadService _especialidadService;

    public EspecialidadesController(IEspecialidadService especialidadService)
    {
        _especialidadService = especialidadService;
    }

    [HttpPost]
    public async Task<IActionResult> Alta([FromBody] AltaEspecialidadDto dto)
    {
        var res = await _especialidadService.AltaEspecialidadAsync(dto);
        return CreatedAtAction(nameof(ObtenerTodas), new { id = res.Id }, res);
    }

    [HttpPut("{id}")]
    public async Task<IActionResult> Modificar(int id, [FromBody] ModificarEspecialidadDto dto)
    {
        if (id != dto.Id)
            return BadRequest("El ID de la URL no coincide.");

        var res = await _especialidadService.ModificarEspecialidadAsync(dto);
        return Ok(res);
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> Eliminar(int id)
    {
        await _especialidadService.EliminarEspecialidadAsync(id);
        return NoContent();
    }

    [HttpGet]
    public async Task<IActionResult> ObtenerTodas()
    {
        var res = await _especialidadService.ObtenerTodasAsync();
        return Ok(res);
    }
}

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

[ApiController]
[Route("api/[controller]")]
public class TurnosController : ControllerBase
{
    private readonly ITurnoCitaService _turnoCitaService;

    public TurnosController(ITurnoCitaService turnoCitaService)
    {
        _turnoCitaService = turnoCitaService;
    }

    [HttpGet("disponibles")]
    public async Task<IActionResult> ObtenerDisponibles([FromQuery] string profesionalCuil, [FromQuery] DateTime? fecha)
    {
        var res = await _turnoCitaService.ObtenerTurnosDisponiblesAsync(profesionalCuil, fecha);
        return Ok(res);
    }

    [HttpPut("{id}")]
    public async Task<IActionResult> Modificar(int id, [FromBody] ModificarTurnoDto dto)
    {
        if (id != dto.IdTurno)
            return BadRequest("El ID del turno no coincide.");

        var res = await _turnoCitaService.ModificarTurnoAsync(id, dto.Detalle, dto.Estado);
        return Ok(res);
    }
}

[ApiController]
[Route("api/[controller]")]
public class CitasController : ControllerBase
{
    private readonly ITurnoCitaService _turnoCitaService;

    public CitasController(ITurnoCitaService turnoCitaService)
    {
        _turnoCitaService = turnoCitaService;
    }

    [HttpPost]
    public async Task<IActionResult> Alta([FromBody] AltaCitaDto dto)
    {
        var res = await _turnoCitaService.AltaCitaAsync(dto);
        return Ok(res);
    }

    [HttpPut("{id}/estado")]
    public async Task<IActionResult> ModificarEstado(int id, [FromBody] ModificarCitaEstadoDto dto)
    {
        if (id != dto.CitaId)
            return BadRequest("El ID de la cita no coincide.");

        var res = await _turnoCitaService.ModificarCitaEstadoAsync(id, dto.Estado);
        return Ok(res);
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> Baja(int id)
    {
        await _turnoCitaService.BajaCitaAsync(id);
        return NoContent();
    }

    [HttpPost("{id}/cuestionario")]
    public async Task<IActionResult> CompletarCuestionario(int id, [FromBody] CompletarCuestionarioDto dto)
    {
        if (id != dto.CitaId)
            return BadRequest("El ID de la cita no coincide.");

        await _turnoCitaService.CompletarCuestionarioAsync(dto);
        return NoContent();
    }

    [HttpPost("{id}/observacion")]
    public async Task<IActionResult> CompletarObservacion(int id, [FromBody] CompletarObservacionDto dto)
    {
        if (id != dto.CitaId)
            return BadRequest("El ID de la cita no coincide.");

        await _turnoCitaService.CompletarObservacionAsync(dto);
        return NoContent();
    }

    [HttpGet("paciente/{cuil}")]
    public async Task<IActionResult> ObtenerCitasPaciente(string cuil)
    {
        var res = await _turnoCitaService.ObtenerCitasPacienteAsync(cuil);
        return Ok(res);
    }

    [HttpGet("profesional/{cuil}")]
    public async Task<IActionResult> ObtenerCitasProfesional(string cuil, [FromQuery] DateTime? fecha)
    {
        var res = await _turnoCitaService.ObtenerCitasProfesionalAsync(cuil, fecha);
        return Ok(res);
    }
}

[ApiController]
[Route("api/[controller]")]
public class PerfilesController : ControllerBase
{
    private readonly IPerfilPacienteService _perfilPacienteService;

    public PerfilesController(IPerfilPacienteService perfilPacienteService)
    {
        _perfilPacienteService = perfilPacienteService;
    }

    [HttpPost]
    public async Task<IActionResult> Alta([FromBody] AltaPerfilPacienteDto dto)
    {
        var res = await _perfilPacienteService.AltaPerfilAsync(dto);
        return CreatedAtAction(nameof(ObtenerPerfil), new { cuil = res.Cuil }, res);
    }

    [HttpPut("{cuil}")]
    public async Task<IActionResult> Modificar(string cuil, [FromBody] ModificacionPerfilPacienteDto dto)
    {
        if (cuil != dto.Cuil)
            return BadRequest("El CUIL de la URL no coincide.");

        var res = await _perfilPacienteService.ModificarPerfilAsync(dto);
        return Ok(res);
    }

    [HttpDelete("{cuil}")]
    public async Task<IActionResult> Baja(string cuil)
    {
        await _perfilPacienteService.BajaPerfilAsync(cuil);
        return NoContent();
    }

    [HttpGet("{cuil}")]
    public async Task<IActionResult> ObtenerPerfil(string cuil)
    {
        var res = await _perfilPacienteService.ObtenerPerfilAsync(cuil);
        return Ok(res);
    }
}
