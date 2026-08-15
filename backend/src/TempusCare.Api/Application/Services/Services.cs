using Microsoft.EntityFrameworkCore;
using TempusCare.Api.Application.DTOs;
using TempusCare.Api.Application.Exceptions;
using TempusCare.Api.Domain.Entities;
using TempusCare.Api.Domain.Enums;
using TempusCare.Api.Infrastructure.Data;

namespace TempusCare.Api.Application.Services;

#region Interfaces

public interface IAuthService
{
    Task<UsuarioAutenticadoDto> RegistrarUsuarioAsync(RegistrarUsuarioDto dto);
    Task<UsuarioAutenticadoDto> IniciarSesionAsync(IniciarSesionDto dto);
}

public interface IProfesionalService
{
    Task<ProfesionalResponseDto> AltaProfesionalAsync(AltaProfesionalDto dto);
    Task<ProfesionalResponseDto> ModificarProfesionalAsync(ModificarProfesionalDto dto);
    Task BajaProfesionalAsync(string cuil);
    Task<List<ProfesionalResponseDto>> ConsultarProfesionalesAsync(int? especialidadId, int? obraSocialId, string? consultorioCuit);
    Task<ProfesionalResponseDto> ObtenerPorCuilAsync(string cuil);
}

public interface IConsultorioService
{
    Task<ConsultorioResponseDto> AltaConsultorioAsync(AltaConsultorioDto dto);
    Task<ConsultorioResponseDto> ModificarConsultorioAsync(ModificarConsultorioDto dto);
    Task BajaConsultorioAsync(string cuit);
    Task<List<ConsultorioResponseDto>> ObtenerTodosAsync();
    Task<ConsultorioResponseDto> ObtenerPorCuitAsync(string cuit);
}

public interface IEspecialidadService
{
    Task<EspecialidadDto> AltaEspecialidadAsync(AltaEspecialidadDto dto);
    Task<EspecialidadDto> ModificarEspecialidadAsync(ModificarEspecialidadDto dto);
    Task EliminarEspecialidadAsync(int id);
    Task<List<EspecialidadDto>> ObtenerTodasAsync();
}

public interface IAgendaService
{
    Task<AgendaResponseDto> AltaAgendaAsync(AltaAgendaDto dto);
    Task<AgendaResponseDto> ModificarAgendaAsync(ModificarAgendaDto dto);
    Task EliminarAgendaAsync(int idAgenda);
    Task<List<AgendaResponseDto>> ObtenerAgendasPorProfesionalAsync(string cuil);
}

public interface ITurnoCitaService
{
    Task<List<TurnoResponseDto>> ObtenerTurnosDisponiblesAsync(string profesionalCuil, DateTime? fecha);
    Task<CitaResponseDto> AltaCitaAsync(AltaCitaDto dto);
    Task<CitaResponseDto> ModificarCitaEstadoAsync(int citaId, EstadoCita estado);
    Task BajaCitaAsync(int citaId);
    Task<TurnoResponseDto> ModificarTurnoAsync(int turnoId, string? detalle, EstadoTurno? estado);
    Task CompletarCuestionarioAsync(CompletarCuestionarioDto dto);
    Task CompletarObservacionAsync(CompletarObservacionDto dto);
    Task<List<CitaResponseDto>> ObtenerCitasPacienteAsync(string pacienteCuil);
    Task<List<CitaResponseDto>> ObtenerCitasProfesionalAsync(string profesionalCuil, DateTime? fecha);
}

public interface IPerfilPacienteService
{
    Task<PacientePerfilResponseDto> AltaPerfilAsync(AltaPerfilPacienteDto dto);
    Task<PacientePerfilResponseDto> ModificarPerfilAsync(ModificacionPerfilPacienteDto dto);
    Task BajaPerfilAsync(string cuil);
    Task<PacientePerfilResponseDto> ObtenerPerfilAsync(string cuil);
}

#endregion

#region Implementation

public class AuthService : IAuthService
{
    private readonly TempusCareDbContext _db;

    public AuthService(TempusCareDbContext db)
    {
        _db = db;
    }

    public async Task<UsuarioAutenticadoDto> RegistrarUsuarioAsync(RegistrarUsuarioDto dto)
    {
        if (await _db.Usuarios.AnyAsync(u => u.NombreUsuario == dto.Usuario || u.Mail == dto.Mail))
        {
            throw new ConflictException("El nombre de usuario o correo electrónico ya se encuentra registrado.");
        }

        var usuario = new Usuario
        {
            NombreUsuario = dto.Usuario,
            Contrasena = dto.Contra, // En producción se aplicaría Hashing (BCrypt/Argon2)
            Mail = dto.Mail,
            Rol = dto.Rol
        };

        _db.Usuarios.Add(usuario);
        await _db.SaveChangesAsync();

        string? cuil = null;

        // Si es paciente, creamos perfil preliminar si se especifica
        if (dto.Rol == RolUsuario.Paciente)
        {
            cuil = "PAC-" + usuario.Id;
            var paciente = new Paciente
            {
                Cuil = cuil,
                UsuarioId = usuario.Id,
                Nombre = dto.Usuario,
                Apellido = "",
                FechaNacimiento = DateTime.UtcNow,
                Telefono = "",
                Domicilio = "",
                Genero = ""
            };
            _db.Pacientes.Add(paciente);
            await _db.SaveChangesAsync();
        }

        string mockToken = $"JWT-TOKEN-USER-{usuario.Id}-{usuario.Rol}";

        return new UsuarioAutenticadoDto(usuario.Id, usuario.NombreUsuario, usuario.Mail, usuario.Rol, cuil, mockToken);
    }

