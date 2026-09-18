using TempusCare.Api.Application.DTOs;

namespace TempusCare.Api.Application.Services;

public interface IAuthService
{
    Task<UsuarioAutenticadoDto> RegistrarUsuarioAsync(RegistrarUsuarioDto dto);
    Task<UsuarioAutenticadoDto> IniciarSesionAsync(IniciarSesionDto dto);
}
