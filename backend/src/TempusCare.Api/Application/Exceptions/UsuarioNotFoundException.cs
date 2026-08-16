namespace TempusCare.Api.Application.Exceptions;

public class UsuarioNotFoundException : EntityNotFoundException
{
    public UsuarioNotFoundException(int id) : base($"Usuario con ID '{id}' no encontrado.") { }
    public UsuarioNotFoundException(string nombreUsuario) : base($"Usuario '{nombreUsuario}' no encontrado.") { }
}
