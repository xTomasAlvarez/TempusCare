namespace TempusCare.Api.Application.Exceptions;

public class AgendaNotFoundException : EntityNotFoundException
{
    public AgendaNotFoundException(int id) : base($"Agenda con ID '{id}' no encontrada.") { }
}
