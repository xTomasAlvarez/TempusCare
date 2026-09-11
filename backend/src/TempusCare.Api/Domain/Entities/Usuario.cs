using TempusCare.Api.Domain.Enums;

namespace TempusCare.Api.Domain.Entities;

public class Usuario
{
    public int Id { get; set; }
    public string NombreUsuario { get; set; } = string.Empty;
    public string Contrasena { get; set; } = string.Empty;
    public string Mail { get; set; } = string.Empty;
    public RolUsuario Rol { get; set; }

    // Navigation properties
    public Paciente? Paciente { get; set; }
    public Profesional? Profesional { get; set; }
    public Asistente? Asistente { get; set; }
    public AdministradorInstitucion? AdministradorInstitucion { get; set; }
    public AdministradorConsultorio? AdministradorConsultorio { get; set; }
}
