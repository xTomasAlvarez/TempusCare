namespace TempusCare.Api.Domain.Entities;

public class ObraSocial
{
    public int Id { get; set; }
    public string Nombre { get; set; } = string.Empty;
    public string Catalogo { get; set; } = string.Empty; // Catálogo / Servicios cubiertos

    public ICollection<PacienteObraSocial> Pacientes { get; set; } = new List<PacienteObraSocial>();
    public ICollection<ProfesionalObraSocial> Profesionales { get; set; } = new List<ProfesionalObraSocial>();
    public ICollection<Cobertura> Coberturas { get; set; } = new List<Cobertura>();
}
