namespace TempusCare.Api.Application.Exceptions;

public class ObraSocialNotFoundException : EntityNotFoundException
{
    public ObraSocialNotFoundException(int id) : base($"Obra Social con ID '{id}' no encontrada.") { }
}
