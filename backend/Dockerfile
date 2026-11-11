# =============================================================================
# ETAPA 1: Compilación y Publicación (Build Stage - .NET 9 SDK)
# =============================================================================
FROM mcr.microsoft.com/dotnet/sdk:9.0 AS build
WORKDIR /src

# 1. Copiar el archivo de solución y el .csproj de la API para aprovechar la caché de capas de Docker
COPY ["TempusCare.sln", "./"]
COPY ["src/TempusCare.Api/TempusCare.Api.csproj", "src/TempusCare.Api/"]

# 2. Restaurar las dependencias NuGet únicamente del proyecto de la API
RUN dotnet restore "src/TempusCare.Api/TempusCare.Api.csproj"

# 3. Copiar el resto del código fuente del backend
COPY ["src/TempusCare.Api/", "src/TempusCare.Api/"]

# 4. Compilar y publicar en modo Release optimizado para producción
WORKDIR "/src/src/TempusCare.Api"
RUN dotnet publish "TempusCare.Api.csproj" -c Release -o /app/publish /p:UseAppHost=false

# =============================================================================
# ETAPA 2: Ejecución en Producción (Runtime Stage - ASP.NET Core 9)
# =============================================================================
FROM mcr.microsoft.com/dotnet/aspnet:9.0 AS final
WORKDIR /app

# Crear directorio para copias de seguridad automáticas de SQLite (RNF-SEG-05)
RUN mkdir -p /app/backups

# Copiar los artefactos compilados desde la etapa build
COPY --from=build /app/publish .

# Configuración de Entorno y Puerto Dinámico para Railway ($PORT)
ENV ASPNETCORE_ENVIRONMENT=Production
ENV PORT=8080
ENV ASPNETCORE_URLS=http://+:${PORT}

EXPOSE 8080

# Railway inyecta dinámicamente la variable $PORT en tiempo de ejecución.
# Usamos sh -c en el ENTRYPOINT para expandir ${PORT} al iniciar el contenedor.
ENTRYPOINT ["sh", "-c", "ASPNETCORE_URLS=http://+:${PORT:-8080} dotnet TempusCare.Api.dll"]
