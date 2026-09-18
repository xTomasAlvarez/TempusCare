namespace TempusCare.Api.Domain.Entities;

public class ProfesionalEstudio
{
    public int Id { get; set; }

    public string ProfesionalCuil { get; set; } = string.Empty;
    public Profesional? Profesional { get; set; }

    public int EstudioId { get; set; }
    public Estudio? Estudio { get; set; }

    public int DuracionTurno { get; set; } = 30; // en minutos
    public decimal PrecioParticular { get; set; } = 0.0m;
    public bool Activo { get; set; } = true;

    public ICollection<Cobertura> Coberturas { get; set; } = new List<Cobertura>();
}
