using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging.Abstractions;
using TempusCare.Api.Application.DTOs;
using TempusCare.Api.Application.Exceptions;
using TempusCare.Api.Application.Services;
using TempusCare.Api.Domain.Entities;
using TempusCare.Api.Domain.Enums;
using TempusCare.Api.Infrastructure.Data;
using Xunit;

namespace TempusCare.Tests;

public class BusinessRulesTests
{
    private TempusCareDbContext GetInMemoryDbContext(string dbName)
    {
        var options = new DbContextOptionsBuilder<TempusCareDbContext>()
            .UseInMemoryDatabase(dbName)
            .Options;
        return new TempusCareDbContext(options);
    }

    [Fact]
    public async Task RN01_AgendaOverlapping_ShouldThrowConflictException()
    {
        // Arrange
        var db = GetInMemoryDbContext(nameof(RN01_AgendaOverlapping_ShouldThrowConflictException));
        var agendaService = new AgendaService(db, NullLogger<AgendaService>.Instance);

        db.Profesionales.Add(new Profesional { Cuil = "20123456789", Nombre = "Carlos", Apellido = "Pérez", Matricula = "MP123" });
        db.Consultorios.Add(new Consultorio { Cuit = "30999999999", Nombre = "Consultorio Central" });
        await db.SaveChangesAsync();

        var dto1 = new AltaAgendaDto("20123456789", "30999999999", 15, 8, 2026, new TimeSpan(9, 0, 0), new TimeSpan(12, 0, 0));
        await agendaService.AltaAgendaAsync(dto1);

        // Act & Assert (Solapamiento parcial)
        var dtoOverlapping = new AltaAgendaDto("20123456789", "30999999999", 15, 8, 2026, new TimeSpan(11, 0, 0), new TimeSpan(13, 0, 0));
        await Assert.ThrowsAsync<ConflictException>(() => agendaService.AltaAgendaAsync(dtoOverlapping));
    }

    [Fact]
    public async Task RN02_DoubleBookingTurno_ShouldThrowConflictException()
    {
        // Arrange
        var db = GetInMemoryDbContext(nameof(RN02_DoubleBookingTurno_ShouldThrowConflictException));
        var agendaService = new AgendaService(db, NullLogger<AgendaService>.Instance);
        var turnoService = new TurnoService(db, NullLogger<TurnoService>.Instance);
        var citaService = new CitaService(db, NullLogger<CitaService>.Instance);

        db.Profesionales.Add(new Profesional { Cuil = "20111111111", Nombre = "Ana", Apellido = "Gómez", Matricula = "MP456" });
        db.Consultorios.Add(new Consultorio { Cuit = "30888888888", Nombre = "Clínica Norte" });
        db.Pacientes.Add(new Paciente { Cuil = "27222222222", Nombre = "Juan", Apellido = "López" });
        db.Pacientes.Add(new Paciente { Cuil = "27333333333", Nombre = "Maria", Apellido = "Sosa" });
        await db.SaveChangesAsync();

        var agendaDto = new AltaAgendaDto("20111111111", "30888888888", 20, 8, 2026, new TimeSpan(8, 0, 0), new TimeSpan(9, 0, 0), 30);
        await agendaService.AltaAgendaAsync(agendaDto);

        var turnos = await turnoService.ObtenerTurnosDisponiblesAsync("20111111111", new DateTime(2026, 8, 20));
        int primerTurnoId = turnos.First().Id;

        // Primer reserva
        var cita1 = await citaService.AltaCitaAsync(new AltaCitaDto("27222222222", "20111111111", primerTurnoId, TipoCita.Consulta, null, null));
        Assert.NotNull(cita1);

        // Intento de segunda reserva en el mismo turno
        await Assert.ThrowsAsync<ConflictException>(() =>
            citaService.AltaCitaAsync(new AltaCitaDto("27333333333", "20111111111", primerTurnoId, TipoCita.Consulta, null, null)));
    }

    [Fact]
    public async Task RN04_ObraSocialCoverageValidation_ShouldSetCoverageCorrectly()
    {
        // Arrange
        var db = GetInMemoryDbContext(nameof(RN04_ObraSocialCoverageValidation_ShouldSetCoverageCorrectly));
        var agendaService = new AgendaService(db, NullLogger<AgendaService>.Instance);
        var turnoService = new TurnoService(db, NullLogger<TurnoService>.Instance);
        var citaService = new CitaService(db, NullLogger<CitaService>.Instance);

        var obraSocialAceptada = new ObraSocial { Id = 1, Nombre = "OSDE" };
        var obraSocialNoAceptada = new ObraSocial { Id = 2, Nombre = "Subsidio de Salud" };
        db.ObrasSociales.AddRange(obraSocialAceptada, obraSocialNoAceptada);

        var prof = new Profesional { Cuil = "20444444444", Nombre = "Elena", Apellido = "Torres", Matricula = "MP789" };
        prof.ObrasSociales.Add(new ProfesionalObraSocial { ProfesionalCuil = prof.Cuil, ObraSocialId = 1 });
        db.Profesionales.Add(prof);

        db.Consultorios.Add(new Consultorio { Cuit = "30777777777", Nombre = "Consultorio Sur" });
        db.Pacientes.Add(new Paciente { Cuil = "27555555555", Nombre = "Pedro", Apellido = "Rios" });
        await db.SaveChangesAsync();

        await agendaService.AltaAgendaAsync(new AltaAgendaDto("20444444444", "30777777777", 22, 8, 2026, new TimeSpan(10, 0, 0), new TimeSpan(11, 0, 0), 30));
        var turnos = await turnoService.ObtenerTurnosDisponiblesAsync("20444444444", new DateTime(2026, 8, 22));

        // Reserva con obra social aceptada
        var cita1 = await citaService.AltaCitaAsync(new AltaCitaDto("27555555555", "20444444444", turnos[0].Id, TipoCita.Consulta, 1, null));
        Assert.Equal(CoberturaCita.ObraSocial, cita1.Cobertura);

        // Reserva con obra social NO aceptada por el médico (pasa a Particular sin bloquear)
        var cita2 = await citaService.AltaCitaAsync(new AltaCitaDto("27555555555", "20444444444", turnos[1].Id, TipoCita.Consulta, 2, null));
        Assert.Equal(CoberturaCita.Particular, cita2.Cobertura);
    }

