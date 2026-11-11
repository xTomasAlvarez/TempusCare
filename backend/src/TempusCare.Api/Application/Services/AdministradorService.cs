using Microsoft.EntityFrameworkCore;
using TempusCare.Api.Application.DTOs;
using TempusCare.Api.Application.Exceptions;
using TempusCare.Api.Domain.Entities;
using TempusCare.Api.Domain.Enums;
using TempusCare.Api.Infrastructure.Data;

namespace TempusCare.Api.Application.Services;

public class AdministradorService : IAdministradorService
{
    private readonly TempusCareDbContext _db;
    private readonly ILogger<AdministradorService> _logger;

    public AdministradorService(TempusCareDbContext db, ILogger<AdministradorService> logger)
    {
        _db = db;
        _logger = logger;
    }

    public async Task<AdminInstitucionResponseDto> AltaAdminInstitucionAsync(AltaAdminInstitucionDto dto)
    {
        _logger.LogInformation("Creando Administrador de Institución con CUIL {Cuil} para Institución ID {InstId}", dto.Cuil, dto.InstitucionId);

        var inst = await _db.Instituciones.FirstOrDefaultAsync(i => i.Id == dto.InstitucionId);
        if (inst == null)
        {
            _logger.LogWarning("Institución ID {InstId} no encontrada", dto.InstitucionId);
            throw new InstitucionNotFoundException(dto.InstitucionId);
        }

        if (await _db.AdministradoresInstitucion.AnyAsync(a => a.Cuil == dto.Cuil))
        {
            _logger.LogWarning("Ya existe un administrador con CUIL {Cuil}", dto.Cuil);
            throw new ConflictException($"Ya existe un administrador con CUIL {dto.Cuil}.");
        }

        if (await _db.Usuarios.AnyAsync(u => u.NombreUsuario == dto.NombreUsuario || u.Mail == dto.Mail))
        {
            _logger.LogWarning("Usuario o mail ya registrado: {Usuario}, {Mail}", dto.NombreUsuario, dto.Mail);
            throw new ConflictException("El nombre de usuario o mail ya se encuentra en uso.");
        }

        var usuario = new Usuario
        {
            NombreUsuario = dto.NombreUsuario,
            Contrasena = dto.Contrasena,
            Mail = dto.Mail,
            Rol = RolUsuario.AdminInstitucion
        };
        _db.Usuarios.Add(usuario);
        await _db.SaveChangesAsync();

        var admin = new AdministradorInstitucion
        {
            Cuil = dto.Cuil,
            Nombre = dto.Nombre,
            Apellido = dto.Apellido,
            Telefono = dto.Telefono,
            FechaNacimiento = dto.FechaNacimiento,
            InstitucionId = dto.InstitucionId,
            UsuarioId = usuario.Id
        };
        _db.AdministradoresInstitucion.Add(admin);
        await _db.SaveChangesAsync();

        _logger.LogInformation("Administrador de Institución creado con éxito. CUIL {Cuil}", admin.Cuil);

        return new AdminInstitucionResponseDto(
            admin.Cuil,
            admin.Nombre,
            admin.Apellido,
            admin.Telefono,
            admin.FechaNacimiento,
            admin.InstitucionId,
            inst.Nombre,
            usuario.Id,
            usuario.NombreUsuario,
            usuario.Mail
        );
    }

    public async Task<List<AdminInstitucionResponseDto>> ObtenerAdminsInstitucionAsync(int? institucionId)
    {
        var query = _db.AdministradoresInstitucion
            .Include(a => a.Institucion)
            .Include(a => a.Usuario)
            .AsQueryable();

        if (institucionId.HasValue)
        {
            query = query.Where(a => a.InstitucionId == institucionId.Value);
        }

        var lista = await query.ToListAsync();

        return lista.Select(a => new AdminInstitucionResponseDto(
            a.Cuil,
            a.Nombre,
            a.Apellido,
            a.Telefono,
            a.FechaNacimiento,
            a.InstitucionId,
            a.Institucion?.Nombre ?? string.Empty,
            a.UsuarioId,
            a.Usuario?.NombreUsuario ?? string.Empty,
            a.Usuario?.Mail ?? string.Empty
        )).ToList();
    }

    public async Task<AdminInstitucionResponseDto> ObtenerAdminInstitucionPorCuilAsync(string cuil)
    {
        var a = await _db.AdministradoresInstitucion
            .Include(admin => admin.Institucion)
            .Include(admin => admin.Usuario)
            .FirstOrDefaultAsync(admin => admin.Cuil == cuil);

        if (a == null)
            throw new NotFoundException($"Administrador de institución con CUIL {cuil} no encontrado.");

        return new AdminInstitucionResponseDto(
            a.Cuil,
            a.Nombre,
            a.Apellido,
            a.Telefono,
            a.FechaNacimiento,
            a.InstitucionId,
            a.Institucion?.Nombre ?? string.Empty,
            a.UsuarioId,
            a.Usuario?.NombreUsuario ?? string.Empty,
            a.Usuario?.Mail ?? string.Empty
        );
    }

