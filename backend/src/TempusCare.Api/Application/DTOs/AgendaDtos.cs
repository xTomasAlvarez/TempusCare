namespace TempusCare.Api.Application.DTOs;

public record AltaAgendaDto(
    string ProfesionalCuil,
    string CuitConsultorio,
    int Dia,
    int Mes,
    int Anio,
    TimeSpan HoraEntrada,
    TimeSpan HoraSalida,
    int DuracionTurnoMinutos = 30
);

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
    string AsistenteCuil,
    int AgendaId
);
