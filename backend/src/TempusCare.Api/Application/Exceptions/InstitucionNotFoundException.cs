namespace TempusCare.Api.Application.Exceptions;

public class InstitucionNotFoundException : EntityNotFoundException
{
    public InstitucionNotFoundException(int id) : base($"Institución con ID '{id}' no encontrada.") { }
    public InstitucionNotFoundException(string cuit) : base($"Institución con CUIT '{cuit}' no encontrada.") { }
}
