namespace TempusCare.Api.Application.Exceptions;

public class PacienteNotFoundException : EntityNotFoundException
{
    public PacienteNotFoundException(string cuil) : base($"Paciente con CUIL '{cuil}' no encontrado.") { }
}