    [Fact]
    public async Task CancelarCita_ShouldRevertTurnoToDisponible()
    {
        // Arrange
        var db = GetInMemoryDbContext(nameof(CancelarCita_ShouldRevertTurnoToDisponible));
        var agendaService = new AgendaService(db, NullLogger<AgendaService>.Instance);
        var turnoService = new TurnoService(db, NullLogger<TurnoService>.Instance);
        var citaService = new CitaService(db, NullLogger<CitaService>.Instance);

        db.Profesionales.Add(new Profesional { Cuil = "20666666666", Nombre = "Marcos", Apellido = "Vazquez", Matricula = "MP101" });
        db.Consultorios.Add(new Consultorio { Cuit = "30666666666", Nombre = "Centro Medico" });
        db.Pacientes.Add(new Paciente { Cuil = "27666666666", Nombre = "Sofia", Apellido = "Diaz" });
        await db.SaveChangesAsync();

        await agendaService.AltaAgendaAsync(new AltaAgendaDto("20666666666", "30666666666", 25, 8, 2026, new TimeSpan(14, 0, 0), new TimeSpan(15, 0, 0), 30));
        var turnosDisponibles = await turnoService.ObtenerTurnosDisponiblesAsync("20666666666", new DateTime(2026, 8, 25));

        var cita = await citaService.AltaCitaAsync(new AltaCitaDto("27666666666", "20666666666", turnosDisponibles[0].Id, TipoCita.Consulta, null, null));
        Assert.Single(await turnoService.ObtenerTurnosDisponiblesAsync("20666666666", new DateTime(2026, 8, 25)));

        // Cancelar Cita
        await citaService.BajaCitaAsync(cita.Id);

        // El turno debe haber vuelto a estar disponible
        var turnosNuevamenteDisponibles = await turnoService.ObtenerTurnosDisponiblesAsync("20666666666", new DateTime(2026, 8, 25));
        Assert.Equal(2, turnosNuevamenteDisponibles.Count);
    }

    [Fact]
    public async Task CancelarTurnoPorMedico_ShouldAutomaticallyCancelAssociatedCita()
    {
        // Arrange
        var db = GetInMemoryDbContext(nameof(CancelarTurnoPorMedico_ShouldAutomaticallyCancelAssociatedCita));
        var agendaService = new AgendaService(db, NullLogger<AgendaService>.Instance);
        var turnoService = new TurnoService(db, NullLogger<TurnoService>.Instance);
        var citaService = new CitaService(db, NullLogger<CitaService>.Instance);

        db.Profesionales.Add(new Profesional { Cuil = "20777777777", Nombre = "Hugo", Apellido = "Mendoza", Matricula = "MP202" });
        db.Consultorios.Add(new Consultorio { Cuit = "30555555555", Nombre = "Sanatorio Tucuman" });
        db.Pacientes.Add(new Paciente { Cuil = "27777777777", Nombre = "Lucia", Apellido = "Roldan" });
        await db.SaveChangesAsync();

        await agendaService.AltaAgendaAsync(new AltaAgendaDto("20777777777", "30555555555", 28, 8, 2026, new TimeSpan(16, 0, 0), new TimeSpan(17, 0, 0), 30));
        var turnos = await turnoService.ObtenerTurnosDisponiblesAsync("20777777777", new DateTime(2026, 8, 28));

        var cita = await citaService.AltaCitaAsync(new AltaCitaDto("27777777777", "20777777777", turnos[0].Id, TipoCita.Consulta, null, null));

        // El médico cancela el turno por fuerza mayor
        await turnoService.ModificarTurnoAsync(turnos[0].Id, "Cancelado por emergencia médica", EstadoTurno.Cancelado);

        var citaActualizada = (await citaService.ObtenerCitasPacienteAsync("27777777777")).First(c => c.Id == cita.Id);
        Assert.Equal(EstadoCita.Cancelada, citaActualizada.Estado);
    }

    [Fact]
    public async Task DynamicScoreCalculation_ShouldComputeAverageFromQuestionnaires()
    {
        // Arrange
        var db = GetInMemoryDbContext(nameof(DynamicScoreCalculation_ShouldComputeAverageFromQuestionnaires));
        var agendaService = new AgendaService(db, NullLogger<AgendaService>.Instance);
        var turnoService = new TurnoService(db, NullLogger<TurnoService>.Instance);
        var citaService = new CitaService(db, NullLogger<CitaService>.Instance);
        var cuestionarioService = new CuestionarioService(db, NullLogger<CuestionarioService>.Instance);
        var profesionalService = new ProfesionalService(db, NullLogger<ProfesionalService>.Instance);

        var prof = new Profesional { Cuil = "20888888888", Nombre = "Laura", Apellido = "Gimenez", Matricula = "MP303" };
        db.Profesionales.Add(prof);
        db.Consultorios.Add(new Consultorio { Cuit = "30444444444", Nombre = "Centro Especialidades" });
        db.Pacientes.Add(new Paciente { Cuil = "27888888888", Nombre = "Martin", Apellido = "Paz" });
        await db.SaveChangesAsync();

        await agendaService.AltaAgendaAsync(new AltaAgendaDto("20888888888", "30444444444", 10, 9, 2026, new TimeSpan(9, 0, 0), new TimeSpan(10, 0, 0), 30));
        var turnos = await turnoService.ObtenerTurnosDisponiblesAsync("20888888888", new DateTime(2026, 9, 10));

        var cita1 = await citaService.AltaCitaAsync(new AltaCitaDto("27888888888", "20888888888", turnos[0].Id, TipoCita.Consulta, null, null));
        var cita2 = await citaService.AltaCitaAsync(new AltaCitaDto("27888888888", "20888888888", turnos[1].Id, TipoCita.Consulta, null, null));

        // Marcar citas como Atendidas para permitir responder encuestas (RF-PAC-12)
        await citaService.ModificarCitaEstadoAsync(cita1.Id, EstadoCita.Atendida);
        await citaService.ModificarCitaEstadoAsync(cita2.Id, EstadoCita.Atendida);

        // Cuestionario 1: Puntualidad=5, Atencion=4, Profesionalismo=5 -> Promedio = 4.67
        await cuestionarioService.CompletarCuestionarioAsync(new CompletarCuestionarioDto(cita1.Id, 5, 4, 5, "Excelente atención"));
        // Cuestionario 2: Puntualidad=3, Atencion=3, Profesionalismo=3 -> Promedio = 3.0
        await cuestionarioService.CompletarCuestionarioAsync(new CompletarCuestionarioDto(cita2.Id, 3, 3, 3, "Normal"));

        // Act
        var profRes = await profesionalService.ObtenerPorCuilAsync("20888888888");

        // Assert: Promedio global esperado: ((14/3) + (9/3)) / 2 = (4.666... + 3.0) / 2 = 3.83
        Assert.Equal(3.83, profRes.Puntuacion);
    }

