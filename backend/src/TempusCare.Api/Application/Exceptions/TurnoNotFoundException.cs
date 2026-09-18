namespace TempusCare.Api.Application.Exceptions;

public class TurnoNotFoundException : EntityNotFoundException
{
    public TurnoNotFoundException(int id) : base($"Turno con ID '{id}' no encontrado.") { }
}
