namespace TempusCare.Api.Application.Exceptions;

public class CuestionarioNotFoundException : EntityNotFoundException
{
    public CuestionarioNotFoundException(int id) : base($"Cuestionario con ID '{id}' no encontrado.") { }
}
