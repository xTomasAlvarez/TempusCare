# TempusCare Backend Architecture & Context Guide

Documento de arquitectura y guía de contexto técnico del backend de **TempusCare** refactorizado y modularizado según las especificaciones de requerimientos del Trabajo Final Integrador (SRS).

---

## 1. Visión General del Proyecto
**TempusCare** es una plataforma web desarrollada en **C# (.NET 9)** para la autogestión de turnos médicos, administración jerárquica de instituciones y consultorios, catálogo de estudios médicos y control de coberturas de obras sociales bajo un modelo inclusivo y accesible.

---

## 2. Estructura de Proyectos y Directorios
```
backend/
├── TempusCare.sln
├── ARCHITECTURE.md
├── src/
│   └── TempusCare.Api/
│       ├── Program.cs
│       ├── Domain/
│       │   ├── Entities/               # Un archivo exclusivo por cada Entidad
│       │   │   ├── AdministradorConsultorio.cs # Admin de sede/consultorio
│       │   │   ├── AdministradorInstitucion.cs # Admin de institución médica
│       │   │   ├── Agenda.cs
│       │   │   ├── Asistente.cs
│       │   │   ├── Cita.cs
│       │   │   ├── Cobertura.cs
│       │   │   ├── Consultorio.cs
│       │   │   ├── Cuestionario.cs
│       │   │   ├── Direccion.cs
│       │   │   ├── Especialidad.cs
│       │   │   ├── Estudio.cs
│       │   │   ├── HistoriaClinica.cs
│       │   │   ├── Institucion.cs
│       │   │   ├── ObraSocial.cs
│       │   │   ├── Observacion.cs
│       │   │   ├── Paciente.cs
│       │   │   ├── PacienteObraSocial.cs
│       │   │   ├── Profesional.cs
│       │   │   ├── ProfesionalConsultorio.cs
│       │   │   ├── ProfesionalEspecialidad.cs
│       │   │   ├── ProfesionalEstudio.cs
│       │   │   ├── ProfesionalObraSocial.cs
│       │   │   ├── Turno.cs
│       │   │   └── Usuario.cs
│       │   └── Enums/                  # Un archivo exclusivo por cada Enum
│       │       ├── CoberturaCita.cs
│       │       ├── EstadoCita.cs
│       │       ├── EstadoProfesional.cs
│       │       ├── EstadoTurno.cs
│       │       ├── RolUsuario.cs       # Paciente, Profesional, Asistente, AdminConsultorio, AdminInstitucion, SuperAdmin
│       │       └── TipoCita.cs
│       ├── Application/
│       │   ├── DTOs/                   # DTOs divididos por entidad y casos de uso
│       │   ├── Exceptions/             # Excepciones individuales tipadas por entidad
│       │   └── Services/               # Interfaces e implementaciones de servicios por entidad
│       ├── Infrastructure/
│       │   ├── Data/
│       │   │   └── TempusCareDbContext.cs # EF Core DbContext
│       │   └── Middleware/
│       │       └── ExceptionMiddleware.cs # Middleware global estandarizado con internalErrorCode {source}-{code}
│       └── Controllers/                # Controladores REST aislados por entidad
└── tests/
    └── TempusCare.Tests/
        └── BusinessRulesTests.cs       # Pruebas unitarias de cobertura y reglas de negocio
```

---

## 3. Modelo de Dominio, Jerarquía de Roles y Relaciones

### Jerarquía de Roles de Administración
1. **Super Administrador (Vitality)**: Crea las cuentas matrices de las Instituciones y administra los catálogos globales (Especialidades, Estudios, Obras Sociales).
2. **Administrador de Institución**: Gestiona las sedes (Consultorios) asociadas a su Institución y da de alta a los administradores de cada sede.
3. **Administrador de Consultorio / Sede**: Responsable del ABM básico del personal operativo (Asistentes) y de los médicos de su sede.
4. **Asistente (Secretaría)**: Núcleo operativo del consultorio. Gestiona agendas, turnos, atención de recepción y configura los estudios que realiza el profesional junto a sus coberturas aceptadas (`ProfesionalEstudio` + `Coberturas`).
5. **Médico / Profesional**: Consulta agendas, atiende citas médicas, registra la evolución y observaciones en la Historia Clínica del paciente.
6. **Paciente**: Consulta médicos (por nombre, especialidad, obra social y sede), reserva turnos, cancela citas y responde cuestionarios de satisfacción.