    public async Task<UsuarioAutenticadoDto> IniciarSesionAsync(IniciarSesionDto dto)
    {
        var usuario = await _db.Usuarios
            .Include(u => u.Paciente)
            .Include(u => u.Profesional)
            .FirstOrDefaultAsync(u => u.NombreUsuario == dto.Usuario && u.Contrasena == dto.Contra);

        if (usuario == null)
        {
            throw new NotFoundException("Credenciales inválidas.");
        }

        string? cuil = usuario.Rol switch
        {
            RolUsuario.Paciente => usuario.Paciente?.Cuil,
            RolUsuario.Profesional => usuario.Profesional?.Cuil,
            _ => null
        };

        string mockToken = $"JWT-TOKEN-USER-{usuario.Id}-{usuario.Rol}";

        return new UsuarioAutenticadoDto(usuario.Id, usuario.NombreUsuario, usuario.Mail, usuario.Rol, cuil, mockToken);
    }
}

public class ProfesionalService : IProfesionalService
{
    private readonly TempusCareDbContext _db;

    public ProfesionalService(TempusCareDbContext db)
    {
        _db = db;
    }

    public async Task<ProfesionalResponseDto> AltaProfesionalAsync(AltaProfesionalDto dto)
    {
        if (await _db.Profesionales.AnyAsync(p => p.Cuil == dto.Cuil || p.Matricula == dto.Matricula))
        {
            throw new ConflictException("Ya existe un profesional con el mismo CUIL o Matrícula.");
        }

        // Crear usuario por defecto para el profesional si no existe
        var usuario = new Usuario
        {
            NombreUsuario = dto.Cuil,
            Contrasena = "Tempus123!",
            Mail = $"{dto.Cuil}@tempuscare.com",
            Rol = RolUsuario.Profesional
        };
        _db.Usuarios.Add(usuario);
        await _db.SaveChangesAsync();

        var prof = new Profesional
        {
            Cuil = dto.Cuil,
            UsuarioId = usuario.Id,
            Nombre = dto.Nombre,
            Apellido = dto.Apellido,
            FechaNacimiento = dto.FecNac,
            Domicilio = dto.Domicilio,
            Telefono = dto.Telefono,
            Matricula = dto.Matricula,
            Genero = dto.Genero,
            Estado = EstadoProfesional.Activo,
            Puntuacion = 0.0
        };

        _db.Profesionales.Add(prof);

        // Asociaciones
        if (dto.EspecialidadesIds != null)
        {
            foreach (var espId in dto.EspecialidadesIds)
            {
                prof.Especialidades.Add(new ProfesionalEspecialidad { ProfesionalCuil = prof.Cuil, EspecialidadId = espId });
            }
        }

        if (dto.ConsultoriosCuits != null)
        {
            foreach (var consCuit in dto.ConsultoriosCuits)
            {
                prof.Consultorios.Add(new ProfesionalConsultorio { ProfesionalCuil = prof.Cuil, ConsultorioCuit = consCuit });
            }
        }

        if (dto.ObrasSocialesIds != null)
        {
            foreach (var osId in dto.ObrasSocialesIds)
            {
                prof.ObrasSociales.Add(new ProfesionalObraSocial { ProfesionalCuil = prof.Cuil, ObraSocialId = osId });
            }
        }

        await _db.SaveChangesAsync();

        return await ObtenerPorCuilAsync(prof.Cuil);
    }

    public async Task<ProfesionalResponseDto> ModificarProfesionalAsync(ModificarProfesionalDto dto)
    {
        var prof = await _db.Profesionales
            .Include(p => p.Especialidades)
            .Include(p => p.Consultorios)
            .Include(p => p.ObrasSociales)
            .FirstOrDefaultAsync(p => p.Cuil == dto.Cuil);

        if (prof == null)
            throw new NotFoundException($"Profesional con CUIL {dto.Cuil} no encontrado.");

        prof.Nombre = dto.Nombre;
        prof.Apellido = dto.Apellido;
        prof.FechaNacimiento = dto.FecNac;
        prof.Domicilio = dto.Domicilio;
        prof.Telefono = dto.Telefono;
        prof.Matricula = dto.Matricula;
        prof.Genero = dto.Genero;

        // Actualizar asociaciones
        prof.Especialidades.Clear();
        if (dto.EspecialidadesIds != null)
        {
            foreach (var id in dto.EspecialidadesIds)
                prof.Especialidades.Add(new ProfesionalEspecialidad { ProfesionalCuil = prof.Cuil, EspecialidadId = id });
        }

        prof.Consultorios.Clear();
        if (dto.ConsultoriosCuits != null)
        {
            foreach (var cuit in dto.ConsultoriosCuits)
                prof.Consultorios.Add(new ProfesionalConsultorio { ProfesionalCuil = prof.Cuil, ConsultorioCuit = cuit });
        }

        prof.ObrasSociales.Clear();
        if (dto.ObrasSocialesIds != null)
        {
            foreach (var id in dto.ObrasSocialesIds)
                prof.ObrasSociales.Add(new ProfesionalObraSocial { ProfesionalCuil = prof.Cuil, ObraSocialId = id });
        }

        await _db.SaveChangesAsync();

        return await ObtenerPorCuilAsync(prof.Cuil);
    }

