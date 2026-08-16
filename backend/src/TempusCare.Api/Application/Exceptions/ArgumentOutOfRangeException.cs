namespace TempusCare.Api.Application.Exceptions;

public class ArgumentOutOfRangeException : BusinessException
{
    public ArgumentOutOfRangeException(string message) : base(message, 400) { }
}
