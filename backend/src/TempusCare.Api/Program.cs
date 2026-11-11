using Microsoft.AspNetCore.Authentication;
using Microsoft.EntityFrameworkCore;
using TempusCare.Api.Application.Services;
using TempusCare.Api.Infrastructure.Auth;
using TempusCare.Api.Infrastructure.Data;
using TempusCare.Api.Infrastructure.Middleware;

var builder = WebApplication.CreateBuilder(args);

// Configuración de la base de datos EF Core con SQLite en archivo local (persistente)
builder.Services.AddDbContext<TempusCareDbContext>(options =>
{
    options.UseSqlite("Data Source=tempuscare.db");
    options.ConfigureWarnings(warnings => warnings.Ignore(Microsoft.EntityFrameworkCore.Diagnostics.RelationalEventId.PendingModelChangesWarning));
});

// Registro de Servicios e Inyección de Dependencias
builder.Services.AddScoped<IAuthService, AuthService>();
builder.Services.AddScoped<IProfesionalService, ProfesionalService>();
builder.Services.AddScoped<IPacienteService, PacienteService>();
builder.Services.AddScoped<IAsistenteService, AsistenteService>();
builder.Services.AddScoped<IInstitucionService, InstitucionService>();
builder.Services.AddScoped<IConsultorioService, ConsultorioService>();
builder.Services.AddScoped<IEstudioService, EstudioService>();
builder.Services.AddScoped<IEspecialidadService, EspecialidadService>();
builder.Services.AddScoped<IObraSocialService, ObraSocialService>();
builder.Services.AddScoped<IAgendaService, AgendaService>();
builder.Services.AddScoped<ITurnoService, TurnoService>();
builder.Services.AddScoped<ICitaService, CitaService>();
builder.Services.AddScoped<IAdministradorService, AdministradorService>();
builder.Services.AddScoped<IHistoriaClinicaService, HistoriaClinicaService>();
builder.Services.AddScoped<ICuestionarioService, CuestionarioService>();
builder.Services.AddScoped<IObservacionService, ObservacionService>();
builder.Services.AddScoped<IVitalityService, VitalityService>();

// Configuración de Autenticación basada en Bearer Tokens y Control de Acceso RBAC
builder.Services.AddAuthentication("Bearer")
    .AddScheme<AuthenticationSchemeOptions, TempusTokenAuthHandler>("Bearer", options => { });

builder.Services.AddAuthorization();

builder.Services.AddControllers()
    .AddJsonOptions(options =>
    {
        options.JsonSerializerOptions.Converters.Add(new System.Text.Json.Serialization.JsonStringEnumConverter());
    })
    .ConfigureApiBehaviorOptions(options =>
    {
        var builtInFactory = options.InvalidModelStateResponseFactory;
        options.InvalidModelStateResponseFactory = context =>
        {
            var logger = context.HttpContext.RequestServices.GetRequiredService<ILogger<Program>>();
            var errors = context.ModelState
                .Where(e => e.Value?.Errors.Count > 0)
                .Select(e => $"{e.Key}: {string.Join(", ", e.Value!.Errors.Select(er => er.ErrorMessage))}");
            logger.LogWarning("Validación HTTP 400 fallida en {Method} {Path} -> {Errors}",
                context.HttpContext.Request.Method,
                context.HttpContext.Request.Path,
                string.Join(" | ", errors));
            return builtInFactory(context);
        };
    });

// RNF-SEG-05: Servicio automático de copias de seguridad diarias de SQLite
builder.Services.AddHostedService<DatabaseBackupService>();

// RNF-SEG-04 (OWASP): Configuración de CORS restringida a orígenes de confianza (sin comodín abierto indiscriminado)
var configuredOrigins = builder.Configuration.GetSection("Cors:AllowedOrigins").Get<string[]>() ?? new[]
{
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    "http://localhost:3000",
    "http://127.0.0.1:3000",
    "http://localhost:5044"
};

builder.Services.AddCors(options =>
{
    options.AddPolicy("TempusCareSecureCors", policy =>
    {
        policy.SetIsOriginAllowed(origin =>
              {
                  if (string.IsNullOrWhiteSpace(origin)) return false;
                  if (configuredOrigins.Contains(origin, StringComparer.OrdinalIgnoreCase)) return true;
                  if (Uri.TryCreate(origin, UriKind.Absolute, out var uri))
                  {
                      return uri.Host.Equals("localhost", StringComparison.OrdinalIgnoreCase) ||
                             uri.Host.Equals("127.0.0.1", StringComparison.OrdinalIgnoreCase);
                  }
                  return false;
              })
              .AllowAnyMethod()
              .AllowAnyHeader()
              .AllowCredentials();
    });
});

// Configuración de Swagger / OpenAPI
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

var app = builder.Build();

// Habilitar política segura de CORS (RNF-SEG-04)
app.UseCors("TempusCareSecureCors");

// RNF-SEG-04 (OWASP): Capa de Seguridad HTTP (Cabeceras contra XSS, CSRF, Clickjacking, CSP y MIME Sniffing)
app.Use(async (context, next) =>
{
    context.Response.Headers["X-Content-Type-Options"] = "nosniff";
    context.Response.Headers["X-Frame-Options"] = "DENY";
    context.Response.Headers["X-XSS-Protection"] = "1; mode=block";
    context.Response.Headers["Referrer-Policy"] = "strict-origin-when-cross-origin";
    context.Response.Headers["Permissions-Policy"] = "camera=(), microphone=(), geolocation=(self)";
    context.Response.Headers["Content-Security-Policy"] = "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; frame-ancestors 'none';";
    await next();
});

// Habilitar Swagger UI en todos los entornos para pruebas
app.UseSwagger();
app.UseSwaggerUI(c =>
{
    c.SwaggerEndpoint("/swagger/v1/swagger.json", "TempusCare API v1");
    c.RoutePrefix = "swagger"; // Accesible en /swagger
});

// Middleware Global de Excepciones
app.UseMiddleware<ExceptionMiddleware>();

app.UseAuthentication();
app.UseAuthorization();
app.MapControllers();

// Creación automática de las tablas y Seeding inicial de datos realistas en SQLite
using (var scope = app.Services.CreateScope())
{
    var db = scope.ServiceProvider.GetRequiredService<TempusCareDbContext>();
    
    // Asegura la aplicación de las migraciones de EF Core sobre SQLite (tempuscare.db)
    db.Database.Migrate();

    // Inicialización y sembrado de datos realistas (médicos por especialidad, estudios, etc.)
    DbInitializer.Initialize(db);

    // RNF-SEG-05: Generar copia de seguridad diaria inicial al arrancar la plataforma
    DatabaseBackupService.ExecuteDailyBackup(
        "tempuscare.db",
        Path.Combine(AppContext.BaseDirectory, "backups")
    );
}

app.Run();
