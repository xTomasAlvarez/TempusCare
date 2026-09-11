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
}
