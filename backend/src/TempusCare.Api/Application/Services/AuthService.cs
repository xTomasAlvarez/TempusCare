using Microsoft.EntityFrameworkCore;
using TempusCare.Api.Application.DTOs;
using TempusCare.Api.Application.Exceptions;
using TempusCare.Api.Domain.Entities;
using TempusCare.Api.Domain.Enums;
using TempusCare.Api.Infrastructure.Data;

namespace TempusCare.Api.Application.Services;

public class AuthService : IAuthService
{
    private readonly TempusCareDbContext _db;
    private readonly ILogger<AuthService> _logger;

    public AuthService(TempusCareDbContext db, ILogger<AuthService> logger)
    {
        _db = db;
        _logger = logger;
    }

    public async Task<UsuarioAutenticadoDto> RegistrarUsuarioAsync(RegistrarUsuarioDto dto)
    {
        _logger.LogInformation("Iniciando registro de usuario: {Usuario} con rol {Rol}", dto.Usuario, dto.Rol);

        if (await _db.Usuarios.AnyAsync(u => u.NombreUsuario == dto.Usuario || u.Mail == dto.Mail))
        {
            _logger.LogWarning("El usuario o mail ya existe: {Usuario}, {Mail}", dto.Usuario, dto.Mail);
            throw new ConflictException("El nombre de usuario o correo electrónico ya se encuentra registrado.");
        }

        var usuario = new Usuario
        {
            NombreUsuario = dto.Usuario,
            Contrasena = dto.Contra,
            Mail = dto.Mail,
            Rol = dto.Rol
        };

        _db.Usuarios.Add(usuario);
        await _db.SaveChangesAsync();

        string? cuil = null;

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
                Genero = ""
            };
            _db.Pacientes.Add(paciente);
            await _db.SaveChangesAsync();
            _logger.LogInformation("Perfil de paciente generado automáticamente para usuario ID {UsuarioId} con CUIL {Cuil}", usuario.Id, cuil);
        }

        string token = GenerarJwt(usuario.Id, usuario.NombreUsuario, usuario.Rol, dto.Usuario, null, dto.Usuario);
        _logger.LogInformation("Usuario registrado con éxito. ID: {UsuarioId}", usuario.Id);

        return new UsuarioAutenticadoDto(usuario.Id, usuario.NombreUsuario, usuario.Mail, usuario.Rol, cuil, token);
    }

    public async Task<UsuarioAutenticadoDto> RegistrarPacienteAsync(RegistrarPacienteDto dto)
    {
        _logger.LogInformation("Iniciando registro de paciente: DNI {Dni}, Email {Email}", dto.Dni, dto.Email);

        var dniClean = dto.Dni.Trim();
        var emailClean = dto.Email.Trim().ToLower();

        if (await _db.Usuarios.AnyAsync(u => u.NombreUsuario == dniClean || u.Mail.ToLower() == emailClean))
        {
            _logger.LogWarning("El DNI o correo ya se encuentra registrado: {Dni}, {Email}", dniClean, emailClean);
            throw new ConflictException("El DNI o correo electrónico ya se encuentra registrado en el sistema.");
        }

        if (await _db.Pacientes.AnyAsync(p => p.Cuil == dniClean))
        {
            _logger.LogWarning("Ya existe un paciente con CUIL/DNI: {Dni}", dniClean);
            throw new ConflictException("Ya existe un paciente registrado con ese documento.");
        }

        var usuario = new Usuario
        {
            NombreUsuario = dniClean,
            Contrasena = dto.Contrasena,
            Mail = emailClean,
            Rol = RolUsuario.Paciente
        };

        _db.Usuarios.Add(usuario);
        await _db.SaveChangesAsync();

        var paciente = new Paciente
        {
            Cuil = dniClean,
            UsuarioId = usuario.Id,
            Nombre = dto.Nombre.Trim(),
            Apellido = dto.Apellido.Trim(),
            FechaNacimiento = DateTime.UtcNow,
            Telefono = string.Empty,
            Genero = string.Empty
        };

        _db.Pacientes.Add(paciente);

        if (dto.ObraSocialId.HasValue && dto.ObraSocialId.Value > 0)
        {
            var obraSocialExiste = await _db.ObrasSociales.AnyAsync(os => os.Id == dto.ObraSocialId.Value);
            if (obraSocialExiste)
            {
                _db.PacienteObrasSociales.Add(new PacienteObraSocial
                {
                    PacienteCuil = paciente.Cuil,
                    ObraSocialId = dto.ObraSocialId.Value
                });
            }
        }

        // Crear HistoriaClinica inicial para el nuevo paciente (RNF-SEG-06)
        _db.HistoriasClinicas.Add(new HistoriaClinica
        {
            PacienteCuil = paciente.Cuil
        });

        await _db.SaveChangesAsync();

        string nombreCompleto = $"{paciente.Nombre} {paciente.Apellido}".Trim();
        string token = GenerarJwt(usuario.Id, usuario.NombreUsuario, usuario.Rol, paciente.Nombre, paciente.Apellido, nombreCompleto);
        _logger.LogInformation("Paciente registrado con éxito. Usuario ID: {UsuarioId}, CUIL: {Cuil}", usuario.Id, paciente.Cuil);

        var obrasSociales = new List<string>();
        if (dto.ObraSocialId.HasValue)
        {
            var os = await _db.ObrasSociales.FindAsync(dto.ObraSocialId.Value);
            if (os != null) obrasSociales.Add(os.Nombre);
        }

        return new UsuarioAutenticadoDto(
            usuario.Id,
            usuario.NombreUsuario,
            usuario.Mail,
            usuario.Rol,
            paciente.Cuil,
            token,
            null,
            null,
            null,
            nombreCompleto,
            paciente.Nombre,
            paciente.Apellido,
            obrasSociales
        );
    }

    public async Task<UsuarioAutenticadoDto> IniciarSesionAsync(IniciarSesionDto dto)
    {
        _logger.LogInformation("Intento de inicio de sesión para el usuario: {Usuario}", dto.Usuario);

        var usuario = await _db.Usuarios
            .Include(u => u.Paciente).ThenInclude(p => p.ObrasSociales).ThenInclude(pos => pos.ObraSocial)
            .Include(u => u.Profesional)
            .Include(u => u.Asistente).ThenInclude(a => a.Consultorio)
            .Include(u => u.AdministradorInstitucion)
            .Include(u => u.AdministradorConsultorio).ThenInclude(ac => ac.Consultorio)
            .Include(u => u.Institucion)
            .FirstOrDefaultAsync(u =>
                (u.NombreUsuario == dto.Usuario ||
                 u.Mail == dto.Usuario ||
                 (u.AdministradorConsultorio != null && u.AdministradorConsultorio.Cuil == dto.Usuario) ||
                 (u.AdministradorInstitucion != null && u.AdministradorInstitucion.Cuil == dto.Usuario) ||
                 (u.Asistente != null && u.Asistente.Cuil == dto.Usuario) ||
                 (u.Profesional != null && u.Profesional.Cuil == dto.Usuario) ||
                 (u.Paciente != null && u.Paciente.Cuil == dto.Usuario) ||
                 (u.Institucion != null && u.Institucion.Cuit == dto.Usuario)) &&
                u.Contrasena == dto.Contra);

        if (usuario == null)
        {
            _logger.LogWarning("Inicio de sesión fallido para el usuario: {Usuario}", dto.Usuario);
            throw new NotAuthenticatedException("Credenciales inválidas.");
        }

        string? cuil = usuario.Rol switch
        {
            RolUsuario.Paciente => usuario.Paciente?.Cuil,
            RolUsuario.Profesional => usuario.Profesional?.Cuil,
            RolUsuario.Asistente => usuario.Asistente?.Cuil,
            RolUsuario.AdminInstitucion => usuario.AdministradorInstitucion?.Cuil,
            RolUsuario.AdminConsultorio => usuario.AdministradorConsultorio?.Cuil,
            RolUsuario.Institucion => usuario.Institucion?.Cuit,
            _ => null
        };

        string? consultorioCuit = usuario.Rol switch
        {
            RolUsuario.AdminConsultorio => usuario.AdministradorConsultorio?.ConsultorioCuit,
            RolUsuario.Asistente => usuario.Asistente?.ConsultorioCuit,
            _ => null
        };

        string? sedeNombre = usuario.Rol switch
        {
            RolUsuario.AdminConsultorio => usuario.AdministradorConsultorio?.Consultorio?.Nombre,
            RolUsuario.Asistente => usuario.Asistente?.Consultorio?.Nombre,
            _ => null
        };

        int? institucionId = usuario.Rol switch
        {
            RolUsuario.AdminInstitucion => usuario.AdministradorInstitucion?.InstitucionId,
            RolUsuario.Institucion => usuario.Institucion?.Id,
            RolUsuario.AdminConsultorio => usuario.AdministradorConsultorio?.Consultorio?.InstitucionId,
            RolUsuario.Asistente => usuario.Asistente?.InstitucionId ?? usuario.Asistente?.Consultorio?.InstitucionId,
            _ => null
        };

        string? nombreCompleto = usuario.Rol switch
        {
            RolUsuario.Paciente => usuario.Paciente != null ? $"{usuario.Paciente.Nombre} {usuario.Paciente.Apellido}".Trim() : null,
            RolUsuario.Profesional => usuario.Profesional != null ? $"Dr(a). {usuario.Profesional.Nombre} {usuario.Profesional.Apellido}".Trim() : null,
            RolUsuario.Asistente => usuario.Asistente != null ? $"{usuario.Asistente.Nombre} {usuario.Asistente.Apellido}".Trim() : null,
            RolUsuario.AdminConsultorio => usuario.AdministradorConsultorio != null ? $"{usuario.AdministradorConsultorio.Nombre} {usuario.AdministradorConsultorio.Apellido}".Trim() : null,
            RolUsuario.Institucion => usuario.Institucion?.Nombre,
            RolUsuario.SuperAdmin => "Super Administrador",
            _ => null
        };

        string? nombre = usuario.Rol switch
        {
            RolUsuario.Paciente => usuario.Paciente?.Nombre,
            RolUsuario.Profesional => usuario.Profesional?.Nombre,
            RolUsuario.Asistente => usuario.Asistente?.Nombre,
            RolUsuario.AdminConsultorio => usuario.AdministradorConsultorio?.Nombre,
            RolUsuario.Institucion => usuario.Institucion?.Nombre,
            RolUsuario.SuperAdmin => "Super Administrador",
            _ => null
        };

        string? apellido = usuario.Rol switch
        {
            RolUsuario.Paciente => usuario.Paciente?.Apellido,
            RolUsuario.Profesional => usuario.Profesional?.Apellido,
            RolUsuario.Asistente => usuario.Asistente?.Apellido,
            RolUsuario.AdminConsultorio => usuario.AdministradorConsultorio?.Apellido,
            _ => null
        };

        string token = GenerarJwt(usuario.Id, usuario.NombreUsuario, usuario.Rol, nombre, apellido, nombreCompleto);
        _logger.LogInformation("Inicio de sesión exitoso para usuario ID {UsuarioId}, Rol: {Rol}", usuario.Id, usuario.Rol);

        List<string>? obrasSocialesList = usuario.Rol switch
        {
            RolUsuario.Paciente => usuario.Paciente?.ObrasSociales?
                .Select(pos => pos.ObraSocial?.Nombre ?? "")
                .Where(s => !string.IsNullOrEmpty(s))
                .ToList(),
            _ => null
        };

        return new UsuarioAutenticadoDto(
            usuario.Id,
            usuario.NombreUsuario,
            usuario.Mail,
            usuario.Rol,
            cuil,
            token,
            consultorioCuit,
            institucionId,
            sedeNombre,
            nombreCompleto,
            nombre,
            apellido,
            obrasSocialesList
        );
    }

    private static string GenerarJwt(int userId, string username, RolUsuario rol, string? nombre, string? apellido, string? nombreCompleto)
    {
        var headerJson = "{\"alg\":\"HS256\",\"typ\":\"JWT\"}";
        var header = Convert.ToBase64String(System.Text.Encoding.UTF8.GetBytes(headerJson))
            .TrimEnd('=').Replace('+', '-').Replace('/', '_');

        var payloadObj = new Dictionary<string, object?>
        {
            { "sub", userId.ToString() },
            { "unique_name", username },
            { "rol", rol.ToString() },
            { "nombre", nombre },
            { "apellido", apellido },
            { "nombreCompleto", nombreCompleto ?? $"{nombre} {apellido}".Trim() },
            { "given_name", nombre },
            { "family_name", apellido },
            { "name", nombreCompleto ?? $"{nombre} {apellido}".Trim() },
            { "iat", DateTimeOffset.UtcNow.ToUnixTimeSeconds() },
            { "exp", DateTimeOffset.UtcNow.AddDays(7).ToUnixTimeSeconds() }
        };
        var payloadJson = System.Text.Json.JsonSerializer.Serialize(payloadObj);
        var payload = Convert.ToBase64String(System.Text.Encoding.UTF8.GetBytes(payloadJson))
            .TrimEnd('=').Replace('+', '-').Replace('/', '_');

        var signature = "JWT-TOKEN-" + Convert.ToBase64String(System.Text.Encoding.UTF8.GetBytes("tempuscare-sig"))
            .TrimEnd('=').Replace('+', '-').Replace('/', '_');

        return $"{header}.{payload}.{signature}";
    }
}
