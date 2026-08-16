using TempusCare.Api.Domain.Enums;

namespace TempusCare.Api.Domain.Entities;

public class Receta
{
    public int Id { get; set; }
    public int CitaId { get; set; }
    public Cita? Cita { get; set; }

    public DateTime FechaEmision { get; set; } = DateTime.UtcNow;
    public string Medicamentos { get; set; } = string.Empty;
    public string Dosis { get; set; } = string.Empty;
    public string Indicaciones { get; set; } = string.Empty;
    public EstadoReceta Estado { get; set; } = EstadoReceta.Activa;
}