    [Fact]
    public async Task BusquedaProfesionalesPorNombreYEspecialidad_ShouldFilterCorrectly()
    {
        // Arrange
        var db = GetInMemoryDbContext(nameof(BusquedaProfesionalesPorNombreYEspecialidad_ShouldFilterCorrectly));
        var profService = new ProfesionalService(db, NullLogger<ProfesionalService>.Instance);

        var espCardio = new Especialidad { Id = 1, Nombre = "Cardiología" };
        var espDerma = new Especialidad { Id = 2, Nombre = "Dermatología" };
        db.Especialidades.AddRange(espCardio, espDerma);

        var prof1 = new Profesional { Cuil = "20999999991", Nombre = "Patricia", Apellido = "Soria", Matricula = "MAT-7788", Estado = EstadoProfesional.Activo };
        prof1.Especialidades.Add(new ProfesionalEspecialidad { ProfesionalCuil = prof1.Cuil, EspecialidadId = 1 });

        var prof2 = new Profesional { Cuil = "20999999992", Nombre = "Patricio", Apellido = "Rey", Matricula = "MAT-9900", Estado = EstadoProfesional.Activo };
        prof2.Especialidades.Add(new ProfesionalEspecialidad { ProfesionalCuil = prof2.Cuil, EspecialidadId = 2 });

        var prof3 = new Profesional { Cuil = "20999999993", Nombre = "Mariana", Apellido = "Soria", Matricula = "MAT-5544", Estado = EstadoProfesional.Activo };
        prof3.Especialidades.Add(new ProfesionalEspecialidad { ProfesionalCuil = prof3.Cuil, EspecialidadId = 1 });

        db.Profesionales.AddRange(prof1, prof2, prof3);
        await db.SaveChangesAsync();

        // Act 1: Búsqueda por nombre "patri" (debe traer a Patricia y Patricio)
        var resNombre = await profService.ConsultarProfesionalesAsync("patri", null, null, null);
        Assert.Equal(2, resNombre.Count);

        // Act 2: Búsqueda por apellido "soria" y filtrada por especialidad Cardiología (Id 1) (debe traer a Patricia y Mariana)
        var resFiltro = await profService.ConsultarProfesionalesAsync("soria", 1, null, null);
        Assert.Equal(2, resFiltro.Count);
        Assert.Contains(resFiltro, p => p.Cuil == "20999999991");
        Assert.Contains(resFiltro, p => p.Cuil == "20999999993");
    }

    [Fact]
    public async Task Asistente_AltaYConsulta_ShouldPersistAndRetrieveCorrectly()
    {
        // Arrange
        var db = GetInMemoryDbContext(nameof(Asistente_AltaYConsulta_ShouldPersistAndRetrieveCorrectly));
        var asistenteService = new AsistenteService(db, NullLogger<AsistenteService>.Instance);

        var dto = new AltaAsistenteDto(
            "27345678901",
            "Marta",
            "Gomez",
            new DateTime(1990, 5, 20),
            "3815554433",
            "Femenino",
            "San Martín",
            "450",
            "1A",
            "San Miguel de Tucumán",
            "Tucumán",
            "4000"
        );

        // Act
        var res = await asistenteService.AltaAsistenteAsync(dto);

        // Assert
        Assert.NotNull(res);
        Assert.Equal("27345678901", res.Cuil);
        Assert.Equal("Marta", res.Nombre);
        Assert.Contains("San Martín 450", res.DireccionCompleta!);

        var usuario = await db.Usuarios.FirstOrDefaultAsync(u => u.NombreUsuario == "27345678901");
        Assert.NotNull(usuario);
        Assert.Equal(RolUsuario.Asistente, usuario.Rol);
    }

    [Fact]
    public async Task InstitucionYConsultorio_Alta_ShouldLinkCorrectly()
    {
        // Arrange
        var db = GetInMemoryDbContext(nameof(InstitucionYConsultorio_Alta_ShouldLinkCorrectly));
        var institucionService = new InstitucionService(db, NullLogger<InstitucionService>.Instance);
        var consultorioService = new ConsultorioService(db, NullLogger<ConsultorioService>.Instance);

        var instDto = new AltaInstitucionDto("Sanatorio Norte", "30999888776", "contacto@sanatorionorte.com");
        var inst = await institucionService.AltaInstitucionAsync(instDto);

        var consDto = new AltaConsultorioDto(
            "30111222339",
            "Consultorio Planta Baja",
            "pb@sanatorionorte.com",
            "3814443322",
            "Alta - Rampa y ascensor",
            inst.Id,
            "Av. Avellaneda",
            "1200",
            null,
            "San Miguel de Tucumán",
            "Tucumán",
            "4000",
            null
        );

        // Act
        var cons = await consultorioService.AltaConsultorioAsync(consDto);

        // Assert
        Assert.NotNull(cons);
        Assert.Equal("30111222339", cons.Cuit);
        Assert.Equal("Sanatorio Norte", cons.InstitucionNombre);
        Assert.Equal("Alta - Rampa y ascensor", cons.NivelAccesibilidad);
    }

