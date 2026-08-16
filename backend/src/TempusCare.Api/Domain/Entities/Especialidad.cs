namespace TempusCare.Api.Domain.Entities;

public class Especialidad
{
    public int Id { get; set; }
    public string Nombre { get; set; } = string.Empty;
    public string Descripcion { get; set; } = string.Empty;

    public ICollection<ProfesionalEspecialidad> Profesionales { get; set; } = new List<ProfesionalEspecialidad>();
}