    public async Task BajaProfesionalAsync(string cuil)
    {
        var prof = await _db.Profesionales.FirstOrDefaultAsync(p => p.Cuil == cuil);
        if (prof == null)
            throw new NotFoundException($"Profesional con CUIL {cuil} no encontrado.");

        // Baja lógica
        prof.Estado = EstadoProfesional.Inactivo;
        await _db.SaveChangesAsync();
    }

    public async Task<List<ProfesionalResponseDto>> ConsultarProfesionalesAsync(int? especialidadId, int? obraSocialId, string? consultorioCuit)
    {
        var query = _db.Profesionales
            .Include(p => p.Especialidades).ThenInclude(e => e.Especialidad)
            .Include(p => p.Consultorios).ThenInclude(c => c.Consultorio)
            .Include(p => p.ObrasSociales).ThenInclude(o => o.ObraSocial)
            .Where(p => p.Estado == EstadoProfesional.Activo)
            .AsQueryable();

        if (especialidadId.HasValue)
        {
            query = query.Where(p => p.Especialidades.Any(e => e.EspecialidadId == especialidadId.Value));
        }

        if (obraSocialId.HasValue)
        {
            query = query.Where(p => p.ObrasSociales.Any(o => o.ObraSocialId == obraSocialId.Value));
        }

        if (!string.IsNullOrEmpty(consultorioCuit))
        {
            query = query.Where(p => p.Consultorios.Any(c => c.ConsultorioCuit == consultorioCuit));
        }

        var lista = await query.ToListAsync();

        return lista.Select(p => MapToResponseDto(p)).ToList();
    }

    public async Task<ProfesionalResponseDto> ObtenerPorCuilAsync(string cuil)
    {
        var prof = await _db.Profesionales
            .Include(p => p.Especialidades).ThenInclude(e => e.Especialidad)
            .Include(p => p.Consultorios).ThenInclude(c => c.Consultorio)
            .Include(p => p.ObrasSociales).ThenInclude(o => o.ObraSocial)
            .FirstOrDefaultAsync(p => p.Cuil == cuil);

        if (prof == null)
            throw new NotFoundException($"Profesional con CUIL {cuil} no encontrado.");

        return MapToResponseDto(prof);
    }

    private static ProfesionalResponseDto MapToResponseDto(Profesional p)
    {
        return new ProfesionalResponseDto(
            p.Cuil,
            p.Nombre,
            p.Apellido,
            p.FechaNacimiento,
            p.Telefono,
            p.Domicilio,
            p.Matricula,
            p.Genero,
            p.Estado,
            p.Puntuacion,
            p.Especialidades.Select(e => e.Especialidad?.Nombre ?? "").Where(s => s != "").ToList(),
            p.Consultorios.Select(c => c.Consultorio?.Nombre ?? "").Where(s => s != "").ToList(),
            p.ObrasSociales.Select(o => o.ObraSocial?.Nombre ?? "").Where(s => s != "").ToList()
        );
    }
}

public class ConsultorioService : IConsultorioService
{
    private readonly TempusCareDbContext _db;

    public ConsultorioService(TempusCareDbContext db)
    {
        _db = db;
    }

    public async Task<ConsultorioResponseDto> AltaConsultorioAsync(AltaConsultorioDto dto)
    {
        if (await _db.Consultorios.AnyAsync(c => c.Cuit == dto.Cuit))
            throw new ConflictException($"Ya existe un consultorio registrado con el CUIT {dto.Cuit}.");

        var dir = new Direccion
        {
            Calle = dto.Calle,
            Nro = dto.Nro,
            Depto = dto.Depto,
            Localidad = dto.Localidad,
            Provincia = dto.Provincia,
            CodPostal = dto.CodPostal
        };
        _db.Direcciones.Add(dir);
        await _db.SaveChangesAsync();

        var cons = new Consultorio
        {
            Cuit = dto.Cuit,
            Nombre = dto.Nombre,
            Email = dto.Email,
            Telefono = dto.Telefono,
            NivelAccesibilidad = dto.NivelAccesibilidad,
            DireccionId = dir.Id
        };
        _db.Consultorios.Add(cons);

        if (dto.ProfesionalesCuils != null)
        {
            foreach (var cuil in dto.ProfesionalesCuils)
            {
                cons.Profesionales.Add(new ProfesionalConsultorio { ConsultorioCuit = cons.Cuit, ProfesionalCuil = cuil });
            }
        }

        await _db.SaveChangesAsync();
        return await ObtenerPorCuitAsync(cons.Cuit);
    }

