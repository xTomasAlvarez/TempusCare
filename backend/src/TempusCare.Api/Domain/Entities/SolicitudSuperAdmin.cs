using System;

namespace TempusCare.Api.Domain.Entities;

/// <summary>
/// Entidad para el flujo de consenso multipartito en la creación de Super Administradores.
/// Requiere que un Super Admin A proponga a un usuario, y un Super Admin C (tercero independiente) apruebe.
/// </summary>
public class SolicitudSuperAdmin
{
    public int Id { get; set; }
    public string EmailPropuesto { get; set; } = string.Empty;
    public int ProponenteId { get; set; }
    public int? AprobadorId { get; set; }
    public string Estado { get; set; } = "Pendiente"; // "Pendiente", "Aprobada", "Rechazada"
    public DateTime FechaCreacion { get; set; } = DateTime.UtcNow;
    public DateTime? FechaResolucion { get; set; }

    // Navigation properties
    public Usuario? Proponente { get; set; }
    public Usuario? Aprobador { get; set; }
}
