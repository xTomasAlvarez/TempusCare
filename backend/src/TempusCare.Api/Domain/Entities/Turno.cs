using TempusCare.Api.Domain.Enums;

namespace TempusCare.Api.Domain.Entities;

public class Turno
{
    public int Id { get; set; }
    public int AgendaId { get; set; }
    public Agenda? Agenda { get; set; }

    public DateTime Fecha { get; set; }
    public TimeSpan HoraInicio { get; set; }
    public TimeSpan HoraFin { get; set; }
    public EstadoTurno Estado { get; set; } = EstadoTurno.Disponible;

    public Cita? Cita { get; set; }
}