    public async Task<ConsultorioResponseDto> ModificarConsultorioAsync(ModificarConsultorioDto dto)
    {
        var cons = await _db.Consultorios
            .Include(c => c.Direccion)
            .Include(c => c.Profesionales)
            .FirstOrDefaultAsync(c => c.Cuit == dto.Cuit);

        if (cons == null)
            throw new NotFoundException($"Consultorio con CUIT {dto.Cuit} no encontrado.");

        cons.Nombre = dto.Nombre;
        cons.Email = dto.Email;
        cons.Telefono = dto.Telefono;
        cons.NivelAccesibilidad = dto.NivelAccesibilidad;

        if (cons.Direccion != null)
        {
            cons.Direccion.Calle = dto.Calle;
            cons.Direccion.Nro = dto.Nro;
            cons.Direccion.Depto = dto.Depto;
            cons.Direccion.Localidad = dto.Localidad;
            cons.Direccion.Provincia = dto.Provincia;
            cons.Direccion.CodPostal = dto.CodPostal;
        }

        cons.Profesionales.Clear();
        if (dto.ProfesionalesCuils != null)
        {
            foreach (var cuil in dto.ProfesionalesCuils)
            {
                cons.Profesionales.Add(new ProfesionalConsultorio { ConsultorioCuit = cons.Cuit, ProfesionalCuil = cuil });
            }
        }

        await _db.SaveChangesAsync();
        return await ObtenerPorCuitAsync(cons.Cuit);
    }

    public async Task BajaConsultorioAsync(string cuit)
    {
        var cons = await _db.Consultorios.FirstOrDefaultAsync(c => c.Cuit == cuit);
        if (cons == null)
            throw new NotFoundException($"Consultorio con CUIT {cuit} no encontrado.");

        _db.Consultorios.Remove(cons);
        await _db.SaveChangesAsync();
    }

    public async Task<List<ConsultorioResponseDto>> ObtenerTodosAsync()
    {
        var lista = await _db.Consultorios
            .Include(c => c.Direccion)
            .Include(c => c.Profesionales).ThenInclude(p => p.Profesional)
            .ToListAsync();

        return lista.Select(c => MapToDto(c)).ToList();
    }

    public async Task<ConsultorioResponseDto> ObtenerPorCuitAsync(string cuit)
    {
        var cons = await _db.Consultorios
            .Include(c => c.Direccion)
            .Include(c => c.Profesionales).ThenInclude(p => p.Profesional)
            .FirstOrDefaultAsync(c => c.Cuit == cuit);

        if (cons == null)
            throw new NotFoundException($"Consultorio con CUIT {cuit} no encontrado.");

        return MapToDto(cons);
    }

    private static ConsultorioResponseDto MapToDto(Consultorio c)
    {
        string dirStr = c.Direccion != null
            ? $"{c.Direccion.Calle} {c.Direccion.Nro}, {c.Direccion.Localidad}, {c.Direccion.Provincia}"
            : "";

        return new ConsultorioResponseDto(
            c.Cuit,
            c.Nombre,
            c.Email,
            c.Telefono,
            c.NivelAccesibilidad,
            dirStr,
            c.Profesionales.Select(p => $"{p.Profesional?.Nombre} {p.Profesional?.Apellido}").ToList()
        );
    }
}

public class EspecialidadService : IEspecialidadService
{
    private readonly TempusCareDbContext _db;

    public EspecialidadService(TempusCareDbContext db)
    {
        _db = db;
    }

    public async Task<EspecialidadDto> AltaEspecialidadAsync(AltaEspecialidadDto dto)
    {
        var esp = new Especialidad { Nombre = dto.Nombre, Descripcion = dto.Descripcion };
        _db.Especialidades.Add(esp);
        await _db.SaveChangesAsync();
        return new EspecialidadDto(esp.Id, esp.Nombre, esp.Descripcion);
    }

    public async Task<EspecialidadDto> ModificarEspecialidadAsync(ModificarEspecialidadDto dto)
    {
        var esp = await _db.Especialidades.FindAsync(dto.Id);
        if (esp == null)
            throw new NotFoundException($"Especialidad con ID {dto.Id} no encontrada.");

        esp.Nombre = dto.Nombre;
        esp.Descripcion = dto.Descripcion;
        await _db.SaveChangesAsync();
        return new EspecialidadDto(esp.Id, esp.Nombre, esp.Descripcion);
    }

    public async Task EliminarEspecialidadAsync(int id)
    {
        var esp = await _db.Especialidades.FindAsync(id);
        if (esp == null)
            throw new NotFoundException($"Especialidad con ID {id} no encontrada.");

        _db.Especialidades.Remove(esp);
        await _db.SaveChangesAsync();
    }

    public async Task<List<EspecialidadDto>> ObtenerTodasAsync()
    {
        return await _db.Especialidades
            .Select(e => new EspecialidadDto(e.Id, e.Nombre, e.Descripcion))
            .ToListAsync();
    }
}

public class AgendaService : IAgendaService
{
    private readonly TempusCareDbContext _db;

    public AgendaService(TempusCareDbContext db)
    {
        _db = db;
    }

