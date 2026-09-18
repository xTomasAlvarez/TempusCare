namespace TempusCare.Api.Domain.Entities;

public class Direccion
{
    public int Id { get; set; }
    public string Pais { get; set; } = "Argentina";
    public string Provincia { get; set; } = string.Empty;
    public string Localidad { get; set; } = string.Empty;
    public string Calle { get; set; } = string.Empty;
    public string Nro { get; set; } = string.Empty;
    public string? Depto { get; set; }
    public string CodPostal { get; set; } = string.Empty;
}
