namespace TempusCare.Api.Application.Exceptions;

public class ObservacionNotFoundException : EntityNotFoundException
{
    public ObservacionNotFoundException(int id) : base($"Observación médica con ID '{id}' no encontrada.") { }
}
