using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;

namespace TempusCare.Api.Infrastructure.Data;

/// <summary>
/// RNF-SEG-05: Servicio en segundo plano (BackgroundService) que ejecuta copias de seguridad
/// automáticas diarias de la base de datos SQLite local al menos una vez cada 24 horas y al iniciar el servidor.
/// Conserva una rotación histórica de los últimos 7 respaldos diarios.
/// </summary>
public class DatabaseBackupService : BackgroundService
{
    private readonly ILogger<DatabaseBackupService> _logger;
    private readonly string _databasePath;
    private readonly string _backupDirectory;
    private static readonly object SyncLock = new();

    public static DateTime? LastBackupTimeUtc { get; private set; }
    public static string? LastBackupFileName { get; private set; }
    public static int TotalBackupsCount { get; private set; }

    public DatabaseBackupService(ILogger<DatabaseBackupService> logger, IConfiguration configuration)
    {
        _logger = logger;
        var connString = configuration.GetConnectionString("DefaultConnection") ?? "Data Source=tempuscare.db";
        _databasePath = ExtractDatabaseFilePath(connString);
        _backupDirectory = Path.Combine(AppContext.BaseDirectory, "backups");
    }

    protected override async Task ExecuteAsync(CancellationToken stoppingToken)
    {
        _logger.LogInformation("RNF-SEG-05: Servicio de Copias de Seguridad Automáticas iniciado. Directorio de destino: {BackupDir}", _backupDirectory);

        while (!stoppingToken.IsCancellationRequested)
        {
            try
            {
                ExecuteDailyBackup(_databasePath, _backupDirectory, _logger);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error al ejecutar la copia de seguridad diaria automática (RNF-SEG-05).");
            }

            try
            {
                // Ejecutar al menos una vez al día (cada 24 horas)
                await Task.Delay(TimeSpan.FromHours(24), stoppingToken);
            }
            catch (TaskCanceledException)
            {
                break;
            }
        }
    }

    /// <summary>
    /// Ejecuta de forma segura y atómica el respaldo diario del archivo SQLite y limpia respaldos mayores a 7 días.
    /// </summary>
    public static string? ExecuteDailyBackup(string dbFilePath, string backupDirectory, ILogger? logger = null, int maxRetainedBackups = 7)
    {
        lock (SyncLock)
        {
            Directory.CreateDirectory(backupDirectory);

            var resolvedDbPath = Path.IsPathRooted(dbFilePath)
                ? dbFilePath
                : Path.GetFullPath(dbFilePath);

            if (!File.Exists(resolvedDbPath))
            {
                // Intentar en AppContext.BaseDirectory si no está en el directorio actual
                var altPath = Path.Combine(AppContext.BaseDirectory, Path.GetFileName(dbFilePath));
                if (File.Exists(altPath))
                {
                    resolvedDbPath = altPath;
                }
                else
                {
                    logger?.LogWarning("RNF-SEG-05: Archivo de base de datos '{DbPath}' aún no disponible para backup.", resolvedDbPath);
                    return null;
                }
            }

            string dateStamp = DateTime.UtcNow.ToString("yyyy-MM-dd");
            string backupFileName = $"tempuscare_backup_{dateStamp}.db";
            string destinationPath = Path.Combine(backupDirectory, backupFileName);

            using (var sourceStream = new FileStream(resolvedDbPath, FileMode.Open, FileAccess.Read, FileShare.ReadWrite))
            using (var destStream = new FileStream(destinationPath, FileMode.Create, FileAccess.Write, FileShare.None))
            {
                sourceStream.CopyTo(destStream);
                destStream.Flush(true);
            }

            // Rotación de retención: conservar los últimos N respaldos diarios
            var backupFiles = new DirectoryInfo(backupDirectory)
                .GetFiles("tempuscare_backup_*.db")
                .OrderByDescending(f => f.CreationTimeUtc)
                .ToList();

            if (backupFiles.Count > maxRetainedBackups)
            {
                foreach (var oldBackup in backupFiles.Skip(maxRetainedBackups))
                {
                    try
                    {
                        oldBackup.Delete();
                    }
                    catch
                    {
                        // Ignorar si un archivo antiguo está bloqueado temporalmente
                    }
                }
            }

            LastBackupTimeUtc = DateTime.UtcNow;
            LastBackupFileName = backupFileName;
            TotalBackupsCount = Math.Min(backupFiles.Count, maxRetainedBackups);

            logger?.LogInformation("RNF-SEG-05: Copia de seguridad diaria generada exitosamente en '{DestinationPath}'. Total respaldos activos: {Total}", destinationPath, TotalBackupsCount);
            return destinationPath;
        }
    }

    private static string ExtractDatabaseFilePath(string connectionString)
    {
        foreach (var part in connectionString.Split(';', StringSplitOptions.RemoveEmptyEntries))
        {
            var kv = part.Split('=', 2, StringSplitOptions.TrimEntries);
            if (kv.Length == 2 && (kv[0].Equals("Data Source", StringComparison.OrdinalIgnoreCase) ||
                                   kv[0].Equals("DataSource", StringComparison.OrdinalIgnoreCase)))
            {
                return kv[1].Trim('"', '\'');
            }
        }
        return "tempuscare.db";
    }
}
