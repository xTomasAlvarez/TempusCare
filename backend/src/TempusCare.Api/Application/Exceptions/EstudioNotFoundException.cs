namespace TempusCare.Api.Application.Exceptions;

public class EstudioNotFoundException : EntityNotFoundException
{
    public EstudioNotFoundException(int id) : base($"Estudio con ID '{id}' no encontrado.") { }
}
