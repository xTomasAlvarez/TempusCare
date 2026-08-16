namespace TempusCare.Api.Application.Exceptions;

public class RecetaNotFoundException : EntityNotFoundException
{
    public RecetaNotFoundException(int id) : base($"Receta con ID '{id}' no encontrada.") { }
}
