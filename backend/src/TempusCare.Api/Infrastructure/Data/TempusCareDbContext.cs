using Microsoft.EntityFrameworkCore;
using TempusCare.Api.Domain.Entities;

namespace TempusCare.Api.Infrastructure.Data;

public class TempusCareDbContext : DbContext
{
    public TempusCareDbContext(DbContextOptions<TempusCareDbContext> options) : base(options) { }

    public DbSet<Usuario> Usuarios => Set<Usuario>();
    public DbSet<Asistente> Asistentes => Set<Asistente>();
    public DbSet<Paciente> Pacientes => Set<Paciente>();
    public DbSet<Profesional> Profesionales => Set<Profesional>();
    public DbSet<Institucion> Instituciones => Set<Institucion>();
    public DbSet<Consultorio> Consultorios => Set<Consultorio>();
    public DbSet<Direccion> Direcciones => Set<Direccion>();
    public DbSet<Especialidad> Especialidades => Set<Especialidad>();
    public DbSet<Estudio> Estudios => Set<Estudio>();
    public DbSet<ProfesionalEstudio> ProfesionalEstudios => Set<ProfesionalEstudio>();
    public DbSet<Cobertura> Coberturas => Set<Cobertura>();
    public DbSet<ObraSocial> ObrasSociales => Set<ObraSocial>();
    public DbSet<Agenda> Agendas => Set<Agenda>();
    public DbSet<Turno> Turnos => Set<Turno>();
    public DbSet<Cita> Citas => Set<Cita>();
    public DbSet<Observacion> Observaciones => Set<Observacion>();
    public DbSet<Cuestionario> Cuestionarios => Set<Cuestionario>();
    public DbSet<HistoriaClinica> HistoriasClinicas => Set<HistoriaClinica>();
    public DbSet<Receta> Recetas => Set<Receta>();

    public DbSet<ProfesionalConsultorio> ProfesionalConsultorios => Set<ProfesionalConsultorio>();
    public DbSet<ProfesionalEspecialidad> ProfesionalEspecialidades => Set<ProfesionalEspecialidad>();
    public DbSet<ProfesionalObraSocial> ProfesionalObrasSociales => Set<ProfesionalObraSocial>();
    public DbSet<PacienteObraSocial> PacienteObrasSociales => Set<PacienteObraSocial>();
    public DbSet<AsistenteAgenda> AsistenteAgendas => Set<AsistenteAgenda>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        // Asistente primary key: Cuil
        modelBuilder.Entity<Asistente>()
            .HasKey(a => a.Cuil);

        modelBuilder.Entity<Asistente>()
            .HasOne(a => a.Usuario)
            .WithOne(u => u.Asistente)
            .HasForeignKey<Asistente>(a => a.UsuarioId)
            .OnDelete(DeleteBehavior.Cascade);

        modelBuilder.Entity<Asistente>()
            .HasOne(a => a.Direccion)
            .WithMany()
            .HasForeignKey(a => a.DireccionId)
            .OnDelete(DeleteBehavior.SetNull);

        modelBuilder.Entity<Asistente>()
            .HasOne(a => a.Institucion)
            .WithMany(i => i.Asistentes)
            .HasForeignKey(a => a.InstitucionId)
            .OnDelete(DeleteBehavior.SetNull);

        // Paciente primary key: Cuil
        modelBuilder.Entity<Paciente>()
            .HasKey(p => p.Cuil);

        modelBuilder.Entity<Paciente>()
            .HasOne(p => p.Usuario)
            .WithOne(u => u.Paciente)
            .HasForeignKey<Paciente>(p => p.UsuarioId)
            .OnDelete(DeleteBehavior.Cascade);

        modelBuilder.Entity<Paciente>()
            .HasOne(p => p.Direccion)
            .WithMany()
            .HasForeignKey(p => p.DireccionId)
            .OnDelete(DeleteBehavior.SetNull);

        // Profesional primary key: Cuil
        modelBuilder.Entity<Profesional>()
            .HasKey(pr => pr.Cuil);

