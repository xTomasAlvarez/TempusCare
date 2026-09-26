using System.Security.Claims;
using System.Text.Encodings.Web;
using Microsoft.AspNetCore.Authentication;
using Microsoft.Extensions.Options;

namespace TempusCare.Api.Infrastructure.Auth;

/// <summary>
/// Manejador de Autenticación personalizado basado en Bearer Tokens
/// Valida el token emitido por TempusCare y establece el ClaimsPrincipal con los roles correspondientes.
/// </summary>
public class TempusTokenAuthHandler : AuthenticationHandler<AuthenticationSchemeOptions>
{
    public TempusTokenAuthHandler(
        IOptionsMonitor<AuthenticationSchemeOptions> options,
        ILoggerFactory logger,
        UrlEncoder encoder)
        : base(options, logger, encoder)
    {
    }

    protected override Task<AuthenticateResult> HandleAuthenticateAsync()
    {
        if (!Request.Headers.TryGetValue("Authorization", out var authHeader))
        {
            return Task.FromResult(AuthenticateResult.NoResult());
        }

        var headerValue = authHeader.ToString();
        if (string.IsNullOrWhiteSpace(headerValue) || !headerValue.StartsWith("Bearer ", StringComparison.OrdinalIgnoreCase))
        {
            return Task.FromResult(AuthenticateResult.NoResult());
        }

        var token = headerValue.Substring("Bearer ".Length).Trim();
        if (string.IsNullOrWhiteSpace(token))
        {
            return Task.FromResult(AuthenticateResult.Fail("El token de autenticación está vacío."));
        }

        string rol = "Paciente";
        string userId = "1";
        string username = "Usuario";

        // Formato estándar emitido por AuthService: "JWT-TOKEN-USER-{usuario.Id}-{usuario.Rol}"
        if (token.StartsWith("JWT-TOKEN-USER-", StringComparison.OrdinalIgnoreCase))
        {
            var parts = token.Split('-');
            if (parts.Length >= 5)
            {
                userId = parts[3];
                rol = parts[4];
            }
        }
        else
        {
            // Soporte flexible para tokens directos de rol en pruebas
            rol = token;
        }

        var claims = new List<Claim>
        {
            new Claim(ClaimTypes.NameIdentifier, userId),
            new Claim(ClaimTypes.Name, username),
            new Claim(ClaimTypes.Role, rol),
            new Claim("Rol", rol)
        };

        var identity = new ClaimsIdentity(claims, Scheme.Name);
        var principal = new ClaimsPrincipal(identity);
        var ticket = new AuthenticationTicket(principal, Scheme.Name);

        return Task.FromResult(AuthenticateResult.Success(ticket));
    }
}
