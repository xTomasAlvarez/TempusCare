using System.ComponentModel.DataAnnotations.Schema;
using TempusCare.Api.Domain.Enums;

namespace TempusCare.Api.Domain.Entities;

public class Profesional
{
    public string Cuil { get; set; } = string.Empty; // Primary Key
    public int UsuarioId { get; set; }
    public Usuario? Usuario { get; set; }

    public string Nombre { get; set; } = string.Empty;
    public string Apellido { get; set; } = string.Empty;
    public DateTime FechaNacimiento { get; set; }
    public string Telefono { get; set; } = string.Empty;
    public string Matricula { get; set; } = string.Empty;
    public string Genero { get; set; } = string.Empty;
    public EstadoProfesional Estado { get; set; } = EstadoProfesional.Activo;

    public int? DireccionId { get; set; }
    public Direccion? Direccion { get; set; }

    // Puntuación eliminada de BD: calculada dinámicamente según requerimiento
    [NotMapped]
    public double Puntuacion { get; set; } = 0.0;

    public ICollection<ProfesionalConsultorio> Consultorios { get; set; } = new List<ProfesionalConsultorio>();
    public ICollection<ProfesionalEspecialidad> Especialidades { get; set; } = new List<ProfesionalEspecialidad>();
    public ICollection<ProfesionalObraSocial> ObrasSociales { get; set; } = new List<ProfesionalObraSocial>();
    public ICollection<ProfesionalEstudio> Estudios { get; set; } = new List<ProfesionalEstudio>();
    public ICollection<Agenda> Agendas { get; set; } = new List<Agenda>();
    public ICollection<Observacion> Observaciones { get; set; } = new List<Observacion>();
}
