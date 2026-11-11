namespace TempusCare.Api.Application.Exceptions;

public class ConsultorioNotFoundException : EntityNotFoundException
{
    public ConsultorioNotFoundException(string cuit) : base($"Consultorio con CUIT '{cuit}' no encontrado.") { }
}