    public async Task<AgendaResponseDto> AltaAgendaAsync(AltaAgendaDto dto)
    {
        var prof = await _db.Profesionales.FirstOrDefaultAsync(p => p.Cuil == dto.ProfesionalCuil);
        if (prof == null)
            throw new NotFoundException($"Profesional con CUIL {dto.ProfesionalCuil} no encontrado.");

        var cons = await _db.Consultorios.FirstOrDefaultAsync(c => c.Cuit == dto.CuitConsultorio);
        if (cons == null)
            throw new NotFoundException($"Consultorio con CUIT {dto.CuitConsultorio} no encontrado.");

        // RN-01: Un profesional no puede tener dos turnos/agendas superpuestas en la misma franja horaria.
        bool solapado = await _db.Agendas.AnyAsync(a =>
            a.ProfesionalCuil == dto.ProfesionalCuil &&
            a.Dia == dto.Dia && a.Mes == dto.Mes && a.Anio == dto.Anio &&
            ((dto.HoraEntrada >= a.HoraEntrada && dto.HoraEntrada < a.HoraSalida) ||
             (dto.HoraSalida > a.HoraEntrada && dto.HoraSalida <= a.HoraSalida) ||
             (dto.HoraEntrada <= a.HoraEntrada && dto.HoraSalida >= a.HoraSalida)));

        if (solapado)
            throw new ConflictException("RN-01: El profesional ya posee una agenda configurada que se solapa en esa franja horaria.");

        var agenda = new Agenda
        {
            ProfesionalCuil = dto.ProfesionalCuil,
            ConsultorioCuit = dto.CuitConsultorio,
            Dia = dto.Dia,
            Mes = dto.Mes,
            Anio = dto.Anio,
            HoraEntrada = dto.HoraEntrada,
            HoraSalida = dto.HoraSalida
        };

        _db.Agendas.Add(agenda);
        await _db.SaveChangesAsync();

        // Generación automática de franjas horarias (Turnos)
        DateTime fechaBase = new DateTime(dto.Anio, dto.Mes, dto.Dia);
        TimeSpan tiempoActual = dto.HoraEntrada;
        int duracion = dto.DuracionTurnoMinutos > 0 ? dto.DuracionTurnoMinutos : 30;

        while (tiempoActual.Add(TimeSpan.FromMinutes(duracion)) <= dto.HoraSalida)
        {
            var turno = new Turno
            {
                AgendaId = agenda.Id,
                Fecha = fechaBase,
                HoraInicio = tiempoActual,
                HoraFin = tiempoActual.Add(TimeSpan.FromMinutes(duracion)),
                Estado = EstadoTurno.Disponible
            };
            _db.Turnos.Add(turno);
            tiempoActual = tiempoActual.Add(TimeSpan.FromMinutes(duracion));
        }

        await _db.SaveChangesAsync();

        int totalTurnos = await _db.Turnos.CountAsync(t => t.AgendaId == agenda.Id);

        return new AgendaResponseDto(
            agenda.Id,
            prof.Cuil,
            $"{prof.Nombre} {prof.Apellido}",
            cons.Cuit,
            cons.Nombre,
            agenda.Dia,
            agenda.Mes,
            agenda.Anio,
            agenda.HoraEntrada,
            agenda.HoraSalida,
            totalTurnos
        );
    }

    public async Task<AgendaResponseDto> ModificarAgendaAsync(ModificarAgendaDto dto)
    {
        var agenda = await _db.Agendas
            .Include(a => a.Profesional)
            .Include(a => a.Consultorio)
            .Include(a => a.Turnos)
            .FirstOrDefaultAsync(a => a.Id == dto.IdAgenda);

        if (agenda == null)
            throw new NotFoundException($"Agenda {dto.IdAgenda} no encontrada.");

        agenda.HoraEntrada = dto.NuevaHoraEntrada;
        agenda.HoraSalida = dto.NuevaHoraSalida;

        await _db.SaveChangesAsync();

        int cantTurnos = agenda.Turnos.Count;

        return new AgendaResponseDto(
            agenda.Id,
            agenda.ProfesionalCuil,
            $"{agenda.Profesional?.Nombre} {agenda.Profesional?.Apellido}",
            agenda.ConsultorioCuit,
            agenda.Consultorio?.Nombre ?? "",
            agenda.Dia,
            agenda.Mes,
            agenda.Anio,
            agenda.HoraEntrada,
            agenda.HoraSalida,
            cantTurnos
        );
    }

    public async Task EliminarAgendaAsync(int idAgenda)
    {
        var agenda = await _db.Agendas
            .Include(a => a.Turnos)
            .FirstOrDefaultAsync(a => a.Id == idAgenda);

        if (agenda == null)
            throw new NotFoundException($"Agenda {idAgenda} no encontrada.");

        _db.Agendas.Remove(agenda);
        await _db.SaveChangesAsync();
    }

    public async Task<List<AgendaResponseDto>> ObtenerAgendasPorProfesionalAsync(string cuil)
    {
        var agendas = await _db.Agendas
            .Include(a => a.Profesional)
            .Include(a => a.Consultorio)
            .Include(a => a.Turnos)
            .Where(a => a.ProfesionalCuil == cuil)
            .ToListAsync();

        return agendas.Select(a => new AgendaResponseDto(
            a.Id,
            a.ProfesionalCuil,
            $"{a.Profesional?.Nombre} {a.Profesional?.Apellido}",
            a.ConsultorioCuit,
            a.Consultorio?.Nombre ?? "",
            a.Dia,
            a.Mes,
            a.Anio,
            a.HoraEntrada,
            a.HoraSalida,
            a.Turnos.Count
        )).ToList();
    }
}

