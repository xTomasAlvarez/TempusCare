namespace TempusCare.Api.Domain.Entities;

public class Asistente
{
    public string Cuil { get; set; } = string.Empty; // Primary Key
    public int UsuarioId { get; set; }
    public Usuario? Usuario { get; set; }

    public string Nombre { get; set; } = string.Empty;
    public string Apellido { get; set; } = string.Empty;
    public DateTime FechaNacimiento { get; set; }
    public string Telefono { get; set; } = string.Empty;
    public string Genero { get; set; } = string.Empty;

    public int? DireccionId { get; set; }
    public Direccion? Direccion { get; set; }

    public int? InstitucionId { get; set; }
    public Institucion? Institucion { get; set; }

    public ICollection<AsistenteAgenda> AgendasAsignadas { get; set; } = new List<AsistenteAgenda>();
}
