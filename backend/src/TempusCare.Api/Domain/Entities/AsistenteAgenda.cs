namespace TempusCare.Api.Domain.Entities;

public class AsistenteAgenda
{
    public string AsistenteCuil { get; set; } = string.Empty;
    public Asistente? Asistente { get; set; }

    public int AgendaId { get; set; }
    public Agenda? Agenda { get; set; }
}
