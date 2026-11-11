namespace TempusCare.Api.Domain.Entities;

public class ProfesionalObraSocial
{
    public string ProfesionalCuil { get; set; } = string.Empty;
    public Profesional? Profesional { get; set; }

    public int ObraSocialId { get; set; }
    public ObraSocial? ObraSocial { get; set; }
}