        modelBuilder.Entity<Profesional>()
            .HasOne(pr => pr.Usuario)
            .WithOne(u => u.Profesional)
            .HasForeignKey<Profesional>(pr => pr.UsuarioId)
            .OnDelete(DeleteBehavior.Cascade);

        modelBuilder.Entity<Profesional>()
            .HasOne(pr => pr.Direccion)
            .WithMany()
            .HasForeignKey(pr => pr.DireccionId)
            .OnDelete(DeleteBehavior.SetNull);

        // Puntuacion no se mapea en BD
        modelBuilder.Entity<Profesional>()
            .Ignore(pr => pr.Puntuacion);

        // Institucion primary key: Id
        modelBuilder.Entity<Institucion>()
            .HasKey(i => i.Id);

        modelBuilder.Entity<Institucion>()
            .HasOne(i => i.Usuario)
            .WithOne(u => u.Institucion)
            .HasForeignKey<Institucion>(i => i.UsuarioId)
            .OnDelete(DeleteBehavior.Cascade);

        modelBuilder.Entity<Institucion>()
            .HasMany(i => i.Consultorios)
            .WithOne(c => c.Institucion)
            .HasForeignKey(c => c.InstitucionId)
            .OnDelete(DeleteBehavior.SetNull);

        // Consultorio primary key: Cuit
        modelBuilder.Entity<Consultorio>()
            .HasKey(c => c.Cuit);

        modelBuilder.Entity<Consultorio>()
            .HasOne(c => c.Direccion)
            .WithMany()
            .HasForeignKey(c => c.DireccionId)
            .OnDelete(DeleteBehavior.SetNull);

        // Historia Clinica 1:1 Paciente
        modelBuilder.Entity<HistoriaClinica>()
            .HasOne(hc => hc.Paciente)
            .WithOne(p => p.HistoriaClinica)
            .HasForeignKey<HistoriaClinica>(hc => hc.PacienteCuil)
            .OnDelete(DeleteBehavior.Cascade);

        // Historia Clinica 1:N Observaciones
        modelBuilder.Entity<HistoriaClinica>()
            .HasMany(hc => hc.Observaciones)
            .WithOne(o => o.HistoriaClinica)
            .HasForeignKey(o => o.HistoriaClinicaId)
            .OnDelete(DeleteBehavior.Cascade);

        // Profesional 1:N Observaciones
        modelBuilder.Entity<Observacion>()
            .HasOne(o => o.Profesional)
            .WithMany(p => p.Observaciones)
            .HasForeignKey(o => o.ProfesionalCuil)
            .OnDelete(DeleteBehavior.SetNull);

        // Cita 1:0..1 Observacion
        modelBuilder.Entity<Observacion>()
            .HasOne(o => o.Cita)
            .WithOne(c => c.Observacion)
            .HasForeignKey<Observacion>(o => o.CitaId)
            .OnDelete(DeleteBehavior.Cascade);

        // Cita 1:0..1 Cuestionario
        modelBuilder.Entity<Cuestionario>()
            .HasOne(cu => cu.Cita)
            .WithOne(c => c.Cuestionario)
            .HasForeignKey<Cuestionario>(cu => cu.CitaId)
            .OnDelete(DeleteBehavior.Cascade);

        // Turno <-> Cita (1:0..1)
        modelBuilder.Entity<Cita>()
            .HasOne(c => c.Turno)
            .WithOne(t => t.Cita)
            .HasForeignKey<Cita>(c => c.TurnoId)
            .OnDelete(DeleteBehavior.Restrict);

        // Estudio <-> ProfesionalEstudio (1:N)
        modelBuilder.Entity<ProfesionalEstudio>()
            .HasKey(pe => pe.Id);

        modelBuilder.Entity<ProfesionalEstudio>()
            .HasOne(pe => pe.Profesional)
            .WithMany(p => p.Estudios)
            .HasForeignKey(pe => pe.ProfesionalCuil)
            .OnDelete(DeleteBehavior.Cascade);

        modelBuilder.Entity<ProfesionalEstudio>()
            .HasOne(pe => pe.Estudio)
            .WithMany(e => e.ProfesionalEstudios)
            .HasForeignKey(pe => pe.EstudioId)
            .OnDelete(DeleteBehavior.Cascade);

