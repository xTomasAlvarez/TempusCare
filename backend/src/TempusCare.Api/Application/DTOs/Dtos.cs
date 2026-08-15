using TempusCare.Api.Domain.Enums;

namespace TempusCare.Api.Application.DTOs;

public record RegistrarUsuarioDto(string Usuario, string Contra, string Mail, RolUsuario Rol);

public record IniciarSesionDto(string Usuario, string Contra);

public record UsuarioAutenticadoDto(int Id, string Usuario, string Mail, RolUsuario Rol, string? Cuil, string Token);

public record AltaProfesionalDto(
    string Cuil,
    string Nombre,
    string Apellido,
    DateTime FecNac,
    string Domicilio,
    string Telefono,
    string Matricula,
    string Genero,
    List<int> EspecialidadesIds,
    List<string> ConsultoriosCuits,
    List<int> ObrasSocialesIds
);

public record ModificarProfesionalDto(
    string Cuil,
    string Nombre,
    string Apellido,
    DateTime FecNac,
    string Domicilio,
    string Telefono,
    string Matricula,
    string Genero,
    List<int> EspecialidadesIds,
    List<string> ConsultoriosCuits,
    List<int> ObrasSocialesIds
);

public record ProfesionalResponseDto(
    string Cuil,
    string Nombre,
    string Apellido,
    DateTime FechaNacimiento,
    string Telefono,
    string Domicilio,
    string Matricula,
    string Genero,
    EstadoProfesional Estado,
    double Puntuacion,
    List<string> Especialidades,
    List<string> Consultorios,
    List<string> ObrasSociales
);

public record AltaConsultorioDto(
    string Cuit,
    string Nombre,
    string Email,
    string Telefono,
    string NivelAccesibilidad,
    string Calle,
    string Nro,
    string? Depto,
    string Localidad,
    string Provincia,
    string CodPostal,
    List<string>? ProfesionalesCuils
);

public record ModificarConsultorioDto(
    string Cuit,
    string Nombre,
    string Email,
    string Telefono,
    string NivelAccesibilidad,
    string Calle,
    string Nro,
    string? Depto,
    string Localidad,
    string Provincia,
    string CodPostal,
    List<string>? ProfesionalesCuils
);

public record ConsultorioResponseDto(
    string Cuit,
    string Nombre,
    string Email,
    string Telefono,
    string NivelAccesibilidad,
    string DireccionCompleta,
    List<string> ProfesionalesNombres
);

public record AltaEspecialidadDto(string Nombre, string Descripcion);
public record ModificarEspecialidadDto(int Id, string Nombre, string Descripcion);
public record EspecialidadDto(int Id, string Nombre, string Descripcion);

public record ObraSocialDto(int Id, string Nombre, string Catalogo);

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

public record ModificarAgendaDto(int IdAgenda, TimeSpan NuevaHoraEntrada, TimeSpan NuevaHoraSalida);

public record AgendaResponseDto(
    int Id,
    string ProfesionalCuil,
    string ProfesionalNombre,
    string ConsultorioCuit,
    string ConsultorioNombre,
    int Dia,
    int Mes,
    int Anio,
    TimeSpan HoraEntrada,
    TimeSpan HoraSalida,
    int CantidadTurnos
);

public record AltaTurnoDto(int AgendaId, DateTime Fecha, TimeSpan HoraInicio, TimeSpan HoraFin);
public record ModificarTurnoDto(int IdTurno, string? Detalle, EstadoTurno? Estado);
public record TurnoResponseDto(
    int Id,
    int AgendaId,
    DateTime Fecha,
    TimeSpan HoraInicio,
    TimeSpan HoraFin,
    EstadoTurno Estado,
    string ProfesionalNombre,
    string ConsultorioNombre
);

public record AltaCitaDto(
    string PacienteCuil,
    string ProfesionalCuil,
    int TurnoId,
    TipoCita Tipo,
    int? ObraSocialId
);

public record ModificarCitaEstadoDto(int CitaId, EstadoCita Estado);

public record CompletarCuestionarioDto(
    int CitaId,
    int Puntualidad,
    int Atencion,
    int Profesionalismo,
    string? Comentario
);

public record CompletarObservacionDto(
    int CitaId,
    string Motivo,
    string Detalle
);

public record CitaResponseDto(
    int Id,
    int TurnoId,
    string PacienteCuil,
    string PacienteNombre,
    string ProfesionalNombre,
    DateTime Fecha,
    TimeSpan HoraInicio,
    TimeSpan HoraFin,
    EstadoCita Estado,
    TipoCita Tipo,
    CoberturaCita Cobertura,
    string? MotivoObservacion,
    string? DetalleObservacion,
    double? PuntualidadEncuesta
);

public record AltaPerfilPacienteDto(
    string Cuil,
    string Nombre,
    string Apellido,
    DateTime FecNac,
    string Genero,
    string Telefono,
    string Domicilio,
    List<int>? ObrasSocialesIds
);

public record ModificacionPerfilPacienteDto(
    string Cuil,
    string Nombre,
    string Apellido,
    DateTime FecNac,
    string Genero,
    string Telefono,
    string Domicilio,
    List<int>? ObrasSocialesIds
);

public record PacientePerfilResponseDto(
    string Cuil,
    string Nombre,
    string Apellido,
    DateTime FechaNacimiento,
    string Genero,
    string Telefono,
    string Domicilio,
    List<string> ObrasSociales
);
