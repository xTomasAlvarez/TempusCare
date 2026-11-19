/**
 * Geocodificación catastral segura para direcciones de Argentina (especialmente Tucumán).
 * - Principal: ArcGIS World Geocoding Service (interpolación exacta de alturas de calle).
 * - Fallback: OpenStreetMap Nominatim.
 * - Timeout corto (3.5s) y retorno silencioso null ante fallo de red para no bloquear jamás formularios.
 */
const isValidArgentinaCoords = (lat, lon) =>
  typeof lat === 'number' &&
  typeof lon === 'number' &&
  !Number.isNaN(lat) &&
  !Number.isNaN(lon) &&
  lat >= -56.0 &&
  lat <= -21.0 &&
  lon >= -74.0 &&
  lon <= -53.0;

const fetchWithTimeout = async (url, timeoutMs = 3500) => {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    return await fetch(url, { signal: controller.signal });
  } finally {
    clearTimeout(timer);
  }
};

export const geocodeAddress = async ({ calle, nro, localidad, provincia } = {}) => {
  if (!calle || !String(calle).trim()) return null;

  const streetPart = `${String(calle).trim()} ${nro ? String(nro).trim() : ''}`.trim();
  const queryParts = [
    streetPart,
    localidad ? String(localidad).trim() : 'San Miguel de Tucumán',
    provincia ? String(provincia).trim() : 'Tucumán',
    'Argentina',
  ].filter(Boolean);

  const singleLine = queryParts.join(', ');

  // 1. ArcGIS World Geocoding Service (alta precisión de altura en Tucumán)
  try {
    const arcgisUrl = `https://geocode.arcgis.com/arcgis/rest/services/World/GeocodeServer/findAddressCandidates?f=json&maxLocations=1&countryCode=ARG&SingleLine=${encodeURIComponent(singleLine)}`;
    const resp = await fetchWithTimeout(arcgisUrl, 3500);
    if (resp.ok) {
      const data = await resp.json();
      const top = data?.candidates?.[0];
      if (top && Number(top.score) >= 70 && top.location) {
        const latitud = Number(Number(top.location.y).toFixed(6));
        const longitud = Number(Number(top.location.x).toFixed(6));
        if (isValidArgentinaCoords(latitud, longitud)) {
          return { latitud, longitud };
        }
      }
    }
  } catch {
    // Fallback silencioso a Nominatim
  }

  // 2. Fallback: OpenStreetMap Nominatim
  try {
    const nominatimUrl = `https://nominatim.openstreetmap.org/search?format=json&limit=1&countrycodes=ar&q=${encodeURIComponent(singleLine)}`;
    const resp = await fetchWithTimeout(nominatimUrl, 3500);
    if (resp.ok) {
      const data = await resp.json();
      const top = Array.isArray(data) ? data[0] : null;
      if (top) {
        const latitud = Number(parseFloat(top.lat).toFixed(6));
        const longitud = Number(parseFloat(top.lon).toFixed(6));
        if (isValidArgentinaCoords(latitud, longitud)) {
          return { latitud, longitud };
        }
      }
    }
  } catch {
    // Fallback silencioso: el backend también intentará geocodificar
  }

  return null;
};

export default geocodeAddress;
