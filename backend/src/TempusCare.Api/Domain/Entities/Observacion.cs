namespace TempusCare.Api.Domain.Entities;

public class Observacion
{
    public int Id { get; set; }
    public string Motivo { get; set; } = string.Empty;
    public string Detalle { get; set; } = string.Empty;

    public int? HistoriaClinicaId { get; set; }
    public HistoriaClinica? HistoriaClinica { get; set; }

    public string? ProfesionalCuil { get; set; }
    public Profesional? Profesional { get; set; }

    public int? CitaId { get; set; }
    public Cita? Cita { get; set; }
}
