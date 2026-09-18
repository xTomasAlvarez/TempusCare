namespace TempusCare.Api.Application.DTOs;

public record AltaHistoriaClinicaDto(
    string PacienteCuil,
    string Discapacidad,
    string GrupSang,
    string Alergias,
    string EnfermedadesCronicas,
    string Medicamentos,
    string NombreContacto,
    string ApellidoContacto,
    string TelefonoContacto
);

public record ModificarHistoriaClinicaDto(
    int Id,
    string Discapacidad,
    string GrupSang,
    string Alergias,
    string EnfermedadesCronicas,
    string Medicamentos,
    string NombreContacto,
    string ApellidoContacto,
    string TelefonoContacto
);

public record HistoriaClinicaResponseDto(
    int Id,
    string PacienteCuil,
    string PacienteNombreCompleto,
    string Discapacidad,
    string GrupSang,
    string Alergias,
    string EnfermedadesCronicas,
    string Medicamentos,
    string NombreContacto,
    string ApellidoContacto,
    string TelefonoContacto,
    List<ObservacionResponseDto> Observaciones
);
