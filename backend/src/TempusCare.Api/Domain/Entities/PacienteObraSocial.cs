namespace TempusCare.Api.Domain.Entities;

public class PacienteObraSocial
{
    public string PacienteCuil { get; set; } = string.Empty;
    public Paciente? Paciente { get; set; }

    public int ObraSocialId { get; set; }
    public ObraSocial? ObraSocial { get; set; }
}