### Entidades Principales

| Entidad | Clave Primaria | Relaciones Clave |
|---|---|---|
| `Usuario` | `Id` (Identity) | 1:1 con `Paciente`, `Profesional`, `Asistente`, `AdministradorInstitucion` o `AdministradorConsultorio` |
| `AdministradorInstitucion` | `Cuil` (String) | 1:1 `Usuario`, N:1 `Institucion` |
| `AdministradorConsultorio` | `Cuil` (String) | 1:1 `Usuario`, N:1 `Consultorio` |
| `Asistente` | `Cuil` (String) | 1:1 `Usuario`, N:1 `Direccion`, N:1 `Consultorio` |
| `Paciente` | `Cuil` (String) | 1:1 `HistoriaClinica`, 1:N `Cita`, N:M `ObraSocial`, N:1 `Direccion` |
| `Profesional` | `Cuil` (String) | N:M `Consultorio`, N:M `Especialidad`, N:M `ObraSocial`, 1:N `ProfesionalEstudio`, 1:N `Agenda`, 1:N `Observacion`, N:1 `Direccion` (Puntuación dinámica) |
| `Institucion` | `Id` (Identity) | 1:N `Consultorio`, 1:N `AdministradorInstitucion` |
| `Consultorio` | `Cuit` (String) | N:1 `Institucion`, N:1 `Direccion`, N:M `Profesional`, 1:N `Agenda`, 1:N `AdministradorConsultorio`, 1:N `Asistente` |
| `Estudio` | `Id` (Identity) | 1:N `ProfesionalEstudio` (Catálogo general administrado por SuperAdmin) |
| `ProfesionalEstudio` | `Id` (Identity) | N:1 `Profesional`, N:1 `Estudio`, 1:N `Cobertura` (Configurado por Asistente) |
| `Cobertura` | `Id` (Identity) | N:1 `ProfesionalEstudio`, N:1 `ObraSocial` (Relación ternaria de precios y copagos) |
| `Agenda` | `Id` (Identity) | N:1 `Profesional`, N:1 `Consultorio`, 1:N `Turno` |
| `Turno` | `Id` (Identity) | N:1 `Agenda`, 1:0..1 `Cita` |
| `Cita` | `Id` (Identity) | 1:1 `Turno`, N:1 `Paciente`, 1:0..1 `Observacion`, 1:0..1 `Cuestionario` |
| `HistoriaClinica` | `Id` (Identity) | 1:1 `Paciente`, 1:N `Observacion` |
| `Observacion` | `Id` (Identity) | N:1 `HistoriaClinica`, N:1 `Profesional`, 1:0..1 `Cita` |
| `Cuestionario` | `Id` (Identity) | 1:1 `Cita` (Puntualidad, Atención, Profesionalismo, Instalaciones) |

---

## 4. Reglas de Negocio Implementadas

- **RN-01 (Solapamiento de Agendas/Turnos)**: `AgendaService` valida que un profesional no pueda tener agendas superpuestas en la misma franja horaria en diferentes consultorios.
- **RN-02 (Disponibilidad de Reserva)**: `CitaService` exige que el `Turno` esté en estado `Disponible` para confirmar una `Cita`. Evita doble agendamiento.
- **RN-03 (Puntuación Dinámica)**: Se calcula dinámicamente mediante el promedio de los cuestionarios registrados (puntualidad, atención y profesionalismo), sin persistir columna estática en base de datos.
- **RN-04 (Historia Clínica Unificada)**: Registro clínico unificado vinculado al paciente (sin duplicar datos de contacto); las evoluciones se guardan como `Observaciones`.
- **Ciclo de Vida Cita-Turno**:
  - Si un paciente o secretaría **cancela la cita**, el `Turno` recupera el estado `Disponible`.
  - Si el médico **cancela el turno**, la `Cita` asociada se cancela automáticamente.
- **Búsqueda Médica por Nombre y Filtros**:
  - Los pacientes buscan profesionales por nombre/apellido y filtran por especialidad, obra social o consultorio/ubicación. Ya no se expone ni requiere matrícula para la búsqueda.
- **Parametrización Operativa por Asistente**:
  - El Asistente parametriza los estudios que realiza el profesional y las obras sociales que acepta mediante `POST api/profesionales/{cuil}/estudios`.
