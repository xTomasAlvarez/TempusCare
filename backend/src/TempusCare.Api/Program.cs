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

// Configuración de Autenticación basada en Bearer Tokens y Control de Acceso RBAC
builder.Services.AddAuthentication("Bearer")
    .AddScheme<AuthenticationSchemeOptions, TempusTokenAuthHandler>("Bearer", options => { });

builder.Services.AddAuthorization();

builder.Services.AddControllers()
    .AddJsonOptions(options =>
    {
        options.JsonSerializerOptions.Converters.Add(new System.Text.Json.Serialization.JsonStringEnumConverter());
    });

// Configuración de CORS para permitir consumo desde el frontend
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowAll", policy =>
    {
        policy.AllowAnyOrigin()
              .AllowAnyMethod()
              .AllowAnyHeader();
    });
});

// Configuración de Swagger / OpenAPI
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

var app = builder.Build();

// Habilitar CORS
app.UseCors("AllowAll");

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
}

app.Run();
