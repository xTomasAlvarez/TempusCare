namespace TempusCare.Api.Application.Exceptions;

public class HistoriaClinicaNotFoundException : EntityNotFoundException
{
    public HistoriaClinicaNotFoundException(string pacienteCuil) : base($"Historia Clínica para el paciente con CUIL '{pacienteCuil}' no encontrada.") { }
    public HistoriaClinicaNotFoundException(int id) : base($"Historia Clínica con ID '{id}' no encontrada.") { }
}
