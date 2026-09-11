using TempusCare.Api.Domain.Enums;

namespace TempusCare.Api.Domain.Entities;

public class Cita
{
    public int Id { get; set; }
    public int TurnoId { get; set; }
    public Turno? Turno { get; set; }

    public string PacienteCuil { get; set; } = string.Empty;
    public Paciente? Paciente { get; set; }

    public DateTime Fecha { get; set; }
    public EstadoCita Estado { get; set; } = EstadoCita.Solicitada;
    public TipoCita Tipo { get; set; }
    public CoberturaCita Cobertura { get; set; }

    public Observacion? Observacion { get; set; }
    public Cuestionario? Cuestionario { get; set; }
}