    [Fact]
    public async Task EstudioYCoberturaTernaria_ShouldLinkToProfesionalEstudio()
    {
        // Arrange
        var db = GetInMemoryDbContext(nameof(EstudioYCoberturaTernaria_ShouldLinkToProfesionalEstudio));
        var estudioService = new EstudioService(db, NullLogger<EstudioService>.Instance);
        var profesionalService = new ProfesionalService(db, NullLogger<ProfesionalService>.Instance);

        var os1 = new ObraSocial { Id = 10, Nombre = "OSDE" };
        var os2 = new ObraSocial { Id = 20, Nombre = "Swiss Medical" };
        db.ObrasSociales.AddRange(os1, os2);
        await db.SaveChangesAsync();

        var est = await estudioService.AltaEstudioAsync(new AltaEstudioDto("Resonancia de Rodilla", "Resonancia magnética nuclear", 40, "Sin metal"));

        var profDto = new AltaProfesionalDto(
            "20555555555",
            "Roberto",
            "Funes",
            new DateTime(1980, 3, 15),
            "3816667788",
            "MP999",
            "Masculino",
            "Balcarce",
            "300",
            null,
            "San Miguel de Tucumán",
            "Tucumán",
            "4000",
            null,
            null,
            null,
            new List<AsignarEstudioProfesionalDto>
            {
                new AsignarEstudioProfesionalDto(est.Id, 45, 15000m, new List<int> { 10, 20 })
            }
        );

        // Act
        var profRes = await profesionalService.AltaProfesionalAsync(profDto);

        // Assert
        Assert.Single(profRes.Estudios);
        var profEstudio = profRes.Estudios.First();
        Assert.Equal("Resonancia de Rodilla", profEstudio.EstudioNombre);
        Assert.Equal(2, profEstudio.ObrasSocialesAceptadas.Count);
        Assert.Contains("OSDE", profEstudio.ObrasSocialesAceptadas);
        Assert.Contains("Swiss Medical", profEstudio.ObrasSocialesAceptadas);
    }

    [Fact]
    public async Task HistoriaClinica_SinNombrePropio_InheritsNameFromPacienteAndStoresObservaciones()
    {
        // Arrange
        var db = GetInMemoryDbContext(nameof(HistoriaClinica_SinNombrePropio_InheritsNameFromPacienteAndStoresObservaciones));
        var pacienteService = new PacienteService(db, NullLogger<PacienteService>.Instance);
        var historiaClinicaService = new HistoriaClinicaService(db, NullLogger<HistoriaClinicaService>.Instance);
        var observacionService = new ObservacionService(db, NullLogger<ObservacionService>.Instance);

        var pac = await pacienteService.AltaPerfilAsync(new AltaPerfilPacienteDto(
            "27444333221",
            "Camila",
            "Juarez",
            new DateTime(1995, 10, 12),
            "Femenino",
            "3815551122",
            "Crisostomo Alvarez",
            "800",
            null,
            "San Miguel de Tucumán",
            "Tucumán",
            "4000",
            null
        ));

        var hc = await historiaClinicaService.AltaHistoriaClinicaAsync(new AltaHistoriaClinicaDto(
            pac.Cuil,
            "Ninguna",
            "0+",
            "Penicilina",
            "Ninguna",
            "Ibuprofeno",
            "Pedro",
            "Juarez",
            "3815559988"
        ));

        // Act
        await observacionService.CompletarObservacionAsync(new CompletarObservacionDto(
            null,
            hc.Id,
            null,
            "Chequeo de rutina",
            "Paciente en buen estado general"
        ));

        var hcActualizada = await historiaClinicaService.ObtenerPorPacienteCuilAsync(pac.Cuil);

        // Assert
        Assert.Equal("Camila Juarez", hcActualizada.PacienteNombreCompleto);
        Assert.Single(hcActualizada.Observaciones);
        Assert.Equal("Chequeo de rutina", hcActualizada.Observaciones.First().Motivo);
    }

    [Fact]
    public async Task Administradores_Jerarquia_ShouldCreateAndAssignCorrectly()
    {
        // Arrange
        var db = GetInMemoryDbContext(nameof(Administradores_Jerarquia_ShouldCreateAndAssignCorrectly));
        var adminService = new AdministradorService(db, NullLogger<AdministradorService>.Instance);
        var institucionService = new InstitucionService(db, NullLogger<InstitucionService>.Instance);
        var consultorioService = new ConsultorioService(db, NullLogger<ConsultorioService>.Instance);

        var inst = await institucionService.AltaInstitucionAsync(new AltaInstitucionDto("Clínica Integral", "30999111223", "integral@clinica.com"));
        var cons = await consultorioService.AltaConsultorioAsync(new AltaConsultorioDto(
            "30444555667", "Sede Central", "sede@clinica.com", "3814445566", "Alta", inst.Id, "Av. Mate de Luna", "2000", null, "San Miguel de Tucumán", "Tucumán", "4000", null
        ));

        // Act 1: Alta Admin Institución (SuperAdmin acción)
        var adminInst = await adminService.AltaAdminInstitucionAsync(new AltaAdminInstitucionDto(
            "20123987654", "Roberto", "Gómez", "3815001122", new DateTime(1975, 4, 10), inst.Id, "r_gomez", "pass123", "r_gomez@clinica.com"
        ));

        // Act 2: Alta Admin Consultorio (Admin Institución acción)
        var adminCons = await adminService.AltaAdminConsultorioAsync(new AltaAdminConsultorioDto(
            "27333444555", "Lucía", "Paz", "3816112233", new DateTime(1988, 8, 25), cons.Cuit, "l_paz", "pass456", "l_paz@clinica.com"
        ));

        // Assert
        Assert.NotNull(adminInst);
        Assert.Equal("Clínica Integral", adminInst.InstitucionNombre);
        var uInst = await db.Usuarios.FindAsync(adminInst.UsuarioId);
        Assert.Equal(RolUsuario.AdminInstitucion, uInst?.Rol);

        Assert.NotNull(adminCons);
        Assert.Equal("Sede Central", adminCons.ConsultorioNombre);
        var uCons = await db.Usuarios.FindAsync(adminCons.UsuarioId);
        Assert.Equal(RolUsuario.AdminConsultorio, uCons?.Rol);
    }

