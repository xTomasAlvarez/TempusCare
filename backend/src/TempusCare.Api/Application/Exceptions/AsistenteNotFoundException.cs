namespace TempusCare.Api.Application.Exceptions;

public class AsistenteNotFoundException : EntityNotFoundException
{
    public AsistenteNotFoundException(string cuil) : base($"Asistente con CUIL '{cuil}' no encontrado.") { }
}
