using System.Net;
using System.Text.Json;

namespace TempusCare.Api.Infrastructure.Middleware;

public class ExceptionMiddleware
{
    private readonly RequestDelegate _next;
    private readonly ILogger<ExceptionMiddleware> _logger;

    public ExceptionMiddleware(RequestDelegate next, ILogger<ExceptionMiddleware> logger)
    {
        _next = next;
        _logger = logger;
    }

    public async Task InvokeAsync(HttpContext context)
    {
        try
        {
            await _next(context);
        }
        catch (Exception e)
        {
            _logger.LogError(e, "Exception handled by middleware: {Message}", e.Message);
            context.Response.ContentType = "application/json";

            var statusCode = e switch
            {
                Application.Exceptions.EntityNotFoundException => HttpStatusCode.NotFound,
                Application.Exceptions.ArgumentOutOfRangeException => HttpStatusCode.BadRequest,
                Application.Exceptions.NotAuthenticatedException => HttpStatusCode.BadRequest,
                Application.Exceptions.NoContentException => HttpStatusCode.BadRequest,
                Application.Exceptions.ValidationException => HttpStatusCode.BadRequest,
                Application.Exceptions.ConflictException => HttpStatusCode.Conflict,
                _ => HttpStatusCode.InternalServerError
            };

            var internalErrorCode = e switch
            {
                Application.Exceptions.NotFoundException => "08",
                Application.Exceptions.EntityNotFoundException => "01",
                Application.Exceptions.ValidationException => "02",
                Application.Exceptions.ConflictException => "03",
                Application.Exceptions.ArgumentOutOfRangeException => "04",
                Application.Exceptions.NoContentException => "05",
                Application.Exceptions.NotAuthenticatedException => "07",
                System.ApplicationException => "99",
                _ => "00"
            };

            var path = context.Request.Path.Value?.ToLower() ?? "";
            string source = path switch
            {
                var p when p.Contains("orders") => "order",
                var p when p.Contains("products") => "product",
                var p when p.Contains("auth") => "auth",
                var p when p.Contains("profesional") => "profesional",
                var p when p.Contains("paciente") => "paciente",
                var p when p.Contains("consultorio") => "consultorio",
                var p when p.Contains("institucion") => "institucion",
                var p when p.Contains("estudio") => "estudio",
                var p when p.Contains("especialidad") => "especialidad",
                var p when p.Contains("obrasocial") || p.Contains("obra-social") => "obrasocial",
                var p when p.Contains("agenda") => "agenda",
                var p when p.Contains("turno") => "turno",
                var p when p.Contains("cita") => "cita",
                var p when p.Contains("administrador") => "administrador",
                var p when p.Contains("historiaclinica") || p.Contains("historia-clinica") => "historiaclinica",
                var p when p.Contains("cuestionario") => "cuestionario",
                var p when p.Contains("observacion") => "observacion",
                var p when p.Contains("asistente") => "asistente",
                _ => "app"
            };

            internalErrorCode = $"{source}-{internalErrorCode}";

            context.Response.StatusCode = (int)statusCode;
            var errorResponse = new
            {
                status = (int)statusCode,
                title = statusCode.ToString(),
                detail = e.Message,
                code = internalErrorCode
            };

            await context.Response.WriteAsync(JsonSerializer.Serialize(errorResponse));
        }
    }
}
