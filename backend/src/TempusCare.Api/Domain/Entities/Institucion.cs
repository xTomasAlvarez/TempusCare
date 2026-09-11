namespace TempusCare.Api.Domain.Entities;

public class Institucion
{
    public int Id { get; set; }
    public string Nombre { get; set; } = string.Empty;
    public string Cuit { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;

    public ICollection<Consultorio> Consultorios { get; set; } = new List<Consultorio>();
    public ICollection<AdministradorInstitucion> Administradores { get; set; } = new List<AdministradorInstitucion>();
}
