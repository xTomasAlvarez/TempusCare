namespace TempusCare.Api.Domain.Entities;

public class Estudio
{
    public int Id { get; set; }
    public string Nombre { get; set; } = string.Empty;
    public string Descripcion { get; set; } = string.Empty;
    public int Duracion { get; set; } = 30; // en minutos
    public string Preparacion { get; set; } = string.Empty;

    public ICollection<ProfesionalEstudio> ProfesionalEstudios { get; set; } = new List<ProfesionalEstudio>();
}