    [Fact]
    public async Task Asistente_AsignarEstudiosYCoberturas_ShouldConfigureSuccessfully()
    {
        // Arrange
        var db = GetInMemoryDbContext(nameof(Asistente_AsignarEstudiosYCoberturas_ShouldConfigureSuccessfully));
        var profService = new ProfesionalService(db, NullLogger<ProfesionalService>.Instance);
        var estudioService = new EstudioService(db, NullLogger<EstudioService>.Instance);

        var osde = new ObraSocial { Id = 1, Nombre = "OSDE" };
        var swiss = new ObraSocial { Id = 2, Nombre = "Swiss Medical" };
        db.ObrasSociales.AddRange(osde, swiss);
        await db.SaveChangesAsync();

        var est = await estudioService.AltaEstudioAsync(new AltaEstudioDto("Ecocardiograma", "Ultrasonido del corazón", 30, "En reposo"));

        var profDto = new AltaProfesionalDto(
            "20333333333", "Esteban", "Quito", new DateTime(1982, 1, 1), "3814441111", "MP555", "M", null, null, null, null, null, null, null, null, null, null
        );
        await profService.AltaProfesionalAsync(profDto);

        // Act: La Asistente configura los estudios del profesional y sus coberturas
        var estudioAsignado = await profService.AsignarEstudioAsync("20333333333", new AsignarEstudioProfesionalDto(
            est.Id, 35, 18000m, new List<int> { 1, 2 }
        ));

        // Assert
        Assert.NotNull(estudioAsignado);
        Assert.Equal("Ecocardiograma", estudioAsignado.EstudioNombre);
        Assert.Equal(35, estudioAsignado.DuracionTurno);
        Assert.Equal(18000m, estudioAsignado.PrecioParticular);
        Assert.Equal(2, estudioAsignado.ObrasSocialesAceptadas.Count);
        Assert.Contains("OSDE", estudioAsignado.ObrasSocialesAceptadas);
        Assert.Contains("Swiss Medical", estudioAsignado.ObrasSocialesAceptadas);
    }

    [Fact]
    public async Task RN05_MedicoNoPuedeTenerDosAgendasEnConsultoriosDistintosQueSeCrucenEnDiaYHora_ThrowsConflictException()
    {
        // Arrange
        var db = GetInMemoryDbContext(nameof(RN05_MedicoNoPuedeTenerDosAgendasEnConsultoriosDistintosQueSeCrucenEnDiaYHora_ThrowsConflictException));
        var agendaService = new AgendaService(db, NullLogger<AgendaService>.Instance);

        db.Profesionales.Add(new Profesional { Cuil = "20999888777", Nombre = "Martín", Apellido = "Gómez", Matricula = "MP9988" });
        db.Consultorios.Add(new Consultorio { Cuit = "30111111111", Nombre = "Consultorio Sede Norte" });
        db.Consultorios.Add(new Consultorio { Cuit = "30222222222", Nombre = "Consultorio Sede Sur" });
        await db.SaveChangesAsync();

        // Agenda en Sede Norte de 08:00 a 12:00
        var dtoSedeNorte = new AltaAgendaDto("20999888777", "30111111111", 10, 10, 2026, new TimeSpan(8, 0, 0), new TimeSpan(12, 0, 0));
        await agendaService.AltaAgendaAsync(dtoSedeNorte);

        // Act & Assert: Intento de crear agenda para el mismo médico en Sede Sur de 10:00 a 14:00 (se cruza en día y hora)
        var dtoSedeSur = new AltaAgendaDto("20999888777", "30222222222", 10, 10, 2026, new TimeSpan(10, 0, 0), new TimeSpan(14, 0, 0));
        var ex = await Assert.ThrowsAsync<ConflictException>(() => agendaService.AltaAgendaAsync(dtoSedeSur));
        Assert.Contains("RN-05", ex.Message);
    }

    [Fact]
    public async Task CitaEstudio_QueDuraMasDe30Min_DebeCubrirMultiplesTurnosConsecutivos()
    {
        // Arrange
        var db = GetInMemoryDbContext(nameof(CitaEstudio_QueDuraMasDe30Min_DebeCubrirMultiplesTurnosConsecutivos));
        var agendaService = new AgendaService(db, NullLogger<AgendaService>.Instance);
        var citaService = new CitaService(db, NullLogger<CitaService>.Instance);

        db.Profesionales.Add(new Profesional { Cuil = "20777888999", Nombre = "Elena", Apellido = "Rios", Matricula = "MP7788" });
        db.Consultorios.Add(new Consultorio { Cuit = "30333444555", Nombre = "Centro de Diagnóstico" });
        db.Pacientes.Add(new Paciente { Cuil = "27444555666", Nombre = "Susana", Apellido = "Pérez" });

        // Estudio que dura 60 min (requiere 2 turnos de 30 min)
        var estudio = new Estudio { Nombre = "Ecografía Morfológica", Duracion = 60, Preparacion = "Vejiga llena" };
        db.Estudios.Add(estudio);
        await db.SaveChangesAsync();

        // Agenda de 08:00 a 10:00 con turnos de 30 min (08:00, 08:30, 09:00, 09:30)
        var agenda = await agendaService.AltaAgendaAsync(new AltaAgendaDto("20777888999", "30333444555", 5, 11, 2026, new TimeSpan(8, 0, 0), new TimeSpan(10, 0, 0), 30));
        var turnos = await db.Turnos.Where(t => t.AgendaId == agenda.Id).OrderBy(t => t.HoraInicio).ToListAsync();

        // Act: Paciente Susana reserva cita para el estudio a las 08:00 (primer turno)
        var citaDto = new AltaCitaDto(
            "27444555666",
            "20777888999",
            turnos[0].Id,
            TipoCita.Estudio,
            null,
            estudio.Id,
            "pedido_medico_orden123.pdf"
        );

        var citaResponse = await citaService.AltaCitaAsync(citaDto);

        // Assert
        Assert.NotNull(citaResponse);
        Assert.Equal(2, citaResponse.CantidadTurnosCubiertos);
        Assert.Equal("pedido_medico_orden123.pdf", citaResponse.DocumentoPedidoMedico);
        Assert.Equal(estudio.Id, citaResponse.EstudioId);

        // Verificar que AMBOS turnos (08:00 y 08:30) quedaron como Reservados
        var t1 = await db.Turnos.FindAsync(turnos[0].Id);
        var t2 = await db.Turnos.FindAsync(turnos[1].Id);
        var t3 = await db.Turnos.FindAsync(turnos[2].Id);

        Assert.Equal(EstadoTurno.Reservado, t1?.Estado);
        Assert.Equal(EstadoTurno.Reservado, t2?.Estado);
        Assert.Equal(EstadoTurno.Disponible, t3?.Estado);
        Assert.Equal(citaResponse.Id, t1?.CitaId);
        Assert.Equal(citaResponse.Id, t2?.CitaId);
    }

