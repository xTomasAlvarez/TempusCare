using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace TempusCare.Api.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class InitialRefactoredSchema : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "Direcciones",
                columns: table => new
                {
                    Id = table.Column<int>(type: "INTEGER", nullable: false)
                        .Annotation("Sqlite:Autoincrement", true),
                    Pais = table.Column<string>(type: "TEXT", nullable: false),
                    Provincia = table.Column<string>(type: "TEXT", nullable: false),
                    Localidad = table.Column<string>(type: "TEXT", nullable: false),
                    Calle = table.Column<string>(type: "TEXT", nullable: false),
                    Nro = table.Column<string>(type: "TEXT", nullable: false),
                    Depto = table.Column<string>(type: "TEXT", nullable: true),
                    CodPostal = table.Column<string>(type: "TEXT", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Direcciones", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "Especialidades",
                columns: table => new
                {
                    Id = table.Column<int>(type: "INTEGER", nullable: false)
                        .Annotation("Sqlite:Autoincrement", true),
                    Nombre = table.Column<string>(type: "TEXT", nullable: false),
                    Descripcion = table.Column<string>(type: "TEXT", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Especialidades", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "ObrasSociales",
                columns: table => new
                {
                    Id = table.Column<int>(type: "INTEGER", nullable: false)
                        .Annotation("Sqlite:Autoincrement", true),
                    Nombre = table.Column<string>(type: "TEXT", nullable: false),
                    Catalogo = table.Column<string>(type: "TEXT", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ObrasSociales", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "Usuarios",
                columns: table => new
                {
                    Id = table.Column<int>(type: "INTEGER", nullable: false)
                        .Annotation("Sqlite:Autoincrement", true),
                    NombreUsuario = table.Column<string>(type: "TEXT", nullable: false),
                    Contrasena = table.Column<string>(type: "TEXT", nullable: false),
                    Mail = table.Column<string>(type: "TEXT", nullable: false),
                    Rol = table.Column<int>(type: "INTEGER", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Usuarios", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "Estudios",
                columns: table => new
                {
                    Id = table.Column<int>(type: "INTEGER", nullable: false)
                        .Annotation("Sqlite:Autoincrement", true),
                    Nombre = table.Column<string>(type: "TEXT", nullable: false),
                    Descripcion = table.Column<string>(type: "TEXT", nullable: false),
                    Duracion = table.Column<int>(type: "INTEGER", nullable: false),
                    Preparacion = table.Column<string>(type: "TEXT", nullable: false),
                    EspecialidadId = table.Column<int>(type: "INTEGER", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Estudios", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Estudios_Especialidades_EspecialidadId",
                        column: x => x.EspecialidadId,
                        principalTable: "Especialidades",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.SetNull);
                });

            migrationBuilder.CreateTable(
                name: "Instituciones",
                columns: table => new
                {
                    Id = table.Column<int>(type: "INTEGER", nullable: false)
                        .Annotation("Sqlite:Autoincrement", true),
                    UsuarioId = table.Column<int>(type: "INTEGER", nullable: false),
                    Nombre = table.Column<string>(type: "TEXT", nullable: false),
                    Cuit = table.Column<string>(type: "TEXT", nullable: false),
                    Email = table.Column<string>(type: "TEXT", nullable: false),
                    Plan = table.Column<string>(type: "TEXT", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Instituciones", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Instituciones_Usuarios_UsuarioId",
                        column: x => x.UsuarioId,
                        principalTable: "Usuarios",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "Pacientes",
                columns: table => new
                {
                    Cuil = table.Column<string>(type: "TEXT", nullable: false),
                    UsuarioId = table.Column<int>(type: "INTEGER", nullable: false),
                    Nombre = table.Column<string>(type: "TEXT", nullable: false),
                    Apellido = table.Column<string>(type: "TEXT", nullable: false),
                    FechaNacimiento = table.Column<DateTime>(type: "TEXT", nullable: false),
                    Genero = table.Column<string>(type: "TEXT", nullable: false),
                    Telefono = table.Column<string>(type: "TEXT", nullable: false),
                    DireccionId = table.Column<int>(type: "INTEGER", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Pacientes", x => x.Cuil);
                    table.ForeignKey(
                        name: "FK_Pacientes_Direcciones_DireccionId",
                        column: x => x.DireccionId,
                        principalTable: "Direcciones",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.SetNull);
                    table.ForeignKey(
                        name: "FK_Pacientes_Usuarios_UsuarioId",
                        column: x => x.UsuarioId,
                        principalTable: "Usuarios",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "Profesionales",
                columns: table => new
                {
                    Cuil = table.Column<string>(type: "TEXT", nullable: false),
                    UsuarioId = table.Column<int>(type: "INTEGER", nullable: false),
                    Nombre = table.Column<string>(type: "TEXT", nullable: false),
                    Apellido = table.Column<string>(type: "TEXT", nullable: false),
                    FechaNacimiento = table.Column<DateTime>(type: "TEXT", nullable: false),
                    Telefono = table.Column<string>(type: "TEXT", nullable: false),
                    Matricula = table.Column<string>(type: "TEXT", nullable: false),
                    Genero = table.Column<string>(type: "TEXT", nullable: false),
                    Estado = table.Column<int>(type: "INTEGER", nullable: false),
                    DireccionId = table.Column<int>(type: "INTEGER", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Profesionales", x => x.Cuil);
                    table.ForeignKey(
                        name: "FK_Profesionales_Direcciones_DireccionId",
                        column: x => x.DireccionId,
                        principalTable: "Direcciones",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.SetNull);
                    table.ForeignKey(
                        name: "FK_Profesionales_Usuarios_UsuarioId",
                        column: x => x.UsuarioId,
                        principalTable: "Usuarios",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "AdministradoresInstitucion",
                columns: table => new
                {
                    Cuil = table.Column<string>(type: "TEXT", nullable: false),
                    UsuarioId = table.Column<int>(type: "INTEGER", nullable: false),
                    InstitucionId = table.Column<int>(type: "INTEGER", nullable: false),
                    Nombre = table.Column<string>(type: "TEXT", nullable: false),
                    Apellido = table.Column<string>(type: "TEXT", nullable: false),
                    Telefono = table.Column<string>(type: "TEXT", nullable: false),
                    FechaNacimiento = table.Column<DateTime>(type: "TEXT", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_AdministradoresInstitucion", x => x.Cuil);
                    table.ForeignKey(
                        name: "FK_AdministradoresInstitucion_Instituciones_InstitucionId",
                        column: x => x.InstitucionId,
                        principalTable: "Instituciones",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_AdministradoresInstitucion_Usuarios_UsuarioId",
                        column: x => x.UsuarioId,
                        principalTable: "Usuarios",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "Consultorios",
                columns: table => new
                {
                    Cuit = table.Column<string>(type: "TEXT", nullable: false),
                    Nombre = table.Column<string>(type: "TEXT", nullable: false),
                    Email = table.Column<string>(type: "TEXT", nullable: false),
                    Telefono = table.Column<string>(type: "TEXT", nullable: false),
                    NivelAccesibilidad = table.Column<string>(type: "TEXT", nullable: false),
                    InstitucionId = table.Column<int>(type: "INTEGER", nullable: true),
                    DireccionId = table.Column<int>(type: "INTEGER", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Consultorios", x => x.Cuit);
                    table.ForeignKey(
                        name: "FK_Consultorios_Direcciones_DireccionId",
                        column: x => x.DireccionId,
                        principalTable: "Direcciones",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.SetNull);
                    table.ForeignKey(
                        name: "FK_Consultorios_Instituciones_InstitucionId",
                        column: x => x.InstitucionId,
                        principalTable: "Instituciones",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.SetNull);
                });

            migrationBuilder.CreateTable(
                name: "HistoriasClinicas",
                columns: table => new
                {
                    Id = table.Column<int>(type: "INTEGER", nullable: false)
                        .Annotation("Sqlite:Autoincrement", true),
                    PacienteCuil = table.Column<string>(type: "TEXT", nullable: false),
                    Discapacidad = table.Column<string>(type: "TEXT", nullable: false),
                    GrupSang = table.Column<string>(type: "TEXT", nullable: false),
                    Alergias = table.Column<string>(type: "TEXT", nullable: false),
                    EnfermedadesCronicas = table.Column<string>(type: "TEXT", nullable: false),
                    Medicamentos = table.Column<string>(type: "TEXT", nullable: false),
                    NombreContacto = table.Column<string>(type: "TEXT", nullable: false),
                    ApellidoContacto = table.Column<string>(type: "TEXT", nullable: false),
                    TelefonoContacto = table.Column<string>(type: "TEXT", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_HistoriasClinicas", x => x.Id);
                    table.ForeignKey(
                        name: "FK_HistoriasClinicas_Pacientes_PacienteCuil",
                        column: x => x.PacienteCuil,
                        principalTable: "Pacientes",
                        principalColumn: "Cuil",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "PacienteObrasSociales",
                columns: table => new
                {
                    PacienteCuil = table.Column<string>(type: "TEXT", nullable: false),
                    ObraSocialId = table.Column<int>(type: "INTEGER", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_PacienteObrasSociales", x => new { x.PacienteCuil, x.ObraSocialId });
                    table.ForeignKey(
                        name: "FK_PacienteObrasSociales_ObrasSociales_ObraSocialId",
                        column: x => x.ObraSocialId,
                        principalTable: "ObrasSociales",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_PacienteObrasSociales_Pacientes_PacienteCuil",
                        column: x => x.PacienteCuil,
                        principalTable: "Pacientes",
                        principalColumn: "Cuil",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "ProfesionalEspecialidades",
                columns: table => new
                {
                    ProfesionalCuil = table.Column<string>(type: "TEXT", nullable: false),
                    EspecialidadId = table.Column<int>(type: "INTEGER", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ProfesionalEspecialidades", x => new { x.ProfesionalCuil, x.EspecialidadId });
                    table.ForeignKey(
                        name: "FK_ProfesionalEspecialidades_Especialidades_EspecialidadId",
                        column: x => x.EspecialidadId,
                        principalTable: "Especialidades",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_ProfesionalEspecialidades_Profesionales_ProfesionalCuil",
                        column: x => x.ProfesionalCuil,
                        principalTable: "Profesionales",
                        principalColumn: "Cuil",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "ProfesionalEstudios",
                columns: table => new
                {
                    Id = table.Column<int>(type: "INTEGER", nullable: false)
                        .Annotation("Sqlite:Autoincrement", true),
                    ProfesionalCuil = table.Column<string>(type: "TEXT", nullable: false),
                    EstudioId = table.Column<int>(type: "INTEGER", nullable: false),
                    DuracionTurno = table.Column<int>(type: "INTEGER", nullable: false),
                    PrecioParticular = table.Column<decimal>(type: "TEXT", nullable: false),
                    Activo = table.Column<bool>(type: "INTEGER", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ProfesionalEstudios", x => x.Id);
                    table.ForeignKey(
                        name: "FK_ProfesionalEstudios_Estudios_EstudioId",
                        column: x => x.EstudioId,
                        principalTable: "Estudios",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_ProfesionalEstudios_Profesionales_ProfesionalCuil",
                        column: x => x.ProfesionalCuil,
                        principalTable: "Profesionales",
                        principalColumn: "Cuil",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "ProfesionalObrasSociales",
                columns: table => new
                {
                    ProfesionalCuil = table.Column<string>(type: "TEXT", nullable: false),
                    ObraSocialId = table.Column<int>(type: "INTEGER", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ProfesionalObrasSociales", x => new { x.ProfesionalCuil, x.ObraSocialId });
                    table.ForeignKey(
                        name: "FK_ProfesionalObrasSociales_ObrasSociales_ObraSocialId",
                        column: x => x.ObraSocialId,
                        principalTable: "ObrasSociales",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_ProfesionalObrasSociales_Profesionales_ProfesionalCuil",
                        column: x => x.ProfesionalCuil,
                        principalTable: "Profesionales",
                        principalColumn: "Cuil",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "AdministradoresConsultorio",
                columns: table => new
                {
                    Cuil = table.Column<string>(type: "TEXT", nullable: false),
                    UsuarioId = table.Column<int>(type: "INTEGER", nullable: false),
                    ConsultorioCuit = table.Column<string>(type: "TEXT", nullable: false),
                    Nombre = table.Column<string>(type: "TEXT", nullable: false),
                    Apellido = table.Column<string>(type: "TEXT", nullable: false),
                    Telefono = table.Column<string>(type: "TEXT", nullable: false),
                    FechaNacimiento = table.Column<DateTime>(type: "TEXT", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_AdministradoresConsultorio", x => x.Cuil);
                    table.ForeignKey(
                        name: "FK_AdministradoresConsultorio_Consultorios_ConsultorioCuit",
                        column: x => x.ConsultorioCuit,
                        principalTable: "Consultorios",
                        principalColumn: "Cuit",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_AdministradoresConsultorio_Usuarios_UsuarioId",
                        column: x => x.UsuarioId,
                        principalTable: "Usuarios",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "Agendas",
                columns: table => new
                {
                    Id = table.Column<int>(type: "INTEGER", nullable: false)
                        .Annotation("Sqlite:Autoincrement", true),
                    ProfesionalCuil = table.Column<string>(type: "TEXT", nullable: false),
                    ConsultorioCuit = table.Column<string>(type: "TEXT", nullable: false),
                    Dia = table.Column<int>(type: "INTEGER", nullable: false),
                    Mes = table.Column<int>(type: "INTEGER", nullable: false),
                    Anio = table.Column<int>(type: "INTEGER", nullable: false),
                    HoraEntrada = table.Column<TimeSpan>(type: "TEXT", nullable: false),
                    HoraSalida = table.Column<TimeSpan>(type: "TEXT", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Agendas", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Agendas_Consultorios_ConsultorioCuit",
                        column: x => x.ConsultorioCuit,
                        principalTable: "Consultorios",
                        principalColumn: "Cuit",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_Agendas_Profesionales_ProfesionalCuil",
                        column: x => x.ProfesionalCuil,
                        principalTable: "Profesionales",
                        principalColumn: "Cuil",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "ProfesionalConsultorios",
                columns: table => new
                {
                    ProfesionalCuil = table.Column<string>(type: "TEXT", nullable: false),
                    ConsultorioCuit = table.Column<string>(type: "TEXT", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ProfesionalConsultorios", x => new { x.ProfesionalCuil, x.ConsultorioCuit });
                    table.ForeignKey(
                        name: "FK_ProfesionalConsultorios_Consultorios_ConsultorioCuit",
                        column: x => x.ConsultorioCuit,
                        principalTable: "Consultorios",
                        principalColumn: "Cuit",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_ProfesionalConsultorios_Profesionales_ProfesionalCuil",
                        column: x => x.ProfesionalCuil,
                        principalTable: "Profesionales",
                        principalColumn: "Cuil",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "Coberturas",
                columns: table => new
                {
                    Id = table.Column<int>(type: "INTEGER", nullable: false)
                        .Annotation("Sqlite:Autoincrement", true),
                    ProfesionalEstudioId = table.Column<int>(type: "INTEGER", nullable: false),
                    ObraSocialId = table.Column<int>(type: "INTEGER", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Coberturas", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Coberturas_ObrasSociales_ObraSocialId",
                        column: x => x.ObraSocialId,
                        principalTable: "ObrasSociales",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_Coberturas_ProfesionalEstudios_ProfesionalEstudioId",
                        column: x => x.ProfesionalEstudioId,
                        principalTable: "ProfesionalEstudios",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "Asistentes",
                columns: table => new
                {
                    Cuil = table.Column<string>(type: "TEXT", nullable: false),
                    UsuarioId = table.Column<int>(type: "INTEGER", nullable: false),
                    Nombre = table.Column<string>(type: "TEXT", nullable: false),
                    Apellido = table.Column<string>(type: "TEXT", nullable: false),
                    FechaNacimiento = table.Column<DateTime>(type: "TEXT", nullable: false),
                    Telefono = table.Column<string>(type: "TEXT", nullable: false),
                    Genero = table.Column<string>(type: "TEXT", nullable: false),
                    DireccionId = table.Column<int>(type: "INTEGER", nullable: true),
                    InstitucionId = table.Column<int>(type: "INTEGER", nullable: true),
                    ConsultorioCuit = table.Column<string>(type: "TEXT", nullable: true),
                    AdminConsultorioCuil = table.Column<string>(type: "TEXT", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Asistentes", x => x.Cuil);
                    table.ForeignKey(
                        name: "FK_Asistentes_AdministradoresConsultorio_AdminConsultorioCuil",
                        column: x => x.AdminConsultorioCuil,
                        principalTable: "AdministradoresConsultorio",
                        principalColumn: "Cuil",
                        onDelete: ReferentialAction.SetNull);
                    table.ForeignKey(
                        name: "FK_Asistentes_Consultorios_ConsultorioCuit",
                        column: x => x.ConsultorioCuit,
                        principalTable: "Consultorios",
                        principalColumn: "Cuit",
                        onDelete: ReferentialAction.SetNull);
                    table.ForeignKey(
                        name: "FK_Asistentes_Direcciones_DireccionId",
                        column: x => x.DireccionId,
                        principalTable: "Direcciones",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.SetNull);
                    table.ForeignKey(
                        name: "FK_Asistentes_Instituciones_InstitucionId",
                        column: x => x.InstitucionId,
                        principalTable: "Instituciones",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.SetNull);
                    table.ForeignKey(
                        name: "FK_Asistentes_Usuarios_UsuarioId",
                        column: x => x.UsuarioId,
                        principalTable: "Usuarios",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "AsistenteAgendas",
                columns: table => new
                {
                    AsistenteCuil = table.Column<string>(type: "TEXT", nullable: false),
                    AgendaId = table.Column<int>(type: "INTEGER", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_AsistenteAgendas", x => new { x.AsistenteCuil, x.AgendaId });
                    table.ForeignKey(
                        name: "FK_AsistenteAgendas_Agendas_AgendaId",
                        column: x => x.AgendaId,
                        principalTable: "Agendas",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_AsistenteAgendas_Asistentes_AsistenteCuil",
                        column: x => x.AsistenteCuil,
                        principalTable: "Asistentes",
                        principalColumn: "Cuil",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "Citas",
                columns: table => new
                {
                    Id = table.Column<int>(type: "INTEGER", nullable: false)
                        .Annotation("Sqlite:Autoincrement", true),
                    TurnoId = table.Column<int>(type: "INTEGER", nullable: false),
                    PacienteCuil = table.Column<string>(type: "TEXT", nullable: false),
                    Fecha = table.Column<DateTime>(type: "TEXT", nullable: false),
                    Estado = table.Column<int>(type: "INTEGER", nullable: false),
                    Tipo = table.Column<int>(type: "INTEGER", nullable: false),
                    Cobertura = table.Column<int>(type: "INTEGER", nullable: false),
                    EstudioId = table.Column<int>(type: "INTEGER", nullable: true),
                    DocumentoPedidoMedico = table.Column<string>(type: "TEXT", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Citas", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Citas_Estudios_EstudioId",
                        column: x => x.EstudioId,
                        principalTable: "Estudios",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.SetNull);
                    table.ForeignKey(
                        name: "FK_Citas_Pacientes_PacienteCuil",
                        column: x => x.PacienteCuil,
                        principalTable: "Pacientes",
                        principalColumn: "Cuil",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "Cuestionarios",
                columns: table => new
                {
                    Id = table.Column<int>(type: "INTEGER", nullable: false)
                        .Annotation("Sqlite:Autoincrement", true),
                    CitaId = table.Column<int>(type: "INTEGER", nullable: false),
                    Puntualidad = table.Column<int>(type: "INTEGER", nullable: false),
                    Atencion = table.Column<int>(type: "INTEGER", nullable: false),
                    Profesionalismo = table.Column<int>(type: "INTEGER", nullable: false),
                    Comentario = table.Column<string>(type: "TEXT", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Cuestionarios", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Cuestionarios_Citas_CitaId",
                        column: x => x.CitaId,
                        principalTable: "Citas",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "Observaciones",
                columns: table => new
                {
                    Id = table.Column<int>(type: "INTEGER", nullable: false)
                        .Annotation("Sqlite:Autoincrement", true),
                    Motivo = table.Column<string>(type: "TEXT", nullable: false),
                    Detalle = table.Column<string>(type: "TEXT", nullable: false),
                    HistoriaClinicaId = table.Column<int>(type: "INTEGER", nullable: true),
                    ProfesionalCuil = table.Column<string>(type: "TEXT", nullable: true),
                    CitaId = table.Column<int>(type: "INTEGER", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Observaciones", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Observaciones_Citas_CitaId",
                        column: x => x.CitaId,
                        principalTable: "Citas",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_Observaciones_HistoriasClinicas_HistoriaClinicaId",
                        column: x => x.HistoriaClinicaId,
                        principalTable: "HistoriasClinicas",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_Observaciones_Profesionales_ProfesionalCuil",
                        column: x => x.ProfesionalCuil,
                        principalTable: "Profesionales",
                        principalColumn: "Cuil",
                        onDelete: ReferentialAction.SetNull);
                });

            migrationBuilder.CreateTable(
                name: "Turnos",
                columns: table => new
                {
                    Id = table.Column<int>(type: "INTEGER", nullable: false)
                        .Annotation("Sqlite:Autoincrement", true),
                    AgendaId = table.Column<int>(type: "INTEGER", nullable: false),
                    Fecha = table.Column<DateTime>(type: "TEXT", nullable: false),
                    HoraInicio = table.Column<TimeSpan>(type: "TEXT", nullable: false),
                    HoraFin = table.Column<TimeSpan>(type: "TEXT", nullable: false),
                    Estado = table.Column<int>(type: "INTEGER", nullable: false),
                    CitaId = table.Column<int>(type: "INTEGER", nullable: true),
                    RowVersion = table.Column<Guid>(type: "TEXT", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Turnos", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Turnos_Agendas_AgendaId",
                        column: x => x.AgendaId,
                        principalTable: "Agendas",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_Turnos_Citas_CitaId",
                        column: x => x.CitaId,
                        principalTable: "Citas",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.SetNull);
                });

            migrationBuilder.CreateIndex(
                name: "IX_AdministradoresConsultorio_ConsultorioCuit",
                table: "AdministradoresConsultorio",
                column: "ConsultorioCuit");

            migrationBuilder.CreateIndex(
                name: "IX_AdministradoresConsultorio_UsuarioId",
                table: "AdministradoresConsultorio",
                column: "UsuarioId",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_AdministradoresInstitucion_InstitucionId",
                table: "AdministradoresInstitucion",
                column: "InstitucionId");

            migrationBuilder.CreateIndex(
                name: "IX_AdministradoresInstitucion_UsuarioId",
                table: "AdministradoresInstitucion",
                column: "UsuarioId",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_Agendas_ConsultorioCuit",
                table: "Agendas",
                column: "ConsultorioCuit");

            migrationBuilder.CreateIndex(
                name: "IX_Agendas_ProfesionalCuil",
                table: "Agendas",
                column: "ProfesionalCuil");

            migrationBuilder.CreateIndex(
                name: "IX_AsistenteAgendas_AgendaId",
                table: "AsistenteAgendas",
                column: "AgendaId");

            migrationBuilder.CreateIndex(
                name: "IX_Asistentes_AdminConsultorioCuil",
                table: "Asistentes",
                column: "AdminConsultorioCuil");

            migrationBuilder.CreateIndex(
                name: "IX_Asistentes_ConsultorioCuit",
                table: "Asistentes",
                column: "ConsultorioCuit");

            migrationBuilder.CreateIndex(
                name: "IX_Asistentes_DireccionId",
                table: "Asistentes",
                column: "DireccionId");

            migrationBuilder.CreateIndex(
                name: "IX_Asistentes_InstitucionId",
                table: "Asistentes",
                column: "InstitucionId");

            migrationBuilder.CreateIndex(
                name: "IX_Asistentes_UsuarioId",
                table: "Asistentes",
                column: "UsuarioId",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_Citas_EstudioId",
                table: "Citas",
                column: "EstudioId");

            migrationBuilder.CreateIndex(
                name: "IX_Citas_PacienteCuil",
                table: "Citas",
                column: "PacienteCuil");

            migrationBuilder.CreateIndex(
                name: "IX_Citas_TurnoId",
                table: "Citas",
                column: "TurnoId",
                unique: true,
                filter: "\"Estado\" != 5");

            migrationBuilder.CreateIndex(
                name: "IX_Coberturas_ObraSocialId",
                table: "Coberturas",
                column: "ObraSocialId");

            migrationBuilder.CreateIndex(
                name: "IX_Coberturas_ProfesionalEstudioId_ObraSocialId",
                table: "Coberturas",
                columns: new[] { "ProfesionalEstudioId", "ObraSocialId" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_Consultorios_DireccionId",
                table: "Consultorios",
                column: "DireccionId");

            migrationBuilder.CreateIndex(
                name: "IX_Consultorios_InstitucionId",
                table: "Consultorios",
                column: "InstitucionId");

            migrationBuilder.CreateIndex(
                name: "IX_Cuestionarios_CitaId",
                table: "Cuestionarios",
                column: "CitaId",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_Estudios_EspecialidadId",
                table: "Estudios",
                column: "EspecialidadId");

            migrationBuilder.CreateIndex(
                name: "IX_HistoriasClinicas_PacienteCuil",
                table: "HistoriasClinicas",
                column: "PacienteCuil",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_Instituciones_UsuarioId",
                table: "Instituciones",
                column: "UsuarioId",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_Observaciones_CitaId",
                table: "Observaciones",
                column: "CitaId",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_Observaciones_HistoriaClinicaId",
                table: "Observaciones",
                column: "HistoriaClinicaId");

            migrationBuilder.CreateIndex(
                name: "IX_Observaciones_ProfesionalCuil",
                table: "Observaciones",
                column: "ProfesionalCuil");

            migrationBuilder.CreateIndex(
                name: "IX_PacienteObrasSociales_ObraSocialId",
                table: "PacienteObrasSociales",
                column: "ObraSocialId");

            migrationBuilder.CreateIndex(
                name: "IX_Pacientes_DireccionId",
                table: "Pacientes",
                column: "DireccionId");

            migrationBuilder.CreateIndex(
                name: "IX_Pacientes_UsuarioId",
                table: "Pacientes",
                column: "UsuarioId",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_ProfesionalConsultorios_ConsultorioCuit",
                table: "ProfesionalConsultorios",
                column: "ConsultorioCuit");

            migrationBuilder.CreateIndex(
                name: "IX_Profesionales_DireccionId",
                table: "Profesionales",
                column: "DireccionId");

            migrationBuilder.CreateIndex(
                name: "IX_Profesionales_UsuarioId",
                table: "Profesionales",
                column: "UsuarioId",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_ProfesionalEspecialidades_EspecialidadId",
                table: "ProfesionalEspecialidades",
                column: "EspecialidadId");

            migrationBuilder.CreateIndex(
                name: "IX_ProfesionalEstudios_EstudioId",
                table: "ProfesionalEstudios",
                column: "EstudioId");

            migrationBuilder.CreateIndex(
                name: "IX_ProfesionalEstudios_ProfesionalCuil_EstudioId",
                table: "ProfesionalEstudios",
                columns: new[] { "ProfesionalCuil", "EstudioId" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_ProfesionalObrasSociales_ObraSocialId",
                table: "ProfesionalObrasSociales",
                column: "ObraSocialId");

            migrationBuilder.CreateIndex(
                name: "IX_Turnos_AgendaId",
                table: "Turnos",
                column: "AgendaId");

            migrationBuilder.CreateIndex(
                name: "IX_Turnos_CitaId",
                table: "Turnos",
                column: "CitaId");

            migrationBuilder.AddForeignKey(
                name: "FK_Citas_Turnos_TurnoId",
                table: "Citas",
                column: "TurnoId",
                principalTable: "Turnos",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Agendas_Consultorios_ConsultorioCuit",
                table: "Agendas");

            migrationBuilder.DropForeignKey(
                name: "FK_Pacientes_Usuarios_UsuarioId",
                table: "Pacientes");

            migrationBuilder.DropForeignKey(
                name: "FK_Profesionales_Usuarios_UsuarioId",
                table: "Profesionales");

            migrationBuilder.DropForeignKey(
                name: "FK_Agendas_Profesionales_ProfesionalCuil",
                table: "Agendas");

            migrationBuilder.DropForeignKey(
                name: "FK_Turnos_Agendas_AgendaId",
                table: "Turnos");

            migrationBuilder.DropForeignKey(
                name: "FK_Pacientes_Direcciones_DireccionId",
                table: "Pacientes");

            migrationBuilder.DropForeignKey(
                name: "FK_Citas_Estudios_EstudioId",
                table: "Citas");

            migrationBuilder.DropForeignKey(
                name: "FK_Citas_Pacientes_PacienteCuil",
                table: "Citas");

            migrationBuilder.DropForeignKey(
                name: "FK_Citas_Turnos_TurnoId",
                table: "Citas");

            migrationBuilder.DropTable(
                name: "AdministradoresInstitucion");

            migrationBuilder.DropTable(
                name: "AsistenteAgendas");

            migrationBuilder.DropTable(
                name: "Coberturas");

            migrationBuilder.DropTable(
                name: "Cuestionarios");

            migrationBuilder.DropTable(
                name: "Observaciones");

            migrationBuilder.DropTable(
                name: "PacienteObrasSociales");

            migrationBuilder.DropTable(
                name: "ProfesionalConsultorios");

            migrationBuilder.DropTable(
                name: "ProfesionalEspecialidades");

            migrationBuilder.DropTable(
                name: "ProfesionalObrasSociales");

            migrationBuilder.DropTable(
                name: "Asistentes");

            migrationBuilder.DropTable(
                name: "ProfesionalEstudios");

            migrationBuilder.DropTable(
                name: "HistoriasClinicas");

            migrationBuilder.DropTable(
                name: "ObrasSociales");

            migrationBuilder.DropTable(
                name: "AdministradoresConsultorio");

            migrationBuilder.DropTable(
                name: "Consultorios");

            migrationBuilder.DropTable(
                name: "Instituciones");

            migrationBuilder.DropTable(
                name: "Usuarios");

            migrationBuilder.DropTable(
                name: "Profesionales");

            migrationBuilder.DropTable(
                name: "Agendas");

            migrationBuilder.DropTable(
                name: "Direcciones");

            migrationBuilder.DropTable(
                name: "Estudios");

            migrationBuilder.DropTable(
                name: "Especialidades");

            migrationBuilder.DropTable(
                name: "Pacientes");

            migrationBuilder.DropTable(
                name: "Turnos");

            migrationBuilder.DropTable(
                name: "Citas");
        }
    }
}
