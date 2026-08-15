using TempusCare.Api.Domain.Enums;

namespace TempusCare.Api.Domain.Entities;

public class Usuario
{
    public int Id { get; set; }
    public string NombreUsuario { get; set; } = string.Empty;
    public string Contrasena { get; set; } = string.Empty;
    public string Mail { get; set; } = string.Empty;
    public RolUsuario Rol { get; set; }

    // Relationships
    public Paciente? Paciente { get; set; }
    public Profesional? Profesional { get; set; }
}

public class Direccion
{
    public int Id { get; set; }
    public string Pais { get; set; } = "Argentina";
    public string Provincia { get; set; } = "Tucumán";
    public string Localidad { get; set; } = "San Miguel de Tucumán";
    public string Calle { get; set; } = string.Empty;
    public string Nro { get; set; } = string.Empty;
    public string? Depto { get; set; }
    public string CodPostal { get; set; } = "4000";
}

public class Paciente
{
    public string Cuil { get; set; } = string.Empty; // Primary Key
    public int UsuarioId { get; set; }
    public Usuario? Usuario { get; set; }

    public string Nombre { get; set; } = string.Empty;
    public string Apellido { get; set; } = string.Empty;
    public DateTime FechaNacimiento { get; set; }
    public string Genero { get; set; } = string.Empty;
    public string Telefono { get; set; } = string.Empty;
    public string Domicilio { get; set; } = string.Empty;

    public HistoriaClinica? HistoriaClinica { get; set; }
    public ICollection<PacienteObraSocial> ObrasSociales { get; set; } = new List<PacienteObraSocial>();
    public ICollection<Cita> Citas { get; set; } = new List<Cita>();
}

public class HistoriaClinica
{
    public int Id { get; set; }
    public string PacienteCuil { get; set; } = string.Empty;
    public Paciente? Paciente { get; set; }

    public string Nombre { get; set; } = string.Empty;
    public string Discapacidad { get; set; } = string.Empty;
    public string GrupSang { get; set; } = string.Empty;
    public string Alergias { get; set; } = string.Empty;
    public string EnfermedadesCronicas { get; set; } = string.Empty;
    public string Medicamentos { get; set; } = string.Empty;
    public string NombreContacto { get; set; } = string.Empty;
    public string ApellidoContacto { get; set; } = string.Empty;
    public string TelefonoContacto { get; set; } = string.Empty;
}

public class Consultorio
{
    public string Cuit { get; set; } = string.Empty; // Primary Key
    public string Nombre { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string Telefono { get; set; } = string.Empty;
    public string NivelAccesibilidad { get; set; } = string.Empty;

    public int? DireccionId { get; set; }
    public Direccion? Direccion { get; set; }

    public ICollection<ProfesionalConsultorio> Profesionales { get; set; } = new List<ProfesionalConsultorio>();
    public ICollection<Agenda> Agendas { get; set; } = new List<Agenda>();
}

public class Especialidad
{
    public int Id { get; set; }
    public string Nombre { get; set; } = string.Empty;
    public string Descripcion { get; set; } = string.Empty;

    public ICollection<ProfesionalEspecialidad> Profesionales { get; set; } = new List<ProfesionalEspecialidad>();
}

public class ObraSocial
{
    public int Id { get; set; }
    public string Nombre { get; set; } = string.Empty;
    public string Catalogo { get; set; } = string.Empty; // Coberturas ofrecidas

    public ICollection<PacienteObraSocial> Pacientes { get; set; } = new List<PacienteObraSocial>();
    public ICollection<ProfesionalObraSocial> Profesionales { get; set; } = new List<ProfesionalObraSocial>();
}

public class Profesional
{
    public string Cuil { get; set; } = string.Empty; // Primary Key
    public int UsuarioId { get; set; }
    public Usuario? Usuario { get; set; }

    public string Nombre { get; set; } = string.Empty;
    public string Apellido { get; set; } = string.Empty;
    public DateTime FechaNacimiento { get; set; }
    public string Telefono { get; set; } = string.Empty;
    public string Domicilio { get; set; } = string.Empty;
    public string Matricula { get; set; } = string.Empty;
    public string Genero { get; set; } = string.Empty;
    public EstadoProfesional Estado { get; set; } = EstadoProfesional.Activo;