    [Fact]
    public async Task CitaEstudio_CuandoNoHayTurnosConsecutivosDisponibles_LanzaConflictException()
    {
        // Arrange
        var db = GetInMemoryDbContext(nameof(CitaEstudio_CuandoNoHayTurnosConsecutivosDisponibles_LanzaConflictException));
        var agendaService = new AgendaService(db, NullLogger<AgendaService>.Instance);
        var citaService = new CitaService(db, NullLogger<CitaService>.Instance);

        db.Profesionales.Add(new Profesional { Cuil = "20121212121", Nombre = "Lucas", Apellido = "Mora", Matricula = "MP1212" });
        db.Consultorios.Add(new Consultorio { Cuit = "30555555555", Nombre = "Clínica San Lucas" });
        db.Pacientes.Add(new Paciente { Cuil = "27111111112", Nombre = "Clara", Apellido = "Vidal" });
        db.Pacientes.Add(new Paciente { Cuil = "27999999991", Nombre = "Pedro", Apellido = "Ramos" });

        var estudio = new Estudio { Nombre = "Resonancia Magnética", Duracion = 60 };
        db.Estudios.Add(estudio);
        await db.SaveChangesAsync();

        var agenda = await agendaService.AltaAgendaAsync(new AltaAgendaDto("20121212121", "30555555555", 6, 11, 2026, new TimeSpan(8, 0, 0), new TimeSpan(9, 30, 0), 30));
        var turnos = await db.Turnos.Where(t => t.AgendaId == agenda.Id).OrderBy(t => t.HoraInicio).ToListAsync();

        // Reservamos individualmente el turno de las 08:30 (turnos[1])
        await citaService.AltaCitaAsync(new AltaCitaDto("27999999991", "20121212121", turnos[1].Id, TipoCita.Consulta, null, null));

        // Act & Assert: Clara intenta reservar estudio de 60 min a las 08:00 (turnos[0]) pero a las 08:30 está ocupado
        var citaEstudioDto = new AltaCitaDto("27111111112", "20121212121", turnos[0].Id, TipoCita.Estudio, null, estudio.Id);
        var ex = await Assert.ThrowsAsync<ConflictException>(() => citaService.AltaCitaAsync(citaEstudioDto));
        Assert.Contains("requiere 2 turnos consecutivos", ex.Message);
    }

    [Fact]
    public async Task CitaEstudio_AlCancelar_LiberaTodosLosTurnosCubiertos()
    {
        // Arrange
        var db = GetInMemoryDbContext(nameof(CitaEstudio_AlCancelar_LiberaTodosLosTurnosCubiertos));
        var agendaService = new AgendaService(db, NullLogger<AgendaService>.Instance);
        var citaService = new CitaService(db, NullLogger<CitaService>.Instance);

        db.Profesionales.Add(new Profesional { Cuil = "20666666666", Nombre = "Valeria", Apellido = "Sanz", Matricula = "MP6666" });
        db.Consultorios.Add(new Consultorio { Cuit = "30777777777", Nombre = "Instituto Médico" });
        db.Pacientes.Add(new Paciente { Cuil = "27888888888", Nombre = "Joaquín", Apellido = "Paz" });

        var estudio = new Estudio { Nombre = "Tomografía Computada", Duracion = 60 };
        db.Estudios.Add(estudio);
        await db.SaveChangesAsync();

        var agenda = await agendaService.AltaAgendaAsync(new AltaAgendaDto("20666666666", "30777777777", 7, 11, 2026, new TimeSpan(8, 0, 0), new TimeSpan(9, 30, 0), 30));
        var turnos = await db.Turnos.Where(t => t.AgendaId == agenda.Id).OrderBy(t => t.HoraInicio).ToListAsync();

        var cita = await citaService.AltaCitaAsync(new AltaCitaDto("27888888888", "20666666666", turnos[0].Id, TipoCita.Estudio, null, estudio.Id));

        // Act: Se cancela la cita
        await citaService.BajaCitaAsync(cita.Id);

        // Assert: Ambos turnos quedan nuevamente en EstadoTurno.Disponible
        var t1 = await db.Turnos.FindAsync(turnos[0].Id);
        var t2 = await db.Turnos.FindAsync(turnos[1].Id);

        Assert.Equal(EstadoTurno.Disponible, t1?.Estado);
        Assert.Equal(EstadoTurno.Disponible, t2?.Estado);
        Assert.Null(t1?.CitaId);
        Assert.Null(t2?.CitaId);
    }

    [Fact]
    public async Task Especialidad_AsociarEstudiosYConsultarPorEspecialidad_Success()
    {
        // Arrange
        var db = GetInMemoryDbContext(nameof(Especialidad_AsociarEstudiosYConsultarPorEspecialidad_Success));
        var espService = new EspecialidadService(db, NullLogger<EspecialidadService>.Instance);
        var estudioService = new EstudioService(db, NullLogger<EstudioService>.Instance);

        var esp = await espService.AltaEspecialidadAsync(new AltaEspecialidadDto("Imágenes Médicas", "Diagnóstico por imágenes"));

        await estudioService.AltaEstudioAsync(new AltaEstudioDto("Ecografía Mamaria", "Estudio ecográfico", 30, "Sin desodorante", esp.Id));
        await estudioService.AltaEstudioAsync(new AltaEstudioDto("Doppler Transvaginal", "Estudio doppler", 30, "Preparación básica", esp.Id));

        // Act
        var estudiosDeEspecialidad = await espService.ObtenerEstudiosPorEspecialidadAsync(esp.Id);

        // Assert
        Assert.Equal(2, estudiosDeEspecialidad.Count);
        Assert.Contains(estudiosDeEspecialidad, e => e.Nombre == "Ecografía Mamaria");
        Assert.Contains(estudiosDeEspecialidad, e => e.Nombre == "Doppler Transvaginal");
        Assert.All(estudiosDeEspecialidad, e => Assert.Equal("Imágenes Médicas", e.EspecialidadNombre));
    }

