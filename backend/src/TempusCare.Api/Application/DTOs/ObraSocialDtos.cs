namespace TempusCare.Api.Application.DTOs;

public record AltaObraSocialDto(string Nombre, string Catalogo);
public record ModificarObraSocialDto(int Id, string Nombre, string Catalogo);
public record ObraSocialDto(int Id, string Nombre, string Catalogo);
