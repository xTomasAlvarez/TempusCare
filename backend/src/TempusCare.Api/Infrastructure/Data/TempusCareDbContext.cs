using Microsoft.EntityFrameworkCore;
using TempusCare.Api.Domain.Entities;

namespace TempusCare.Api.Infrastructure.Data;

public class TempusCareDbContext : DbContext
{
    public TempusCareDbContext(DbContextOptions<TempusCareDbContext> options) : base(options) { }

    public DbSet<Usuario> Usuarios => Set<Usuario>();
    public DbSet<Paciente> Pacientes => Set<Paciente>();
    public DbSet<Profesional> Profesionales => Set<Profesional>();
    public DbSet<Consultorio> Consultorios => Set<Consultorio>();
    public DbSet<Especialidad> Especialidades => Set<Especialidad>();
    public DbSet<ObraSocial> ObrasSociales => Set<ObraSocial>();
    public DbSet<Agenda> Agendas => Set<Agenda>();
    public DbSet<Turno> Turnos => Set<Turno>();
    public DbSet<Cita> Citas => Set<Cita>();
    public DbSet<Observacion> Observaciones => Set<Observacion>();
    public DbSet<Cuestionario> Cuestionarios => Set<Cuestionario>();
    public DbSet<HistoriaClinica> HistoriasClinicas => Set<HistoriaClinica>();
    public DbSet<Receta> Recetas => Set<Receta>();
    public DbSet<Direccion> Direcciones => Set<Direccion>();

    public DbSet<ProfesionalConsultorio> ProfesionalConsultorios => Set<ProfesionalConsultorio>();
    public DbSet<ProfesionalEspecialidad> ProfesionalEspecialidades => Set<ProfesionalEspecialidad>();
    public DbSet<ProfesionalObraSocial> ProfesionalObrasSociales => Set<ProfesionalObraSocial>();
    public DbSet<PacienteObraSocial> PacienteObrasSociales => Set<PacienteObraSocial>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        // Paciente primary key: Cuil
        modelBuilder.Entity<Paciente>()
            .HasKey(p => p.Cuil);

        modelBuilder.Entity<Paciente>()
            .HasOne(p => p.Usuario)
            .WithOne(u => u.Paciente)
            .HasForeignKey<Paciente>(p => p.UsuarioId)
            .OnDelete(DeleteBehavior.Cascade);

        // Profesional primary key: Cuil
        modelBuilder.Entity<Profesional>()
            .HasKey(pr => pr.Cuil);

        modelBuilder.Entity<Profesional>()
            .HasOne(pr => pr.Usuario)
            .WithOne(u => u.Profesional)
            .HasForeignKey<Profesional>(pr => pr.UsuarioId)
            .OnDelete(DeleteBehavior.Cascade);

        // Consultorio primary key: Cuit
        modelBuilder.Entity<Consultorio>()
            .HasKey(c => c.Cuit);

        // Historia Clinica 1:1 Paciente
        modelBuilder.Entity<HistoriaClinica>()
            .HasOne(hc => hc.Paciente)
            .WithOne(p => p.HistoriaClinica)
            .HasForeignKey<HistoriaClinica>(hc => hc.PacienteCuil)
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

        // Turno <-> Cita (1:0..1)
        modelBuilder.Entity<Cita>()
            .HasOne(c => c.Turno)
            .WithOne(t => t.Cita)
            .HasForeignKey<Cita>(c => c.TurnoId)
            .OnDelete(DeleteBehavior.Restrict);

        // Cita <-> Observacion (1:0..1)
        modelBuilder.Entity<Observacion>()
            .HasOne(o => o.Cita)
            .WithOne(c => c.Observacion)
            .HasForeignKey<Observacion>(o => o.CitaId)
            .OnDelete(DeleteBehavior.Cascade);

        // Cita <-> Cuestionario (1:0..1)
        modelBuilder.Entity<Cuestionario>()
            .HasOne(cu => cu.Cita)
            .WithOne(c => c.Cuestionario)
            .HasForeignKey<Cuestionario>(cu => cu.CitaId)
            .OnDelete(DeleteBehavior.Cascade);
    }
}