    // Calculated dynamically from questionnaires or stored for caching
    public double Puntuacion { get; set; } = 0.0;

    public ICollection<ProfesionalConsultorio> Consultorios { get; set; } = new List<ProfesionalConsultorio>();
    public ICollection<ProfesionalEspecialidad> Especialidades { get; set; } = new List<ProfesionalEspecialidad>();
    public ICollection<ProfesionalObraSocial> ObrasSociales { get; set; } = new List<ProfesionalObraSocial>();
    public ICollection<Agenda> Agendas { get; set; } = new List<Agenda>();
}

public class Agenda
{
    public int Id { get; set; }
    public string ProfesionalCuil { get; set; } = string.Empty;
    public Profesional? Profesional { get; set; }

    public string ConsultorioCuit { get; set; } = string.Empty;
    public Consultorio? Consultorio { get; set; }

    public int Dia { get; set; }
    public int Mes { get; set; }
    public int Anio { get; set; }

    public TimeSpan HoraEntrada { get; set; }
    public TimeSpan HoraSalida { get; set; }

    public ICollection<Turno> Turnos { get; set; } = new List<Turno>();
}

public class Turno
{
    public int Id { get; set; }
    public int AgendaId { get; set; }
    public Agenda? Agenda { get; set; }

    public DateTime Fecha { get; set; }
    public TimeSpan HoraInicio { get; set; }
    public TimeSpan HoraFin { get; set; }
    public EstadoTurno Estado { get; set; } = EstadoTurno.Disponible;

    public Cita? Cita { get; set; }
}

public class Cita
{
    public int Id { get; set; }
    public int TurnoId { get; set; }
    public Turno? Turno { get; set; }

    public string PacienteCuil { get; set; } = string.Empty;
    public Paciente? Paciente { get; set; }

    public DateTime Fecha { get; set; }
    public EstadoCita Estado { get; set; } = EstadoCita.Solicitada;
    public TipoCita Tipo { get; set; } = TipoCita.Consulta;
    public CoberturaCita Cobertura { get; set; } = CoberturaCita.ObraSocial;

    public Observacion? Observacion { get; set; }
    public Cuestionario? Cuestionario { get; set; }
    public ICollection<Receta> Recetas { get; set; } = new List<Receta>();
}

public class Observacion
{
    public int Id { get; set; }
    public int CitaId { get; set; }
    public Cita? Cita { get; set; }

    public string Motivo { get; set; } = string.Empty;
    public string Detalle { get; set; } = string.Empty;
}

public class Cuestionario
{
    public int Id { get; set; }
    public int CitaId { get; set; }
    public Cita? Cita { get; set; }

    public int Puntualidad { get; set; } // 1 a 5
    public int Atencion { get; set; }   // 1 a 5
    public int Profesionalismo { get; set; } // 1 a 5
    public string? Comentario { get; set; }
}

public class Receta
{
    public int Id { get; set; }
    public int CitaId { get; set; }
    public Cita? Cita { get; set; }

    public DateTime FechaEmision { get; set; } = DateTime.UtcNow;
    public string Medicamentos { get; set; } = string.Empty;
    public string Dosis { get; set; } = string.Empty;
    public string Indicaciones { get; set; } = string.Empty;
    public EstadoReceta Estado { get; set; } = EstadoReceta.Activa;
}

// Junction Entities
public class ProfesionalConsultorio
{
    public string ProfesionalCuil { get; set; } = string.Empty;
    public Profesional? Profesional { get; set; }

    public string ConsultorioCuit { get; set; } = string.Empty;
    public Consultorio? Consultorio { get; set; }
}

public class ProfesionalEspecialidad
{
    public string ProfesionalCuil { get; set; } = string.Empty;
    public Profesional? Profesional { get; set; }

    public int EspecialidadId { get; set; }
    public Especialidad? Especialidad { get; set; }
}

public class ProfesionalObraSocial
{
    public string ProfesionalCuil { get; set; } = string.Empty;
    public Profesional? Profesional { get; set; }

    public int ObraSocialId { get; set; }
    public ObraSocial? ObraSocial { get; set; }
}

public class PacienteObraSocial
{
    public string PacienteCuil { get; set; } = string.Empty;
    public Paciente? Paciente { get; set; }

    public int ObraSocialId { get; set; }
    public ObraSocial? ObraSocial { get; set; }
}
