 namespace TempusCare.Api.Domain.Entities;

public class Cobertura
{
    public int Id { get; set; }

    public int ProfesionalEstudioId { get; set; }
    public ProfesionalEstudio? ProfesionalEstudio { get; set; }

    public int ObraSocialId { get; set; }
    public ObraSocial? ObraSocial { get; set; }
}
