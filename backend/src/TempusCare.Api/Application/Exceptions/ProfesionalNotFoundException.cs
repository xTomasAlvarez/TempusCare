namespace TempusCare.Api.Application.Exceptions;

public class ProfesionalNotFoundException : EntityNotFoundException
{
    public ProfesionalNotFoundException(string cuil) : base($"Profesional con CUIL '{cuil}' no encontrado.") { }
}
