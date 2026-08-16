namespace TempusCare.Api.Domain.Entities;

public class HistoriaClinica
{
    public int Id { get; set; }
    public string PacienteCuil { get; set; } = string.Empty;
    public Paciente? Paciente { get; set; }

    public string Discapacidad { get; set; } = string.Empty;
    public string GrupSang { get; set; } = string.Empty;
    public string Alergias { get; set; } = string.Empty;
    public string EnfermedadesCronicas { get; set; } = string.Empty;
    public string Medicamentos { get; set; } = string.Empty;
    public string NombreContacto { get; set; } = string.Empty;
    public string ApellidoContacto { get; set; } = string.Empty;
    public string TelefonoContacto { get; set; } = string.Empty;

    public ICollection<Observacion> Observaciones { get; set; } = new List<Observacion>();
}
