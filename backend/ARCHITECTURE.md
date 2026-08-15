# TempusCare Backend Architecture & Context Guide

Documento de arquitectura y guía de contexto técnico del backend de **TempusCare** para futuras sesiones de desarrollo con Inteligencia Artificial.

---

## 1. Visión General del Proyecto
**TempusCare** es una plataforma web desarrollada en **C# (.NET 9)** para la autogestión de turnos médicos en consultorios privados de San Miguel de Tucumán. Se basa estrictamente en la arquitectura de dominio, especificación de requerimientos (SRS) y diagramas de secuencia provistos.

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
│       │   ├── Entities/
│       │   │   └── Entities.cs         # Modelo de Dominio (Usuario, Paciente, Profesional, Consultorio, Agenda, Turno, Cita, etc.)
│       │   └── Enums/
│       │       └── DomainEnums.cs      # Estados, Roles, Tipos de Cita y Cobertura
│       ├── Application/
│       │   ├── DTOs/
│       │   │   └── Dtos.cs             # DTOs de Requests y Responses
│       │   ├── Exceptions/
│       │   │   └── BusinessException.cs # Excepciones de negocio (NotFound, Conflict, Validation)
│       │   └── Services/
│       │       └── Services.cs         # Implementación de lógica de negocio y reglas de negocio
│       ├── Infrastructure/
│       │   ├── Data/
│       │   │   └── TempusCareDbContext.cs # EF Core DbContext, mapeo de cardinalidades y claves
│       │   └── Middleware/
│       │       └── ExceptionMiddleware.cs # Middleware global de captura y formateo de errores
│       └── Controllers/
│           └── Controllers.cs          # Endpoints API REST (Auth, Profesionales, Consultorios, Agendas, Turnos, Citas, Perfiles)
└── tests/
    └── TempusCare.Tests/
        └── BusinessRulesTests.cs       # Pruebas unitarias/integradas de reglas de negocio críticas
```

---

## 3. Modelo de Dominio y Mapeo Relacional

| Entidad | Clave Primaria | Relaciones Clave |
|---|---|---|
| `Usuario` | `Id` (Identity) | 1:1 con `Paciente` o `Profesional` |
| `Paciente` | `Cuil` (String) | 1:1 `HistoriaClinica`, 1:N `Cita`, N:M `ObraSocial` |
| `Profesional` | `Cuil` (String) | N:M `Consultorio`, N:M `Especialidad`, N:M `ObraSocial`, 1:N `Agenda` |
| `Consultorio` | `Cuit` (String) | 1:1 `Direccion`, N:M `Profesional`, 1:N `Agenda` |
| `Agenda` | `Id` (Identity) | N:1 `Profesional`, N:1 `Consultorio`, 1:N `Turno` |
| `Turno` | `Id` (Identity) | N:1 `Agenda`, 1:0..1 `Cita` |
| `Cita` | `Id` (Identity) | 1:1 `Turno`, N:1 `Paciente`, 1:0..1 `Observacion`, 1:0..1 `Cuestionario` |
| `Especialidad` | `Id` (Identity) | N:M `Profesional` |
| `ObraSocial` | `Id` (Identity) | N:M `Profesional`, N:M `Paciente` |

---

## 4. Reglas de Negocio Implementadas

- **RN-01 (Solapamiento de Agendas/Turnos)**: `AgendaService` valida que un profesional no pueda tener agendas superpuestas en la misma franja horaria.
- **RN-02 (Disponibilidad de Reserva)**: `TurnoCitaService` exige que el `Turno` esté en estado `Disponible` para confirmar una `Cita`. Evita doble agendamiento.
- **RN-04 (Validación de Obra Social)**: Si el paciente reserva con una obra social no aceptada por el médico, el sistema registra la reserva con `CoberturaCita.Particular` en lugar de bloquear la atención.
- **RN-06 & Ciclo de Vida Cita-Turno**:
  - Si un paciente o secretaría **cancela la cita**, el `Turno` recupera el estado `Disponible` para ser utilizado por otro paciente.
  - Si el médico **cancela el turno**, la `Cita` asociada se cancela automáticamente.
- **Calificación Dinámica**: `CompletarCuestionario` registra puntualidad, atención y profesionalismo (1 a 5) y actualiza el promedio del `Profesional.Puntuacion`.

---

## 5. Matriz de Endpoints REST API

### Autenticación (`/api/auth`)
- `POST /api/auth/registrar`: Registro de nuevos usuarios diferenciando rol.
- `POST /api/auth/iniciar-sesion`: Autenticación y obtención de credenciales/token.

### Profesionales (`/api/profesionales`)
- `POST /api/profesionales`: Alta de profesional vinculando especialidades, consultorios y obras sociales.
- `PUT /api/profesionales/{cuil}`: Modificación de profesional.
- `DELETE /api/profesionales/{cuil}`: Baja lógica de profesional (Estado `Inactivo`).
- `GET /api/profesionales`: Consulta con filtros opcionales por especialidad, obra social y consultorio.
- `GET /api/profesionales/{cuil}`: Detalle de profesional por CUIL.

### Consultorios (`/api/consultorios`)
- `POST /api/consultorios`: Alta de consultorio con dirección y profesionales asociados.
- `PUT /api/consultorios/{cuit}`: Modificación de consultorio.
- `DELETE /api/consultorios/{cuit}`: Baja de consultorio.
- `GET /api/consultorios`: Listado institucional de consultorios.

### Agendas y Turnos (`/api/agendas`, `/api/turnos`)
- `POST /api/agendas`: Configuración de agenda y generación automática de turnos en la franja horaria.
- `GET /api/turnos/disponibles`: Búsqueda de turnos libres filtrables por profesional y fecha.
- `PUT /api/turnos/{id}`: Modificación/cancelación de turno por el médico.

### Citas (`/api/citas`)
- `POST /api/citas`: Reserva directa de cita médica.
- `PUT /api/citas/{id}/estado`: Cambio de estado (Confirmada, Atendida, Ausente, Cancelada).
- `POST /api/citas/{id}/cuestionario`: Encuesta de atención post-cita.
- `POST /api/citas/{id}/observacion`: Carga de motivo y detalle de la consulta por parte del profesional.

---

## 6. Comandos de Ejecución y Pruebas

### Compilación del Proyecto
```bash
dotnet build backend/TempusCare.sln
```

### Ejecución de Pruebas Unitarias/Integradas
```bash
dotnet test backend/TempusCare.sln
```

### Ejecución de la API REST
```bash
dotnet run --project backend/src/TempusCare.Api/TempusCare.Api.csproj
```
