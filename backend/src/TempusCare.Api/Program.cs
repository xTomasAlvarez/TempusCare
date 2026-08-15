using Microsoft.EntityFrameworkCore;
using TempusCare.Api.Application.Services;
using TempusCare.Api.Infrastructure.Data;
using TempusCare.Api.Infrastructure.Middleware;

var builder = WebApplication.CreateBuilder(args);

// Configuración de la base de datos EF Core con SQLite en archivo local (persistente)
builder.Services.AddDbContext<TempusCareDbContext>(options =>
{
    options.UseSqlite("Data Source=tempuscare.db");
});

// Registro de Servicios e Inyección de Dependencias
builder.Services.AddScoped<IAuthService, AuthService>();
builder.Services.AddScoped<IProfesionalService, ProfesionalService>();
builder.Services.AddScoped<IConsultorioService, ConsultorioService>();
builder.Services.AddScoped<IEspecialidadService, EspecialidadService>();
builder.Services.AddScoped<IAgendaService, AgendaService>();
builder.Services.AddScoped<ITurnoCitaService, TurnoCitaService>();
builder.Services.AddScoped<IPerfilPacienteService, PerfilPacienteService>();

builder.Services.AddControllers()
    .AddJsonOptions(options =>
    {
        options.JsonSerializerOptions.Converters.Add(new System.Text.Json.Serialization.JsonStringEnumConverter());
    });

// Configuración de Swagger / OpenAPI
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

var app = builder.Build();

// Habilitar Swagger UI en todos los entornos para pruebas
app.UseSwagger();
app.UseSwaggerUI(c =>
{
    c.SwaggerEndpoint("/swagger/v1/swagger.json", "TempusCare API v1");
    c.RoutePrefix = "swagger"; // Accesible en /swagger
});

// Middleware Global de Excepciones
app.UseMiddleware<ExceptionMiddleware>();

app.UseAuthorization();
app.MapControllers();

// Creación automática de las tablas y Seeding inicial de catálogos en SQLite
using (var scope = app.Services.CreateScope())
{
    var db = scope.ServiceProvider.GetRequiredService<TempusCareDbContext>();
    
    // Asegura la creación física de la base de datos y sus tablas (tempuscare.db)
    db.Database.EnsureCreated();

    if (!db.Especialidades.Any())
    {
        db.Especialidades.AddRange(
            new TempusCare.Api.Domain.Entities.Especialidad { Nombre = "Pediatría", Descripcion = "Atención médica a niños" },
            new TempusCare.Api.Domain.Entities.Especialidad { Nombre = "Cardiología", Descripcion = "Enfermedades del corazón" },
            new TempusCare.Api.Domain.Entities.Especialidad { Nombre = "Dermatología", Descripcion = "Cuidado de la piel" },
            new TempusCare.Api.Domain.Entities.Especialidad { Nombre = "Traumatología", Descripcion = "Sistema osteoarticular" }
        );
    }
    if (!db.ObrasSociales.Any())
    {
        db.ObrasSociales.AddRange(
            new TempusCare.Api.Domain.Entities.ObraSocial { Nombre = "Subsidio de Salud", Catalogo = "Cobertura provincial Tucumán" },
            new TempusCare.Api.Domain.Entities.ObraSocial { Nombre = "OSDE", Catalogo = "Prepaga nacional" },
            new TempusCare.Api.Domain.Entities.ObraSocial { Nombre = "Swiss Medical", Catalogo = "Prepaga nacional" },
            new TempusCare.Api.Domain.Entities.ObraSocial { Nombre = "PAMI", Catalogo = "Jubilados y pensionados" }
        );
    }
    db.SaveChanges();
}

app.Run();
