import React, { useEffect, useRef, useState, useMemo } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { MapPin, Navigation, Hospital, CalendarPlus, UserRound } from 'lucide-react';
import { patientService } from '../services/patientService';

// Coordenadas neurálgicas del área médica de San Miguel de Tucumán
export const TUCUMAN_CENTER = [-26.8280, -65.2040];
export const INITIAL_ZOOM = 16; // Nivel de zoom a nivel de cuadras/calles para apreciación inmediata

export const InteractiveMapPlaceholder = ({
  doctors = [],
  consultorios: initialConsultorios = null,
  highlightedDoctorCuil,
  onSelectDoctor,
  zoom = INITIAL_ZOOM,
  center = TUCUMAN_CENTER,
}) => {
  const mapContainerRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const markersRef = useRef([]);
  const [backendConsultorios, setBackendConsultorios] = useState([]);
  const [selectedLocation, setSelectedLocation] = useState(null);

  // Cargar consultorios desde el backend si no fueron provistos como prop
  useEffect(() => {
    let isMounted = true;

    if (initialConsultorios && initialConsultorios.length > 0) {
      setBackendConsultorios(initialConsultorios);
      return;
    }

    async function loadConsultorios() {
      try {
        const data = await patientService.getConsultorios();
        if (isMounted && Array.isArray(data)) {
          setBackendConsultorios(data);
        }
      } catch {
        // Fallback silencioso a sedes por defecto si la API no está disponible
      }
    }

    loadConsultorios();
    return () => {
      isMounted = false;
    };
  }, [initialConsultorios]);

  // Consolidar sedes geolocalizadas estrictamente desde las entidades del backend
  const locations = useMemo(() => {
    const list = [];
    const cuitSet = new Set();

    // 1. Sedes cargadas desde el endpoint /api/consultorios
    backendConsultorios.forEach((c) => {
      if (
        c &&
        c.cuit &&
        typeof c.latitud === 'number' &&
        typeof c.longitud === 'number' &&
        !isNaN(c.latitud) &&
        !isNaN(c.longitud)
      ) {
        cuitSet.add(c.cuit);
        const direccionTexto =
          c.calle && c.nro
            ? `${c.calle} ${c.nro}`
            : c.direccionCompleta || 'San Miguel de Tucumán';

        list.push({
          cuit: c.cuit,
          nombre: c.nombre,
          institucionNombre: c.institucionNombre || 'Sanatorio / Institución',
          direccionTexto,
          direccionCompleta: c.direccionCompleta || direccionTexto,
          latitud: c.latitud,
          longitud: c.longitud,
          profesionalesBackend: c.profesionales || [],
        });
      }
    });

    // 2. Extraer sedes presentes en consultoriosDetalle de los doctores activos
    doctors.forEach((doc) => {
      if (Array.isArray(doc.consultoriosDetalle)) {
        doc.consultoriosDetalle.forEach((cd) => {
          if (
            cd &&
            cd.cuit &&
            !cuitSet.has(cd.cuit) &&
            typeof cd.latitud === 'number' &&
            typeof cd.longitud === 'number' &&
            !isNaN(cd.latitud) &&
            !isNaN(cd.longitud)
          ) {
            cuitSet.add(cd.cuit);
            const direccionTexto =
              cd.calle && cd.nro
                ? `${cd.calle} ${cd.nro}`
                : cd.direccionCompleta || 'San Miguel de Tucumán';

            list.push({
              cuit: cd.cuit,
              nombre: cd.nombre,
              institucionNombre: cd.institucionNombre || 'Sanatorio / Institución',
              direccionTexto,
              direccionCompleta: cd.direccionCompleta || direccionTexto,
              latitud: cd.latitud,
              longitud: cd.longitud,
              profesionalesBackend: [],
            });
          }
        });
      }
    });

    return list;
  }, [backendConsultorios, doctors]);

  // Helper para generar icono HTML corporativo para cada sede médica con anclaje en la punta inferior
  const createMedicalPinIcon = (doctorCount, isSelected = false) => {
    return L.divIcon({
      className: 'tempuscare-map-pin',
      html: `
        <div style="
          position: relative;
          width: 30px;
          height: 42px;
          cursor: pointer;
          filter: drop-shadow(0 4px 6px rgba(15, 23, 42, 0.35));
          transition: transform 0.2s ease;
        ">
          <svg width="30" height="42" viewBox="0 0 30 42" fill="none" xmlns="http://www.w3.org/2000/svg" style="display: block;">
            <!-- Pin con punta inferior matemática en x=15, y=42 -->
            <path
              d="M15 0C6.71573 0 0 6.71573 0 15C0 25.5 15 42 15 42C15 42 30 25.5 30 15C30 6.71573 23.2843 0 15 0Z"
              fill="${isSelected ? '#1e4287' : '#ffffff'}"
              stroke="${isSelected ? '#10b981' : '#1e4287'}"
              stroke-width="2.5"
              stroke-linejoin="round"
            />
            <circle cx="15" cy="15" r="10" fill="${isSelected ? '#1e4287' : '#f8fafc'}" />
          </svg>
          <div style="
            position: absolute;
            top: 0;
            left: 0;
            width: 30px;
            height: 30px;
            display: flex;
            align-items: center;
            justify-content: center;
            color: ${isSelected ? '#ffffff' : '#1e4287'};
            pointer-events: none;
          ">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
              <path d="M12 6v4"></path>
              <path d="M14 14h-4"></path>
              <path d="M14 18h-4"></path>
              <path d="M14 8h-4"></path>
              <path d="M18 12h-4"></path>
              <rect x="4" y="2" width="16" height="20" rx="2"></rect>
            </svg>
          </div>
          ${doctorCount > 0 ? `
            <span style="
              position: absolute;
              top: -4px;
              right: -7px;
              min-width: 18px;
              height: 18px;
              padding: 0 4px;
              border-radius: 9px;
              background: #10b981;
              color: #ffffff;
              font-size: 10px;
              font-weight: 800;
              display: flex;
              align-items: center;
              justify-content: center;
              border: 2px solid #ffffff;
              box-shadow: 0 1px 3px rgba(0,0,0,0.25);
              pointer-events: none;
            ">
              ${doctorCount}
            </span>
          ` : ''}
        </div>
      `,
      iconSize: [30, 42],
      iconAnchor: [15, 42], // Punta inferior exacta del pin
      popupAnchor: [0, -42], // Apertura del popup justo por encima del pin
    });
  };

  // Inicialización del Mapa de Leaflet con zoom a nivel de calles
  useEffect(() => {
    if (!mapContainerRef.current) return;
    if (mapInstanceRef.current) return; // Evitar reinicialización

    const map = L.map(mapContainerRef.current, {
      center: center,
      zoom: zoom,
      zoomControl: false,
    });

    // Capa de tiles OpenStreetMap con estilo limpio
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors | TempusCare',
      maxZoom: 19,
    }).addTo(map);

    // Control de zoom en la esquina superior derecha
    L.control.zoom({ position: 'topright' }).addTo(map);

    mapInstanceRef.current = map;

    return () => {
      map.remove();
      mapInstanceRef.current = null;
    };
  }, []);

  // Actualizar Marcadores en el Mapa estrictamente con latitud y longitud del backend
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    // Limpiar marcadores anteriores
    markersRef.current.forEach((marker) => marker.remove());
    markersRef.current = [];

    // Iteración estricta de sedes físicas con coordenadas del backend
    locations.forEach((loc) => {
      // Doctores asignados a esta sede
      const doctorsInLoc = doctors.filter((d) => {
        // Coincidencia por CUIT en consultoriosDetalle
        const matchCuit = d.consultoriosDetalle?.some((cd) => cd.cuit === loc.cuit);
        if (matchCuit) return true;

        // Coincidencia por nombre en consultorios
        const matchNombre = d.consultorios?.some(
          (c) =>
            c.toLowerCase().includes(loc.nombre.toLowerCase()) ||
            loc.nombre.toLowerCase().includes(c.toLowerCase())
        );
        if (matchNombre) return true;

        // Coincidencia en profesionales asociados del backend
        const matchBackendProf = loc.profesionalesBackend?.some((p) => p.cuil === d.cuil);
        return Boolean(matchBackendProf);
      });

      const count = doctorsInLoc.length > 0 ? doctorsInLoc.length : (loc.profesionalesBackend?.length || 1);
      const isSelected = selectedLocation?.cuit === loc.cuit;

      // Marcador posicionado en coordenadas reales del backend
      const marker = L.marker([loc.latitud, loc.longitud], {
        icon: createMedicalPinIcon(count, isSelected),
        title: `${loc.institucionNombre} - ${loc.nombre}`,
      });

      // Crear Popup emergente con nombre de institución y dirección exacta en texto
      const popupHtml = `
        <div style="font-family: system-ui, -apple-system, sans-serif; min-width: 170px; padding: 2px;">
          <div style="font-size: 10px; font-weight: 700; text-transform: uppercase; color: #1e4287; letter-spacing: 0.5px; margin-bottom: 2px;">
            ${loc.institucionNombre}
          </div>
          <h4 style="font-weight: 700; color: #0f172a; font-size: 13px; margin: 0 0 2px 0;">
            ${loc.nombre}
          </h4>
          <p style="color: #475569; font-size: 11px; margin: 2px 0 6px 0; font-weight: 600;">
            📍 ${loc.direccionTexto}
          </p>
          <div style="display: inline-block; background: #eff6ff; color: #1e4287; font-weight: 600; padding: 2px 8px; border-radius: 6px; font-size: 11px;">
            ${count} médico${count > 1 ? 's' : ''} disponible${count > 1 ? 's' : ''}
          </div>
        </div>
      `;

      marker.bindPopup(popupHtml, {
        closeButton: true,
        autoClose: false,
        closeOnClick: false,
        autoPan: true,
        autoPanPaddingTopLeft: [20, 65],
        autoPanPaddingBottomRight: [20, 30],
        className: 'tempuscare-popup',
      });

      marker.on('click', () => {
        setSelectedLocation({ ...loc, doctors: doctorsInLoc });
        marker.openPopup();
      });

      marker.addTo(map);
      markersRef.current.push(marker);
    });
  }, [locations, doctors]);

  // Si se resalta un médico desde la lista (hover), centrar mapa suavemente en su sede
  useEffect(() => {
    if (!highlightedDoctorCuil || !mapInstanceRef.current) return;
    const doc = doctors.find((d) => d.cuil === highlightedDoctorCuil);
    if (!doc) return;

    // Buscar si coincide con alguna sede con coordenadas
    const matchedLoc = locations.find((loc) => {
      const matchCuit = doc.consultoriosDetalle?.some((cd) => cd.cuit === loc.cuit);
      if (matchCuit) return true;
      return doc.consultorios?.some(
        (c) =>
          c.toLowerCase().includes(loc.nombre.toLowerCase()) ||
          loc.nombre.toLowerCase().includes(c.toLowerCase())
      );
    });

    if (matchedLoc) {
      mapInstanceRef.current.panTo([matchedLoc.latitud, matchedLoc.longitud], {
        animate: true,
        duration: 0.6,
      });
    }
  }, [highlightedDoctorCuil, doctors, locations]);

  // Centrar nuevamente en San Miguel de Tucumán
  const handleRecenter = () => {
    if (mapInstanceRef.current) {
      mapInstanceRef.current.setView(center, zoom, { animate: true });
      setSelectedLocation(null);
    }
  };

  return (
    <div className="relative w-full h-[380px] lg:h-[calc(100vh-210px)] min-h-[380px] rounded-2xl overflow-hidden border border-slate-200/80 bg-slate-100 shadow-sm flex flex-col justify-between">
      {/* Contenedor DOM donde Leaflet renderiza el mapa */}
      <div
        ref={mapContainerRef}
        className="absolute inset-0 w-full h-full z-0"
        tabIndex={0}
        aria-label="Mapa interactivo de San Miguel de Tucumán"
      />

      {/* Barra superior de herramientas y contexto geográfico */}
      <div className="relative z-10 p-3 flex items-center justify-between pointer-events-none">
        <div className="bg-white/95 backdrop-blur-xs px-3.5 py-1.5 rounded-xl border border-slate-200/80 shadow-xs flex items-center gap-2 text-xs font-bold text-slate-800 pointer-events-auto">
          <Navigation className="w-3.5 h-3.5 text-primary-600" strokeWidth={2} aria-hidden="true" />
          <span>San Miguel de Tucumán</span>
          <span className="text-[10px] font-mono text-slate-400 font-normal hidden sm:inline">
            ({center[0].toFixed(4)}, {center[1].toFixed(4)})
          </span>
        </div>

        <button
          type="button"
          onClick={handleRecenter}
          title="Centrar en San Miguel de Tucumán"
          aria-label="Restablecer centro de mapa en San Miguel de Tucumán"
          className="bg-white/95 backdrop-blur-xs px-2.5 py-1.5 rounded-xl border border-slate-200/80 shadow-xs text-xs font-semibold text-primary-700 hover:bg-primary-50 transition-colors pointer-events-auto flex items-center gap-1.5"
        >
          <Hospital className="w-3.5 h-3.5 text-primary-600" strokeWidth={2} />
          <span className="hidden sm:inline">Centrar Ciudad</span>
        </button>
      </div>

      {/* Tarjeta flotante inferior de información de sede seleccionada */}
      {selectedLocation ? (
        <div className="relative z-10 m-3 bg-white/95 backdrop-blur-xs rounded-xl p-3.5 border border-primary-200/80 shadow-lg animate-in slide-in-from-bottom-2 duration-200 max-h-48 overflow-y-auto">
          <div className="flex items-start justify-between gap-2">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-primary-700 block">
                {selectedLocation.institucionNombre}
              </span>
              <h4 className="text-sm font-bold font-heading text-slate-900 leading-tight">
                {selectedLocation.nombre}
              </h4>
              <p className="text-xs text-slate-600 font-semibold flex items-center gap-1 mt-1">
                <MapPin className="w-3.5 h-3.5 text-primary-600 shrink-0" strokeWidth={2} />
                <span>{selectedLocation.direccionTexto}</span>
              </p>
            </div>
            <button
              type="button"
              onClick={() => setSelectedLocation(null)}
              className="text-xs text-slate-400 hover:text-slate-600 p-1 rounded-md"
              aria-label="Cerrar detalle de sede"
            >
              ✕
            </button>
          </div>

          {/* Listado rápido de doctores disponibles en esta sede */}
          <div className="mt-2.5 pt-2 border-t border-slate-100 space-y-1.5">
            {selectedLocation.doctors && selectedLocation.doctors.length > 0 ? (
              selectedLocation.doctors.slice(0, 3).map((doc) => (
                <div key={doc.cuil} className="flex items-center justify-between text-xs py-1">
                  <div className="flex items-center gap-1.5">
                    <UserRound className="w-3 h-3 text-slate-400" />
                    <span className="font-semibold text-slate-800">
                      Dr. {doc.nombre} {doc.apellido}
                    </span>
                    <span className="text-[11px] text-slate-400">
                      ({doc.especialidades?.[0] || 'General'})
                    </span>
                  </div>
                  {onSelectDoctor && (
                    <button
                      type="button"
                      onClick={() => onSelectDoctor(doc)}
                      className="text-primary-700 hover:text-primary-800 font-semibold text-[11px] flex items-center gap-1"
                    >
                      <CalendarPlus className="w-3 h-3" />
                      <span>Reservar</span>
                    </button>
                  )}
                </div>
              ))
            ) : selectedLocation.profesionalesBackend && selectedLocation.profesionalesBackend.length > 0 ? (
              selectedLocation.profesionalesBackend.slice(0, 3).map((doc) => (
                <div key={doc.cuil} className="flex items-center justify-between text-xs py-1">
                  <div className="flex items-center gap-1.5">
                    <UserRound className="w-3 h-3 text-slate-400" />
                    <span className="font-semibold text-slate-800">
                      Dr. {doc.nombre} {doc.apellido}
                    </span>
                    <span className="text-[11px] text-slate-400">
                      ({doc.especialidades?.[0] || 'General'})
                    </span>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-[11px] text-slate-400 italic">
                Sede habilitada con turnos activos en plataforma.
              </p>
            )}
          </div>
        </div>
      ) : (
        <div className="relative z-10 m-3 self-center bg-white/90 backdrop-blur-xs px-3.5 py-1.5 rounded-full border border-slate-200/80 shadow-xs text-xs text-slate-600 font-medium pointer-events-none">
          Haz clic en cualquier sede para explorar sus especialistas y turnos
        </div>
      )}
    </div>
  );
};

export const InteractiveMap = InteractiveMapPlaceholder;
export default InteractiveMapPlaceholder;
