namespace TempusCare.Api.Application.Exceptions;

public class NoContentException : BusinessException
{
    public NoContentException(string message = "Contenido no disponible.") : base(message, 204) { }
}
