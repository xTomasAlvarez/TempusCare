namespace TempusCare.Api.Application.DTOs;

public record ProponerAdminDto
{
    public string Email { get; init; } = string.Empty;
    public string? Nombre { get; init; }
}

public record SolicitudAdminResponseDto(
    int Id,
    string EmailPropuesto,
    int ProponenteId,
    string ProponenteNombre,
    int? AprobadorId,
    string? AprobadorNombre,
    string Estado,
    DateTime FechaCreacion,
    DateTime? FechaResolucion
);

public record SuperAdminResponseDto(
    int Id,
    string NombreUsuario,
    string Mail,
    string Rol,
    string Estado
);

public record VitalityMetricsDto(
    int TotalInstituciones,
    int TotalSedes,
    int TotalProfesionales,
    int TotalTurnos,
    int TotalCitas,
    object InstitucionesPorPlan,
    object TurnosPorEstado,
    object ProfesionalesPorEspecialidad,
    object VolumenMensual
);

public record ConsultorioAccesibilidadAuditDto(
    string Cuit,
    string Nombre,
    string DireccionCompleta,
    string Telefono,
    string NivelAccesibilidad,
    int? InstitucionId,
    string InstitucionNombre,
    int PuntajeAccesibilidad
);

public record InstitucionAccesibilidadAuditDto(
    int InstitucionId,
    string Nombre,
    string Cuit,
    string Plan,
    int SedesTotal,
    int SedesAccesibles,
    int SedesTotalNivel,
    int SedesEspecializadaNivel,
    int SedesMediaNivel,
    int SedesBasicaNivel,
    string NivelPredominante,
    bool LectorPantalla,
    bool AltoContraste,
    bool NavegacionTeclado,
    int PorcentajeCumplimiento,
    string Estado,
    List<ConsultorioAccesibilidadAuditDto> Consultorios
);

public record SystemStatusDto(
    string Status,
    string Uptime,
    string DatabaseStatus,
    DateTime ServerTime,
    int LatenciaMs,
    string Version,
    int TotalInstitucionesAuditadas,
    List<InstitucionAccesibilidadAuditDto> InstitucionesAccesibilidad,
    List<ConsultorioAccesibilidadAuditDto>? ConsultoriosAccesibilidad = null
);
