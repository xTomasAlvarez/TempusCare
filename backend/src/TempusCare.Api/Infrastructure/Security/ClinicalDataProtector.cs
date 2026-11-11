using System.Security.Cryptography;
using System.Text;
using Microsoft.EntityFrameworkCore.Storage.ValueConversion;

namespace TempusCare.Api.Infrastructure.Security;

/// <summary>
/// RNF-SEG-06 (Ley Nacional 25.326 de Protección de Datos Personales y Datos Sensibles de Salud):
/// Provee cifrado simétrico AES-256-CBC con vector de inicialización (IV) aleatorio de 128 bits
/// para proteger en reposo (at-rest) la información clínica sensible (Alergias, Enfermedades Crónicas,
/// Medicación, Discapacidad y Evoluciones Médicas).
/// </summary>
public static class ClinicalDataProtector
{
    public const string EncryptedPrefix = "$ENC-AES256$";

    private static readonly byte[] AesKey = SHA256.HashData(
        Encoding.UTF8.GetBytes(
            Environment.GetEnvironmentVariable("TEMPUSCARE_CLINICAL_AES_KEY")
            ?? "TempusCare_Ley25326_ClinicalData_AES256_MasterKey_2026_UTN!"
        )
    );

    /// <summary>
    /// Indica si un valor ya se encuentra cifrado con AES-256 bajo el esquema de confidencialidad médica.
    /// </summary>
    public static bool IsEncrypted(string? value)
    {
        return !string.IsNullOrEmpty(value) && value.StartsWith(EncryptedPrefix, StringComparison.Ordinal);
    }

    /// <summary>
    /// Cifra un texto clínico sensible empleando AES-256-CBC con IV criptográfico aleatorio.
    /// </summary>
    public static string? Encrypt(string? plainText)
    {
        if (string.IsNullOrEmpty(plainText))
            return plainText;

        if (IsEncrypted(plainText))
            return plainText;

        using var aes = Aes.Create();
        aes.KeySize = 256;
        aes.Key = AesKey;
        aes.Mode = CipherMode.CBC;
        aes.Padding = PaddingMode.PKCS7;
        aes.GenerateIV();

        using var encryptor = aes.CreateEncryptor(aes.Key, aes.IV);
        byte[] plainBytes = Encoding.UTF8.GetBytes(plainText);
        byte[] cipherBytes = encryptor.TransformFinalBlock(plainBytes, 0, plainBytes.Length);

        byte[] combined = new byte[aes.IV.Length + cipherBytes.Length];
        Buffer.BlockCopy(aes.IV, 0, combined, 0, aes.IV.Length);
        Buffer.BlockCopy(cipherBytes, 0, combined, aes.IV.Length, cipherBytes.Length);

        return $"{EncryptedPrefix}{Convert.ToBase64String(combined)}";
    }

    /// <summary>
    /// Descifra de forma transparente un texto clínico cifrado con AES-256.
    /// Si el dato proviene de un registro previo no cifrado, lo retorna de forma segura sin corromper la lectura.
    /// </summary>
    public static string? Decrypt(string? cipherTextOrPlain)
    {
        if (string.IsNullOrEmpty(cipherTextOrPlain))
            return cipherTextOrPlain;

        if (!IsEncrypted(cipherTextOrPlain))
            return cipherTextOrPlain;

        try
        {
            string base64Payload = cipherTextOrPlain.Substring(EncryptedPrefix.Length);
            byte[] combined = Convert.FromBase64String(base64Payload);

            using var aes = Aes.Create();
            aes.KeySize = 256;
            aes.Key = AesKey;
            aes.Mode = CipherMode.CBC;
            aes.Padding = PaddingMode.PKCS7;

            int ivLength = aes.BlockSize / 8; // 16 bytes
            if (combined.Length <= ivLength)
                return cipherTextOrPlain;

            byte[] iv = new byte[ivLength];
            byte[] cipherBytes = new byte[combined.Length - ivLength];

            Buffer.BlockCopy(combined, 0, iv, 0, ivLength);
            Buffer.BlockCopy(combined, ivLength, cipherBytes, 0, cipherBytes.Length);

            using var decryptor = aes.CreateDecryptor(aes.Key, iv);
            byte[] plainBytes = decryptor.TransformFinalBlock(cipherBytes, 0, cipherBytes.Length);
            return Encoding.UTF8.GetString(plainBytes);
        }
        catch
        {
            return cipherTextOrPlain;
        }
    }

    /// <summary>
    /// ValueConverter de Entity Framework Core para cifrar automáticamente al guardar en la BD
    /// y descifrar al materializar las entidades clínicas (Ley 25.326).
    /// </summary>
    public static ValueConverter<string?, string?> CreateConverter() =>
        new(
            plain => Encrypt(plain),
            encrypted => Decrypt(encrypted)
        );

    /// <summary>
    /// ValueConverter no anulable para propiedades string requeridas en entidades clínicas.
    /// </summary>
    public static ValueConverter<string, string> CreateNonNullableConverter() =>
        new(
            plain => Encrypt(plain) ?? string.Empty,
            encrypted => Decrypt(encrypted) ?? string.Empty
        );
}
