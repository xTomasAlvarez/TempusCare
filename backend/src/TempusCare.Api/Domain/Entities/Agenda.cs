namespace TempusCare.Api.Domain.Entities;

public class Agenda
{
    public int Id { get; set; }
    public string ProfesionalCuil { get; set; } = string.Empty;
    public Profesional? Profesional { get; set; }

    public string ConsultorioCuit { get; set; } = string.Empty;
    public Consultorio? Consultorio { get; set; }

    public int Dia { get; set; }
    public int Mes { get; set; }
    public int Anio { get; set; }

    public TimeSpan HoraEntrada { get; set; }
    public TimeSpan HoraSalida { get; set; }

    public ICollection<Turno> Turnos { get; set; } = new List<Turno>();
}
