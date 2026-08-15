namespace TempusCare.Api.Domain.Enums;

public enum RolUsuario
{
    Paciente = 1,
    Profesional = 2,
    Secretaria = 3,
    Administrador = 4
}

public enum EstadoProfesional
{
    Activo = 1,
    Inactivo = 2
}

public enum EstadoTurno
{
    Disponible = 1,
    Reservado = 2,
    Atendido = 3,
    Ausente = 4,
    Cancelado = 5
}

public enum EstadoCita
{
    Solicitada = 1,
    Confirmada = 2,
    Atendida = 3,
    Ausente = 4,
    Cancelada = 5
}

public enum TipoCita
{
    Consulta = 1,
    Operacion = 2
}

public enum CoberturaCita
{
    ObraSocial = 1,
    Particular = 2
}

public enum EstadoReceta
{
    Activa = 1,
    Vencida = 2,
    Dispensada = 3
}
