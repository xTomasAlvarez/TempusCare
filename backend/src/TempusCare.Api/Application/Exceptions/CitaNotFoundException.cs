namespace TempusCare.Api.Application.Exceptions;

public class CitaNotFoundException : EntityNotFoundException
{
    public CitaNotFoundException(int id) : base($"Cita con ID '{id}' no encontrada.") { }
}