    public async Task<AdminConsultorioResponseDto> AltaAdminConsultorioAsync(AltaAdminConsultorioDto dto)
    {
        _logger.LogInformation("Creando Administrador de Consultorio con CUIL {Cuil} para Consultorio CUIT {Cuit}", dto.Cuil, dto.ConsultorioCuit);

        var cons = await _db.Consultorios.FirstOrDefaultAsync(c => c.Cuit == dto.ConsultorioCuit);
        if (cons == null)
        {
            _logger.LogWarning("Consultorio CUIT {Cuit} no encontrado", dto.ConsultorioCuit);
            throw new ConsultorioNotFoundException(dto.ConsultorioCuit);
        }

        if (await _db.AdministradoresConsultorio.AnyAsync(a => a.Cuil == dto.Cuil))
        {
            _logger.LogWarning("Ya existe un administrador con CUIL {Cuil}", dto.Cuil);
            throw new ConflictException($"Ya existe un administrador con CUIL {dto.Cuil}.");
        }

        if (await _db.Usuarios.AnyAsync(u => u.NombreUsuario == dto.NombreUsuario || u.Mail == dto.Mail))
        {
            _logger.LogWarning("Usuario o mail ya registrado: {Usuario}, {Mail}", dto.NombreUsuario, dto.Mail);
            throw new ConflictException("El nombre de usuario o mail ya se encuentra en uso.");
        }

        var usuario = new Usuario
        {
            NombreUsuario = dto.NombreUsuario,
            Contrasena = dto.Contrasena,
            Mail = dto.Mail,
            Rol = RolUsuario.AdminConsultorio
        };
        _db.Usuarios.Add(usuario);
        await _db.SaveChangesAsync();

        var admin = new AdministradorConsultorio
        {
            Cuil = dto.Cuil,
            Nombre = dto.Nombre,
            Apellido = dto.Apellido,
            Telefono = dto.Telefono,
            FechaNacimiento = dto.FechaNacimiento,
            ConsultorioCuit = dto.ConsultorioCuit,
            UsuarioId = usuario.Id
        };
        _db.AdministradoresConsultorio.Add(admin);
        await _db.SaveChangesAsync();

        _logger.LogInformation("Administrador de Consultorio creado con éxito. CUIL {Cuil}", admin.Cuil);

        return new AdminConsultorioResponseDto(
            admin.Cuil,
            admin.Nombre,
            admin.Apellido,
            admin.Telefono,
            admin.FechaNacimiento,
            admin.ConsultorioCuit,
            cons.Nombre,
            usuario.Id,
            usuario.NombreUsuario,
            usuario.Mail
        );
    }

    public async Task<List<AdminConsultorioResponseDto>> ObtenerAdminsConsultorioAsync(string? consultorioCuit)
    {
        var query = _db.AdministradoresConsultorio
            .Include(a => a.Consultorio)
            .Include(a => a.Usuario)
            .AsQueryable();

        if (!string.IsNullOrEmpty(consultorioCuit))
        {
            query = query.Where(a => a.ConsultorioCuit == consultorioCuit);
        }

        var lista = await query.ToListAsync();

        return lista.Select(a => new AdminConsultorioResponseDto(
            a.Cuil,
            a.Nombre,
            a.Apellido,
            a.Telefono,
            a.FechaNacimiento,
            a.ConsultorioCuit,
            a.Consultorio?.Nombre ?? string.Empty,
            a.UsuarioId,
            a.Usuario?.NombreUsuario ?? string.Empty,
            a.Usuario?.Mail ?? string.Empty
        )).ToList();
    }

    public async Task<AdminConsultorioResponseDto> ObtenerAdminConsultorioPorCuilAsync(string cuil)
    {
        var a = await _db.AdministradoresConsultorio
            .Include(admin => admin.Consultorio)
            .Include(admin => admin.Usuario)
            .FirstOrDefaultAsync(admin => admin.Cuil == cuil);

        if (a == null)
            throw new NotFoundException($"Administrador de consultorio con CUIL {cuil} no encontrado.");

        return new AdminConsultorioResponseDto(
            a.Cuil,
            a.Nombre,
            a.Apellido,
            a.Telefono,
            a.FechaNacimiento,
            a.ConsultorioCuit,
            a.Consultorio?.Nombre ?? string.Empty,
            a.UsuarioId,
            a.Usuario?.NombreUsuario ?? string.Empty,
            a.Usuario?.Mail ?? string.Empty
        );
    }
}
