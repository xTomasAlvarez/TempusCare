namespace TempusCare.Api.Application.Exceptions;

public class NotAuthenticatedException : BusinessException
{
    public NotAuthenticatedException(string message = "No autenticado o credenciales inválidas.") : base(message, 401) { }
}
