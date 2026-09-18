namespace TempusCare.Api.Domain.Entities;

public class Cuestionario
{
    public int Id { get; set; }
    public int CitaId { get; set; }
    public Cita? Cita { get; set; }

    public int Puntualidad { get; set; } // 1 a 5
    public int Atencion { get; set; }   // 1 a 5
    public int Profesionalismo { get; set; } // 1 a 5
    public string? Comentario { get; set; }
}
