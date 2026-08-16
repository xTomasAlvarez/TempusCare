namespace TempusCare.Api.Application.Exceptions;

public class EspecialidadNotFoundException : EntityNotFoundException
{
    public EspecialidadNotFoundException(int id) : base($"Especialidad con ID '{id}' no encontrada.") { }
}