        // Cobertura (Relación Ternaria ProfesionalEstudio <-> ObraSocial)
        modelBuilder.Entity<Cobertura>()
            .HasKey(cob => cob.Id);

        modelBuilder.Entity<Cobertura>()
            .HasOne(cob => cob.ProfesionalEstudio)
            .WithMany(pe => pe.Coberturas)
            .HasForeignKey(cob => cob.ProfesionalEstudioId)
            .OnDelete(DeleteBehavior.Cascade);

        modelBuilder.Entity<Cobertura>()
            .HasOne(cob => cob.ObraSocial)
            .WithMany(os => os.Coberturas)
            .HasForeignKey(cob => cob.ObraSocialId)
            .OnDelete(DeleteBehavior.Cascade);

        // Junction: Profesional <-> Consultorio
        modelBuilder.Entity<ProfesionalConsultorio>()
            .HasKey(pc => new { pc.ProfesionalCuil, pc.ConsultorioCuit });

        modelBuilder.Entity<ProfesionalConsultorio>()
            .HasOne(pc => pc.Profesional)
            .WithMany(p => p.Consultorios)
            .HasForeignKey(pc => pc.ProfesionalCuil);

        modelBuilder.Entity<ProfesionalConsultorio>()
            .HasOne(pc => pc.Consultorio)
            .WithMany(c => c.Profesionales)
            .HasForeignKey(pc => pc.ConsultorioCuit);

        // Junction: Profesional <-> Especialidad
        modelBuilder.Entity<ProfesionalEspecialidad>()
            .HasKey(pe => new { pe.ProfesionalCuil, pe.EspecialidadId });

        modelBuilder.Entity<ProfesionalEspecialidad>()
            .HasOne(pe => pe.Profesional)
            .WithMany(p => p.Especialidades)
            .HasForeignKey(pe => pe.ProfesionalCuil);

        modelBuilder.Entity<ProfesionalEspecialidad>()
            .HasOne(pe => pe.Especialidad)
            .WithMany(e => e.Profesionales)
            .HasForeignKey(pe => pe.EspecialidadId);

        // Junction: Profesional <-> ObraSocial
        modelBuilder.Entity<ProfesionalObraSocial>()
            .HasKey(po => new { po.ProfesionalCuil, po.ObraSocialId });

        modelBuilder.Entity<ProfesionalObraSocial>()
            .HasOne(po => po.Profesional)
            .WithMany(p => p.ObrasSociales)
            .HasForeignKey(po => po.ProfesionalCuil);

        modelBuilder.Entity<ProfesionalObraSocial>()
            .HasOne(po => po.ObraSocial)
            .WithMany(o => o.Profesionales)
            .HasForeignKey(po => po.ObraSocialId);

        // Junction: Paciente <-> ObraSocial
        modelBuilder.Entity<PacienteObraSocial>()
            .HasKey(pao => new { pao.PacienteCuil, pao.ObraSocialId });

        modelBuilder.Entity<PacienteObraSocial>()
            .HasOne(pao => pao.Paciente)
            .WithMany(p => p.ObrasSociales)
            .HasForeignKey(pao => pao.PacienteCuil);

        modelBuilder.Entity<PacienteObraSocial>()
            .HasOne(pao => pao.ObraSocial)
            .WithMany(o => o.Pacientes)
            .HasForeignKey(pao => pao.ObraSocialId);

        // Junction: Asistente <-> Agenda
        modelBuilder.Entity<AsistenteAgenda>()
            .HasKey(aa => new { aa.AsistenteCuil, aa.AgendaId });

        modelBuilder.Entity<AsistenteAgenda>()
            .HasOne(aa => aa.Asistente)
            .WithMany(a => a.AgendasAsignadas)
            .HasForeignKey(aa => aa.AsistenteCuil)
            .OnDelete(DeleteBehavior.Cascade);

        modelBuilder.Entity<AsistenteAgenda>()
            .HasOne(aa => aa.Agenda)
            .WithMany(a => a.AsistentesAsignados)
            .HasForeignKey(aa => aa.AgendaId)
            .OnDelete(DeleteBehavior.Cascade);
    }
}
