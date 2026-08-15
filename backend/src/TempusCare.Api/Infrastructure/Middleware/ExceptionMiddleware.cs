using System.Net;
using System.Text.Json;
using TempusCare.Api.Application.Exceptions;

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
        catch (Exception ex)
        {
            _logger.LogError(ex, "Ocurrió una excepción no controlada: {Message}", ex.Message);
            await HandleExceptionAsync(context, ex);
        }
    }

    private static Task HandleExceptionAsync(HttpContext context, Exception exception)
    {
        context.Response.ContentType = "application/json";

        int statusCode = (int)HttpStatusCode.InternalServerError;
        string message = "Ocurrió un error interno en el servidor.";

        if (exception is BusinessException businessException)
        {
            statusCode = businessException.StatusCode;
            message = businessException.Message;
        }

        context.Response.StatusCode = statusCode;

        var result = JsonSerializer.Serialize(new
        {
            statusCode = statusCode,
            error = message
        });

        return context.Response.WriteAsync(result);
    }
}