    [Fact]
    public async Task RNF_SEG_06_BajaPaciente_ConHistoriaClinica_DebeLanzarConflictException()
    {
        // Arrange
        var db = GetInMemoryDbContext(nameof(RNF_SEG_06_BajaPaciente_ConHistoriaClinica_DebeLanzarConflictException));
        var pacienteService = new PacienteService(db, NullLogger<PacienteService>.Instance);

        var pacienteConHistoria = new Paciente
        {
            Cuil = "27112233445",
            Nombre = "Esteban",
            Apellido = "Quito"
        };
        db.Pacientes.Add(pacienteConHistoria);
        db.HistoriasClinicas.Add(new HistoriaClinica
        {
            PacienteCuil = pacienteConHistoria.Cuil,
            GrupSang = "0+"
        });

        var pacienteSinHistoria = new Paciente
        {
            Cuil = "27998877665",
            Nombre = "Laura",
            Apellido = "Méndez"
        };
        db.Pacientes.Add(pacienteSinHistoria);
        await db.SaveChangesAsync();

        // Act & Assert 1: Paciente con HC debe ser protegido (RNF-SEG-06 / Ley 25.326)
        var ex = await Assert.ThrowsAsync<ConflictException>(() => pacienteService.BajaPerfilAsync(pacienteConHistoria.Cuil));
        Assert.Contains("Historia Clínica", ex.Message);
        Assert.Contains("Ley 25.326", ex.Message);

        // Act & Assert 2: Paciente sin HC puede eliminarse normalmente
        await pacienteService.BajaPerfilAsync(pacienteSinHistoria.Cuil);
        var pacEliminado = await db.Pacientes.FirstOrDefaultAsync(p => p.Cuil == pacienteSinHistoria.Cuil);
        Assert.Null(pacEliminado);
    }

    [Fact]
    public async Task RF_IADM_01_BajaConsultorio_DebeEliminarCuentasUsuarioDeAdministradoresConsultorio()
    {
        // Arrange
        var db = GetInMemoryDbContext(nameof(RF_IADM_01_BajaConsultorio_DebeEliminarCuentasUsuarioDeAdministradoresConsultorio));
        var consultorioService = new ConsultorioService(db, NullLogger<ConsultorioService>.Instance);

        var consultorio = new Consultorio
        {
            Cuit = "30123456789",
            Nombre = "Sede Centro"
        };
        db.Consultorios.Add(consultorio);

        var usuarioAdmin = new Usuario
        {
            NombreUsuario = "admin.sede.centro",
            Contrasena = "Pass123!",
            Mail = "admin.sede@tempuscare.com",
            Rol = RolUsuario.AdminConsultorio
        };
        db.Usuarios.Add(usuarioAdmin);
        await db.SaveChangesAsync();

        var adminCons = new AdministradorConsultorio
        {
            Cuil = "20123456789",
            Nombre = "Federico",
            Apellido = "Gómez",
            UsuarioId = usuarioAdmin.Id,
            ConsultorioCuit = consultorio.Cuit
        };
        db.AdministradoresConsultorio.Add(adminCons);
        await db.SaveChangesAsync();

        // Act: Dar de baja el consultorio
        await consultorioService.BajaConsultorioAsync(consultorio.Cuit);

        // Assert: Se eliminó el consultorio y no quedan usuarios huérfanos
        var consDb = await db.Consultorios.FirstOrDefaultAsync(c => c.Cuit == consultorio.Cuit);
        var adminDb = await db.AdministradoresConsultorio.FirstOrDefaultAsync(a => a.Cuil == adminCons.Cuil);
        var usuarioDb = await db.Usuarios.FirstOrDefaultAsync(u => u.Id == usuarioAdmin.Id);

        Assert.Null(consDb);
        Assert.Null(adminDb);
        Assert.Null(usuarioDb);
    }

    [Fact]
    public async Task RF_PAC_06_TurnoRowVersion_SeActualizaAlReservarYAlCancelar()
    {
        // Arrange
        var db = GetInMemoryDbContext(nameof(RF_PAC_06_TurnoRowVersion_SeActualizaAlReservarYAlCancelar));
        var agendaService = new AgendaService(db, NullLogger<AgendaService>.Instance);
        var citaService = new CitaService(db, NullLogger<CitaService>.Instance);

        db.Profesionales.Add(new Profesional { Cuil = "20888888888", Nombre = "Martín", Apellido = "Sosa", Matricula = "MP8888" });
        db.Consultorios.Add(new Consultorio { Cuit = "30444444444", Nombre = "Clínica Este" });
        db.Pacientes.Add(new Paciente { Cuil = "27444444444", Nombre = "Camila", Apellido = "Reyes" });
        await db.SaveChangesAsync();

        var agenda = await agendaService.AltaAgendaAsync(new AltaAgendaDto("20888888888", "30444444444", 15, 12, 2026, new TimeSpan(10, 0, 0), new TimeSpan(10, 30, 0), 30));
        var turno = await db.Turnos.FirstAsync(t => t.AgendaId == agenda.Id);
        var rowVersionInicial = turno.RowVersion;

        // Act 1: Reserva
        var cita = await citaService.AltaCitaAsync(new AltaCitaDto("27444444444", "20888888888", turno.Id, TipoCita.Consulta, null, null));
        var turnoPostReserva = await db.Turnos.AsNoTracking().FirstAsync(t => t.Id == turno.Id);

        // Assert 1: RowVersion se modificó
        Assert.NotEqual(rowVersionInicial, turnoPostReserva.RowVersion);
        var rowVersionPostReserva = turnoPostReserva.RowVersion;

        // Act 2: Cancelación
        await citaService.BajaCitaAsync(cita.Id);
        var turnoPostCancelacion = await db.Turnos.AsNoTracking().FirstAsync(t => t.Id == turno.Id);

        // Assert 2: RowVersion se volvió a renovar para asegurar concurrencia
        Assert.NotEqual(rowVersionPostReserva, turnoPostCancelacion.RowVersion);
        Assert.Equal(EstadoTurno.Disponible, turnoPostCancelacion.Estado);
        Assert.Null(turnoPostCancelacion.CitaId);
    }

