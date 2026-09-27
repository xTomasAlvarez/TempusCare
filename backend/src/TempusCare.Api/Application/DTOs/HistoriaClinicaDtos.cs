using System.ComponentModel.DataAnnotations;

namespace TempusCare.Api.Application.DTOs;

public record AltaHistoriaClinicaDto(
    [Required, RegularExpression(@"^\d{11}$", ErrorMessage = "El CUIL del paciente debe ser exactamente una cadena numérica de 11 dígitos.")]
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
