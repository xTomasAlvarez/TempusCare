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

app.UseAuthorization();
app.MapControllers();

// Creación automática de las tablas y Seeding inicial de catálogos en SQLite
using (var scope = app.Services.CreateScope())
{
    var db = scope.ServiceProvider.GetRequiredService<TempusCareDbContext>();
    
    // Asegura la creación física de la base de datos y sus tablas (tempuscare.db)
    db.Database.EnsureCreated();

    if (!db.Instituciones.Any())
    {
        db.Instituciones.AddRange(
            new TempusCare.Api.Domain.Entities.Institucion { Nombre = "Sanatorio Tucumán", Cuit = "30111222334", Email = "contacto@sanatoriotucuman.com" },
            new TempusCare.Api.Domain.Entities.Institucion { Nombre = "Clínica Mayo", Cuit = "30555666778", Email = "info@clinicamayo.com" }
        );
        db.SaveChanges();
    }

    if (!db.Especialidades.Any())
    {
        var espPediatria = new TempusCare.Api.Domain.Entities.Especialidad { Nombre = "Pediatría", Descripcion = "Atención médica a niños" };
        var espCardio = new TempusCare.Api.Domain.Entities.Especialidad { Nombre = "Cardiología", Descripcion = "Enfermedades del corazón" };
        var espDerma = new TempusCare.Api.Domain.Entities.Especialidad { Nombre = "Dermatología", Descripcion = "Cuidado de la piel" };
        var espTrauma = new TempusCare.Api.Domain.Entities.Especialidad { Nombre = "Traumatología", Descripcion = "Sistema osteoarticular" };
        var espImagenes = new TempusCare.Api.Domain.Entities.Especialidad { Nombre = "Diagnóstico por Imágenes", Descripcion = "Ecografías, resonancias y estudios por imágenes" };

        db.Especialidades.AddRange(espPediatria, espCardio, espDerma, espTrauma, espImagenes);
        db.SaveChanges();

        if (!db.Estudios.Any())
        {
            db.Estudios.AddRange(
                new TempusCare.Api.Domain.Entities.Estudio { Nombre = "Ecografía Abdominal", Descripcion = "Ultrasonido de abdomen", Duracion = 30, Preparacion = "Ayuno de 6 horas", EspecialidadId = espImagenes.Id },
                new TempusCare.Api.Domain.Entities.Estudio { Nombre = "Resonancia Magnética", Descripcion = "Estudio por resonancia", Duracion = 60, Preparacion = "Sin objetos metálicos", EspecialidadId = espImagenes.Id },
                new TempusCare.Api.Domain.Entities.Estudio { Nombre = "Doppler Mamario", Descripcion = "Ultrasonido doppler mamario", Duracion = 30, Preparacion = "Sin desodorante", EspecialidadId = espImagenes.Id },
                new TempusCare.Api.Domain.Entities.Estudio { Nombre = "Electrocardiograma", Descripcion = "Registro de actividad cardíaca", Duracion = 30, Preparacion = "Ninguna", EspecialidadId = espCardio.Id }
            );
            db.SaveChanges();
        }
    }
    else if (!db.Estudios.Any())
    {
        db.Estudios.AddRange(
            new TempusCare.Api.Domain.Entities.Estudio { Nombre = "Ecografía Abdominal", Descripcion = "Ultrasonido de abdomen", Duracion = 30, Preparacion = "Ayuno de 6 horas" },
            new TempusCare.Api.Domain.Entities.Estudio { Nombre = "Resonancia Magnética", Descripcion = "Estudio por resonancia", Duracion = 60, Preparacion = "Sin objetos metálicos" },
            new TempusCare.Api.Domain.Entities.Estudio { Nombre = "Electrocardiograma", Descripcion = "Registro de actividad cardíaca", Duracion = 30, Preparacion = "Ninguna" }
        );
        db.SaveChanges();
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