public class TurnoCitaService : ITurnoCitaService
{
    private readonly TempusCareDbContext _db;

    public TurnoCitaService(TempusCareDbContext db)
    {
        _db = db;
    }

    public async Task<List<TurnoResponseDto>> ObtenerTurnosDisponiblesAsync(string profesionalCuil, DateTime? fecha)
    {
        var query = _db.Turnos
            .Include(t => t.Agenda).ThenInclude(a => a!.Profesional)
            .Include(t => t.Agenda).ThenInclude(a => a!.Consultorio)
            .Where(t => t.Agenda!.ProfesionalCuil == profesionalCuil && t.Estado == EstadoTurno.Disponible)
            .AsQueryable();

        if (fecha.HasValue)
        {
            var dateOnly = fecha.Value.Date;
            query = query.Where(t => t.Fecha.Date == dateOnly);
        }

        var lista = await query.ToListAsync();

        return lista.Select(t => MapTurnoDto(t)).ToList();
    }

    public async Task<CitaResponseDto> AltaCitaAsync(AltaCitaDto dto)
    {
        var paciente = await _db.Pacientes.FirstOrDefaultAsync(p => p.Cuil == dto.PacienteCuil);
        if (paciente == null)
            throw new NotFoundException($"Paciente con CUIL {dto.PacienteCuil} no encontrado.");

        var prof = await _db.Profesionales
            .Include(p => p.ObrasSociales)
            .FirstOrDefaultAsync(p => p.Cuil == dto.ProfesionalCuil);
        if (prof == null)
            throw new NotFoundException($"Profesional con CUIL {dto.ProfesionalCuil} no encontrado.");

        var turno = await _db.Turnos
            .Include(t => t.Agenda).ThenInclude(a => a!.Profesional)
            .Include(t => t.Agenda).ThenInclude(a => a!.Consultorio)
            .FirstOrDefaultAsync(t => t.Id == dto.TurnoId);

        if (turno == null)
            throw new NotFoundException($"Turno ID {dto.TurnoId} no encontrado.");

        // RN-02: Solo se pueden reservar turnos en franjas disponibles.
        if (turno.Estado != EstadoTurno.Disponible)
            throw new ConflictException("RN-02: El horario seleccionado ya no está disponible.");

        // RN-04: Verificar si el profesional acepta la obra social seleccionada.
        // Si no coincide o se atiende por particular, se marca Cobertura = Particular.
        CoberturaCita coberturaFinal = CoberturaCita.Particular;
        if (dto.ObraSocialId.HasValue)
        {
            bool aceptaObraSocial = prof.ObrasSociales.Any(o => o.ObraSocialId == dto.ObraSocialId.Value);
            if (aceptaObraSocial)
            {
                coberturaFinal = CoberturaCita.ObraSocial;
            }
        }

        // Actualizar estado del Turno y crear Cita
        turno.Estado = EstadoTurno.Reservado;

        var cita = new Cita
        {
            TurnoId = turno.Id,
            PacienteCuil = paciente.Cuil,
            Fecha = turno.Fecha,
            Estado = EstadoCita.Confirmada,
            Tipo = dto.Tipo,
            Cobertura = coberturaFinal
        };

        _db.Citas.Add(cita);
        await _db.SaveChangesAsync();

        return MapCitaDto(cita, turno, paciente, prof);
    }

    public async Task<CitaResponseDto> ModificarCitaEstadoAsync(int citaId, EstadoCita estado)
    {
        var cita = await _db.Citas
            .Include(c => c.Turno).ThenInclude(t => t!.Agenda).ThenInclude(a => a!.Profesional)
            .Include(c => c.Turno).ThenInclude(t => t!.Agenda).ThenInclude(a => a!.Consultorio)
            .Include(c => c.Paciente)
            .Include(c => c.Observacion)
            .Include(c => c.Cuestionario)
            .FirstOrDefaultAsync(c => c.Id == citaId);

        if (cita == null)
            throw new NotFoundException($"Cita ID {citaId} no encontrada.");

        cita.Estado = estado;

        // Regla de Negocio de Cita / Turno:
        // Si el paciente cancela la cita, el turno pasa a estar Disponible para otro paciente.
        if (estado == EstadoCita.Cancelada && cita.Turno != null)
        {
            cita.Turno.Estado = EstadoTurno.Disponible;
        }
        else if (estado == EstadoCita.Atendida && cita.Turno != null)
        {
            cita.Turno.Estado = EstadoTurno.Atendido;
        }

        await _db.SaveChangesAsync();
        return MapCitaDto(cita, cita.Turno!, cita.Paciente!, cita.Turno!.Agenda!.Profesional!);
    }

    public async Task BajaCitaAsync(int citaId)
    {
        await ModificarCitaEstadoAsync(citaId, EstadoCita.Cancelada);
    }

