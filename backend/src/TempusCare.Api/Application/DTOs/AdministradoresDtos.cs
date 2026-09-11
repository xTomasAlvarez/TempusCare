namespace TempusCare.Api.Application.DTOs;

public record AltaAdminInstitucionDto(
    string Cuil,
    string Nombre,
    string Apellido,
    string Telefono,
    DateTime FechaNacimiento,
    int InstitucionId,
    string NombreUsuario,
    string Contrasena,
    string Mail
);

public record AdminInstitucionResponseDto(
    string Cuil,
    string Nombre,
    string Apellido,
    string Telefono,
    DateTime FechaNacimiento,
    int InstitucionId,
    string InstitucionNombre,
    int UsuarioId,
    string NombreUsuario,
    string Mail
);

public record AltaAdminConsultorioDto(
    string Cuil,
    string Nombre,
    string Apellido,
    string Telefono,
    DateTime FechaNacimiento,
    string ConsultorioCuit,
    string NombreUsuario,
    string Contrasena,
    string Mail
);

public record AdminConsultorioResponseDto(
    string Cuil,
    string Nombre,
    string Apellido,
    string Telefono,
    DateTime FechaNacimiento,
    string ConsultorioCuit,
    string ConsultorioNombre,
    int UsuarioId,
    string NombreUsuario,
    string Mail
);
