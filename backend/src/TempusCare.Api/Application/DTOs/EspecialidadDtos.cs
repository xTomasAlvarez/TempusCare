namespace TempusCare.Api.Application.DTOs;

public record AltaEspecialidadDto(string Nombre, string Descripcion);
public record ModificarEspecialidadDto(int Id, string Nombre, string Descripcion);
public record EspecialidadDto(int Id, string Nombre, string Descripcion);
