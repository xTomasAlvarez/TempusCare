using System.ComponentModel.DataAnnotations;

namespace TempusCare.Api.Application.DTOs;

public record AltaAgendaDto(
    [Required, RegularExpression(@"^\d{11}$", ErrorMessage = "El CUIL del profesional debe ser exactamente una cadena numérica de 11 dígitos.")]
    string ProfesionalCuil,
    [Required, RegularExpression(@"^\d{11}$", ErrorMessage = "El CUIT del consultorio debe ser exactamente una cadena numérica de 11 dígitos.")]
    string CuitConsultorio,
    int Dia,
    int Mes,
    int Anio,
    TimeSpan HoraEntrada,
    TimeSpan HoraSalida,
    int DuracionTurnoMinutos = 30
)
{
    public DateTime Fecha => new DateTime(Anio, Mes, Dia);
}

public record ModificarAgendaDto(
    int IdAgenda,
    TimeSpan NuevaHoraEntrada,
    TimeSpan NuevaHoraSalida
);

public record AgendaResponseDto(
    int Id,
    string ProfesionalCuil,
    string ProfesionalNombre,
    string ProfesionalMatricula,
    string ConsultorioCuit,
    string ConsultorioNombre,
    int Dia,
    int Mes,
    int Anio,
    TimeSpan HoraEntrada,
    TimeSpan HoraSalida,
    int CantidadTurnos,
    List<string>? AsistentesAutorizados = null
);

public record AsignarAsistenteAgendaDto(
    [Required, RegularExpression(@"^\d{11}$", ErrorMessage = "El CUIL del asistente debe ser exactamente una cadena numérica de 11 dígitos.")]
    string AsistenteCuil,
    int AgendaId
);
