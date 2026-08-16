namespace TempusCare.Api.Application.Exceptions;

public class EntityNotFoundException : BusinessException
{
    public EntityNotFoundException(string message) : base(message, 404) { }
}
