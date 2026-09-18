namespace TempusCare.Api.Domain.Entities;

public class ProfesionalEspecialidad
{
    public string ProfesionalCuil { get; set; } = string.Empty;
    public Profesional? Profesional { get; set; }

    public int EspecialidadId { get; set; }
    public Especialidad? Especialidad { get; set; }
}