    [Fact]
    public async Task RF_MED_06_CompletarObservacion_ActualizaCitaYTurnoA_Atendido()
    {
        // Arrange
        var db = GetInMemoryDbContext(nameof(RF_MED_06_CompletarObservacion_ActualizaCitaYTurnoA_Atendido));
        var agendaService = new AgendaService(db, NullLogger<AgendaService>.Instance);
        var citaService = new CitaService(db, NullLogger<CitaService>.Instance);
        var observacionService = new ObservacionService(db, NullLogger<ObservacionService>.Instance);

        db.Profesionales.Add(new Profesional { Cuil = "20101010101", Nombre = "Mariana", Apellido = "Rios", Matricula = "MP9090" });
        db.Consultorios.Add(new Consultorio { Cuit = "30101010101", Nombre = "Sede Norte" });
        db.Pacientes.Add(new Paciente { Cuil = "27101010101", Nombre = "Gabriel", Apellido = "Ruiz" });
        await db.SaveChangesAsync();

        var agenda = await agendaService.AltaAgendaAsync(new AltaAgendaDto("20101010101", "30101010101", 12, 10, 2026, new TimeSpan(8, 0, 0), new TimeSpan(8, 30, 0), 30));
        var turno = await db.Turnos.FirstAsync(t => t.AgendaId == agenda.Id);

        var cita = await citaService.AltaCitaAsync(new AltaCitaDto("27101010101", "20101010101", turno.Id, TipoCita.Consulta, null, null));
        Assert.Equal(EstadoCita.Confirmada, cita.Estado);

        // Act: El profesional registra la evolución médica de la consulta (RF-MED-06 & RN-04)
        var dtoObs = new CompletarObservacionDto(cita.Id, null, null, "Control clínico de rutina", "Paciente normotenso, sin particularidades.");
        var resObs = await observacionService.CompletarObservacionAsync(dtoObs);

        // Assert: La observación fue registrada y la Cita y el Turno pasaron a Atendido
        Assert.NotNull(resObs);
        var citaDb = await db.Citas.FindAsync(cita.Id);
        var turnoDb = await db.Turnos.FindAsync(turno.Id);

        Assert.Equal(EstadoCita.Atendida, citaDb?.Estado);
        Assert.Equal(EstadoTurno.Atendido, turnoDb?.Estado);

        // La observación está vinculada a la Historia Clínica unificada del paciente
        var hcDb = await db.HistoriasClinicas.Include(h => h.Observaciones).FirstOrDefaultAsync(h => h.PacienteCuil == "27101010101");
        Assert.NotNull(hcDb);
        Assert.Contains(hcDb.Observaciones, o => o.Id == resObs.Id);
    }

    [Fact]
    public async Task RF_PAC_12_CompletarCuestionario_EnCitaNoAtendida_LanzaConflictException()
    {
        // Arrange
        var db = GetInMemoryDbContext(nameof(RF_PAC_12_CompletarCuestionario_EnCitaNoAtendida_LanzaConflictException));
        var cuestionarioService = new CuestionarioService(db, NullLogger<CuestionarioService>.Instance);

        var citaConfirmada = new Cita
        {
            PacienteCuil = "27202020202",
            Fecha = DateTime.Now,
            Estado = EstadoCita.Confirmada,
            Tipo = TipoCita.Consulta
        };
        db.Citas.Add(citaConfirmada);
        await db.SaveChangesAsync();

        // Act & Assert 1: Intentar contestar la encuesta antes de ser atendido debe fallar (RF-PAC-12)
        var dto = new CompletarCuestionarioDto(citaConfirmada.Id, 5, 5, 5, "Muy buena atención");
        var ex = await Assert.ThrowsAsync<ConflictException>(() => cuestionarioService.CompletarCuestionarioAsync(dto));
        Assert.Contains("Atendidas", ex.Message);
        Assert.Contains("RF-PAC-12", ex.Message);

        // Act & Assert 2: Al ser atendida, se permite completar la encuesta
        citaConfirmada.Estado = EstadoCita.Atendida;
        await db.SaveChangesAsync();

        var res = await cuestionarioService.CompletarCuestionarioAsync(dto);
        Assert.NotNull(res);
        Assert.Equal(5.0, res.Promedio);
    }

    [Fact]
    public async Task Vitality_AltaInstitucion_PersistePlanSuscripcion()
    {
        // Arrange
        var db = GetInMemoryDbContext(nameof(Vitality_AltaInstitucion_PersistePlanSuscripcion));
        var institucionService = new InstitucionService(db, NullLogger<InstitucionService>.Instance);

        var dtoAlta = new AltaInstitucionDto("Sanatorio Modelo", "30777888999", "admin@sanatoriomodelo.com", "Starter");

        // Act
        var res = await institucionService.AltaInstitucionAsync(dtoAlta);

        // Assert
        Assert.NotNull(res);
        Assert.Equal("Starter", res.Plan);

        var instDb = await institucionService.ObtenerPorIdAsync(res.Id);
        Assert.Equal("Starter", instDb.Plan);
    }

    [Fact]
    public async Task Consultorios_RetornaObjetosProfesionalVinculadoDto()
    {
        // Arrange
        var db = GetInMemoryDbContext(nameof(Consultorios_RetornaObjetosProfesionalVinculadoDto));
        var consultorioService = new ConsultorioService(db, NullLogger<ConsultorioService>.Instance);

        var esp = new Especialidad { Nombre = "Neurología", Descripcion = "Especialidad del sistema nervioso" };
        db.Especialidades.Add(esp);
        await db.SaveChangesAsync();

        var prof = new Profesional { Cuil = "20303030303", Nombre = "Esteban", Apellido = "Britez", Matricula = "MN5555", Telefono = "3814445566" };
        prof.Especialidades.Add(new ProfesionalEspecialidad { ProfesionalCuil = prof.Cuil, EspecialidadId = esp.Id });
        db.Profesionales.Add(prof);

        var consultorio = new Consultorio { Cuit = "30303030303", Nombre = "Centro Neurológico" };
        db.Consultorios.Add(consultorio);
        await db.SaveChangesAsync();

        await consultorioService.AsignarProfesionalAsync(consultorio.Cuit, prof.Cuil);

        // Act
        var consDto = await consultorioService.ObtenerPorCuitAsync(consultorio.Cuit);

        // Assert: Retorna objetos completos ProfesionalVinculadoDto
        Assert.NotNull(consDto);
        Assert.Single(consDto.Profesionales);
        var profVinculado = consDto.Profesionales.First();

        Assert.Equal("20303030303", profVinculado.Cuil);
        Assert.Equal("Esteban", profVinculado.Nombre);
        Assert.Equal("Britez", profVinculado.Apellido);
        Assert.Equal("MN5555", profVinculado.Matricula);
        Assert.Contains("Neurología", profVinculado.Especialidades);
    }
}