    public async Task<TurnoResponseDto> ModificarTurnoAsync(int turnoId, string? detalle, EstadoTurno? estado)
    {
        var turno = await _db.Turnos
            .Include(t => t.Cita)
            .Include(t => t.Agenda).ThenInclude(a => a!.Profesional)
            .Include(t => t.Agenda).ThenInclude(a => a!.Consultorio)
            .FirstOrDefaultAsync(t => t.Id == turnoId);

        if (turno == null)
            throw new NotFoundException($"Turno ID {turnoId} no encontrado.");

        if (estado.HasValue)
        {
            turno.Estado = estado.Value;

            // Regla de Negocio: Si el médico cancela el turno, la cita se cancela automáticamente.
            if (estado.Value == EstadoTurno.Cancelado && turno.Cita != null)
            {
                turno.Cita.Estado = EstadoCita.Cancelada;
            }
        }

        await _db.SaveChangesAsync();
        return MapTurnoDto(turno);
    }

    public async Task CompletarCuestionarioAsync(CompletarCuestionarioDto dto)
    {
        var cita = await _db.Citas
            .Include(c => c.Turno).ThenInclude(t => t!.Agenda)
            .Include(c => c.Cuestionario)
            .FirstOrDefaultAsync(c => c.Id == dto.CitaId);

        if (cita == null)
            throw new NotFoundException($"Cita ID {dto.CitaId} no encontrada.");

        if (cita.Cuestionario != null)
            throw new ConflictException("Esta cita ya posee una encuesta registrada.");

        var cuestionario = new Cuestionario
        {
            CitaId = cita.Id,
            Puntualidad = Math.Clamp(dto.Puntualidad, 1, 5),
            Atencion = Math.Clamp(dto.Atencion, 1, 5),
            Profesionalismo = Math.Clamp(dto.Profesionalismo, 1, 5),
            Comentario = dto.Comentario
        };

        _db.Cuestionarios.Add(cuestionario);
        await _db.SaveChangesAsync();

        // Recalcular promedio del profesional
        string profCuil = cita.Turno!.Agenda!.ProfesionalCuil;
        var encuestas = await _db.Cuestionarios
            .Include(c => c.Cita).ThenInclude(ci => ci!.Turno).ThenInclude(t => t!.Agenda)
            .Where(c => c.Cita!.Turno!.Agenda!.ProfesionalCuil == profCuil)
            .ToListAsync();

        if (encuestas.Any())
        {
            double promedioGral = encuestas.Average(e => (e.Puntualidad + e.Atencion + e.Profesionalismo) / 3.0);
            var prof = await _db.Profesionales.FirstOrDefaultAsync(p => p.Cuil == profCuil);
            if (prof != null)
            {
                prof.Puntuacion = Math.Round(promedioGral, 2);
                await _db.SaveChangesAsync();
            }
        }
    }

    public async Task CompletarObservacionAsync(CompletarObservacionDto dto)
    {
        var cita = await _db.Citas
            .Include(c => c.Observacion)
            .FirstOrDefaultAsync(c => c.Id == dto.CitaId);

        if (cita == null)
            throw new NotFoundException($"Cita ID {dto.CitaId} no encontrada.");

        if (cita.Observacion != null)
        {
            cita.Observacion.Motivo = dto.Motivo;
            cita.Observacion.Detalle = dto.Detalle;
        }
        else
        {
            _db.Observaciones.Add(new Observacion
            {
                CitaId = cita.Id,
                Motivo = dto.Motivo,
                Detalle = dto.Detalle
            });
        }

        await _db.SaveChangesAsync();
    }

    public async Task<List<CitaResponseDto>> ObtenerCitasPacienteAsync(string pacienteCuil)
    {
        var citas = await _db.Citas
            .Include(c => c.Paciente)
            .Include(c => c.Turno).ThenInclude(t => t!.Agenda).ThenInclude(a => a!.Profesional)
            .Include(c => c.Turno).ThenInclude(t => t!.Agenda).ThenInclude(a => a!.Consultorio)
            .Include(c => c.Observacion)
            .Include(c => c.Cuestionario)
            .Where(c => c.PacienteCuil == pacienteCuil)
            .ToListAsync();

        return citas.Select(c => MapCitaDto(c, c.Turno!, c.Paciente!, c.Turno!.Agenda!.Profesional!)).ToList();
    }

    public async Task<List<CitaResponseDto>> ObtenerCitasProfesionalAsync(string profesionalCuil, DateTime? fecha)
    {
        var query = _db.Citas
            .Include(c => c.Paciente)
            .Include(c => c.Turno).ThenInclude(t => t!.Agenda).ThenInclude(a => a!.Profesional)
            .Include(c => c.Turno).ThenInclude(t => t!.Agenda).ThenInclude(a => a!.Consultorio)
            .Include(c => c.Observacion)
            .Include(c => c.Cuestionario)
            .Where(c => c.Turno!.Agenda!.ProfesionalCuil == profesionalCuil)
            .AsQueryable();

        if (fecha.HasValue)
        {
            var dt = fecha.Value.Date;
            query = query.Where(c => c.Fecha.Date == dt);
        }

        var citas = await query.ToListAsync();
        return citas.Select(c => MapCitaDto(c, c.Turno!, c.Paciente!, c.Turno!.Agenda!.Profesional!)).ToList();
    }

