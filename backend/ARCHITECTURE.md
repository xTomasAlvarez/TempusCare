# TempusCare Backend Architecture & Context Guide

Documento de arquitectura y guía de contexto técnico del backend de **TempusCare** refactorizado y modularizado según las especificaciones de diseño y diagramas UML.

---

## 1. Visión General del Proyecto
**TempusCare** es una plataforma web desarrollada en **C# (.NET 9)** para la autogestión de turnos médicos, administración de instituciones y consultorios, catálogo de estudios médicos y control de coberturas de obras sociales.

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
│       │   │   ├── Receta.cs
│       │   │   ├── Turno.cs
│       │   │   └── Usuario.cs
│       │   └── Enums/                  # Un archivo exclusivo por cada Enum
│       │       ├── CoberturaCita.cs
│       │       ├── EstadoCita.cs
│       │       ├── EstadoProfesional.cs
│       │       ├── EstadoReceta.cs
│       │       ├── EstadoTurno.cs
│       │       ├── RolUsuario.cs
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

## 3. Modelo de Dominio y Coberturas Ternarias

| Entidad | Clave Primaria | Relaciones Clave |
|---|---|---|
| `Usuario` | `Id` (Identity) | 1:1 con `Paciente`, `Profesional` o `Asistente` |
| `Asistente` | `Cuil` (String) | 1:1 `Usuario`, N:1 `Direccion` |
| `Paciente` | `Cuil` (String) | 1:1 `HistoriaClinica`, 1:N `Cita`, N:M `ObraSocial`, N:1 `Direccion` |
| `Profesional` | `Cuil` (String) | N:M `Consultorio`, N:M `Especialidad`, N:M `ObraSocial`, 1:N `ProfesionalEstudio`, 1:N `Agenda`, 1:N `Observacion`, N:1 `Direccion` (Puntuación calculada dinámicamente) |
| `Institucion` | `Id` (Identity) | 1:N `Consultorio` |
| `Consultorio` | `Cuit` (String) | N:1 `Institucion`, N:1 `Direccion`, N:M `Profesional`, 1:N `Agenda` |
| `Estudio` | `Id` (Identity) | 1:N `ProfesionalEstudio` (Catálogo general) |
| `ProfesionalEstudio` | `Id` (Identity) | N:1 `Profesional`, N:1 `Estudio`, 1:N `Cobertura` |
| `Cobertura` | `Id` (Identity) | N:1 `ProfesionalEstudio`, N:1 `ObraSocial` (Relación ternaria) |
| `Agenda` | `Id` (Identity) | N:1 `Profesional`, N:1 `Consultorio`, 1:N `Turno` |
| `Turno` | `Id` (Identity) | N:1 `Agenda`, 1:0..1 `Cita` |
| `Cita` | `Id` (Identity) | 1:1 `Turno`, N:1 `Paciente`, 1:0..1 `Observacion`, 1:0..1 `Cuestionario`, 1:N `Receta` |
| `HistoriaClinica` | `Id` (Identity) | 1:1 `Paciente`, 1:N `Observacion` |
| `Observacion` | `Id` (Identity) | N:1 `HistoriaClinica`, N:1 `Profesional`, 1:0..1 `Cita` |

---

## 4. Reglas de Negocio Implementadas

- **RN-01 (Solapamiento de Agendas/Turnos)**: `AgendaService` valida que un profesional no pueda tener agendas superpuestas en la misma franja horaria.
- **RN-02 (Disponibilidad de Reserva)**: `CitaService` exige que el `Turno` esté en estado `Disponible` para confirmar una `Cita`. Evita doble agendamiento.
- **RN-04 (Validación de Obra Social y Estudios)**: Si el paciente reserva con una obra social no aceptada por el médico o para ese estudio, el sistema asigna `CoberturaCita.Particular` en lugar de bloquear la atención.
- **RN-06 & Ciclo de Vida Cita-Turno**:
  - Si un paciente o secretaría **cancela la cita**, el `Turno` recupera el estado `Disponible`.
  - Si el médico **cancela el turno**, la `Cita` asociada se cancela automáticamente.
- **Puntuación Dinámica**: Se calcula dinámicamente mediante el promedio de los cuestionarios registrados (puntualidad, atención y profesionalismo), sin persistir columna fija en base de datos.
- **Búsqueda por Matrícula**: El endpoint de agendas y profesionales permite búsqueda y filtrado por número de matrícula además de CUIL.
- **Dirección Dinámica**: Localidades y Códigos Postales configurables de forma abierta.
