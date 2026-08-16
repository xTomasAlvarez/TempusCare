namespace TempusCare.Api.Application.Exceptions;

public class NotFoundException : EntityNotFoundException
{
    public NotFoundException(string message) : base(message) { }
}