    private static TurnoResponseDto MapTurnoDto(Turno t)
    {
        return new TurnoResponseDto(
            t.Id,
            t.AgendaId,
            t.Fecha,
            t.HoraInicio,
            t.HoraFin,
            t.Estado,
            $"{t.Agenda?.Profesional?.Nombre} {t.Agenda?.Profesional?.Apellido}",
            t.Agenda?.Consultorio?.Nombre ?? ""
        );
    }

    private static CitaResponseDto MapCitaDto(Cita c, Turno t, Paciente p, Profesional prof)
    {
        double? punt = c.Cuestionario != null
            ? Math.Round((c.Cuestionario.Puntualidad + c.Cuestionario.Atencion + c.Cuestionario.Profesionalismo) / 3.0, 2)
            : null;

        return new CitaResponseDto(
            c.Id,
            t.Id,
            p.Cuil,
            $"{p.Nombre} {p.Apellido}",
            $"{prof.Nombre} {prof.Apellido}",
            c.Fecha,
            t.HoraInicio,
            t.HoraFin,
            c.Estado,
            c.Tipo,
            c.Cobertura,
            c.Observacion?.Motivo,
            c.Observacion?.Detalle,
            punt
        );
    }
}

public class PerfilPacienteService : IPerfilPacienteService
{
    private readonly TempusCareDbContext _db;

    public PerfilPacienteService(TempusCareDbContext db)
    {
        _db = db;
    }

    public async Task<PacientePerfilResponseDto> AltaPerfilAsync(AltaPerfilPacienteDto dto)
    {
        if (await _db.Pacientes.AnyAsync(p => p.Cuil == dto.Cuil))
            throw new ConflictException($"Paciente con CUIL {dto.Cuil} ya está registrado.");

        var usuario = new Usuario
        {
            NombreUsuario = dto.Cuil,
            Contrasena = "Paciente123!",
            Mail = $"{dto.Cuil}@paciente.com",
            Rol = RolUsuario.Paciente
        };
        _db.Usuarios.Add(usuario);
        await _db.SaveChangesAsync();

        var pac = new Paciente
        {
            Cuil = dto.Cuil,
            UsuarioId = usuario.Id,
            Nombre = dto.Nombre,
            Apellido = dto.Apellido,
            FechaNacimiento = dto.FecNac,
            Genero = dto.Genero,
            Telefono = dto.Telefono,
            Domicilio = dto.Domicilio
        };
        _db.Pacientes.Add(pac);

        if (dto.ObrasSocialesIds != null)
        {
            foreach (var osId in dto.ObrasSocialesIds)
            {
                pac.ObrasSociales.Add(new PacienteObraSocial { PacienteCuil = pac.Cuil, ObraSocialId = osId });
            }
        }

        await _db.SaveChangesAsync();
        return await ObtenerPerfilAsync(pac.Cuil);
    }

    public async Task<PacientePerfilResponseDto> ModificarPerfilAsync(ModificacionPerfilPacienteDto dto)
    {
        var pac = await _db.Pacientes
            .Include(p => p.ObrasSociales)
            .FirstOrDefaultAsync(p => p.Cuil == dto.Cuil);

        if (pac == null)
            throw new NotFoundException($"Paciente con CUIL {dto.Cuil} no encontrado.");

        pac.Nombre = dto.Nombre;
        pac.Apellido = dto.Apellido;
        pac.FechaNacimiento = dto.FecNac;
        pac.Genero = dto.Genero;
        pac.Telefono = dto.Telefono;
        pac.Domicilio = dto.Domicilio;

        pac.ObrasSociales.Clear();
        if (dto.ObrasSocialesIds != null)
        {
            foreach (var osId in dto.ObrasSocialesIds)
            {
                pac.ObrasSociales.Add(new PacienteObraSocial { PacienteCuil = pac.Cuil, ObraSocialId = osId });
            }
        }

        await _db.SaveChangesAsync();
        return await ObtenerPerfilAsync(pac.Cuil);
    }

    public async Task BajaPerfilAsync(string cuil)
    {
        var pac = await _db.Pacientes.FirstOrDefaultAsync(p => p.Cuil == cuil);
        if (pac == null)
            throw new NotFoundException($"Paciente con CUIL {cuil} no encontrado.");

        _db.Pacientes.Remove(pac);
        await _db.SaveChangesAsync();
    }

    public async Task<PacientePerfilResponseDto> ObtenerPerfilAsync(string cuil)
    {
        var pac = await _db.Pacientes
            .Include(p => p.ObrasSociales).ThenInclude(o => o.ObraSocial)
            .FirstOrDefaultAsync(p => p.Cuil == cuil);

        if (pac == null)
            throw new NotFoundException($"Paciente con CUIL {cuil} no encontrado.");

        return new PacientePerfilResponseDto(
            pac.Cuil,
            pac.Nombre,
            pac.Apellido,
            pac.FechaNacimiento,
            pac.Genero,
            pac.Telefono,
            pac.Domicilio,
            pac.ObrasSociales.Select(o => o.ObraSocial?.Nombre ?? "").Where(s => s != "").ToList()
        );
    }
}

#endregion
