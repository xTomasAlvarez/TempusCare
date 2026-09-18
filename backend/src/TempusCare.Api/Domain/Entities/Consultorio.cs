namespace TempusCare.Api.Domain.Entities;

public class Consultorio
{
    public string Cuit { get; set; } = string.Empty; // Primary Key
    public string Nombre { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string Telefono { get; set; } = string.Empty;
    public string NivelAccesibilidad { get; set; } = string.Empty;

    public int? InstitucionId { get; set; }
    public Institucion? Institucion { get; set; }

    public int? DireccionId { get; set; }
    public Direccion? Direccion { get; set; }

    public ICollection<ProfesionalConsultorio> Profesionales { get; set; } = new List<ProfesionalConsultorio>();
    public ICollection<Agenda> Agendas { get; set; } = new List<Agenda>();
    public ICollection<AdministradorConsultorio> Administradores { get; set; } = new List<AdministradorConsultorio>();
    public ICollection<Asistente> Asistentes { get; set; } = new List<Asistente>();
}
