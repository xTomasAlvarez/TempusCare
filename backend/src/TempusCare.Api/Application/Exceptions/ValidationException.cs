namespace TempusCare.Api.Application.Exceptions;

public class ValidationException : BusinessException
{
    public ValidationException(string message) : base(message, 400) { }
}
