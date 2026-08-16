namespace TempusCare.Api.Domain.Entities;

public class ProfesionalConsultorio
{
    public string ProfesionalCuil { get; set; } = string.Empty;
    public Profesional? Profesional { get; set; }

    public string ConsultorioCuit { get; set; } = string.Empty;
    public Consultorio? Consultorio { get; set; }
}
