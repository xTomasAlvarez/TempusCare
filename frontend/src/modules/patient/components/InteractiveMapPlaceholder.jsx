import React, { useState } from 'react';
import { MapPin, Navigation, Building2, Plus, Minus, Layers, Eye, EyeOff } from 'lucide-react';
import { Card } from '../../../shared/components/ui/Card';

export const InteractiveMapPlaceholder = ({
  doctors = [],
  highlightedDoctorCuil,
  onSelectDoctor,
}) => {
  const [selectedPin, setSelectedPin] = useState(null);

  // Ubicaciones de ejemplo simuladas en mapa
  const locations = [
    {
      id: 'loc-1',
      name: 'Sanatorio Tucumán',
      address: 'Calle San Martín 850, San Miguel de Tucumán',
      top: '38%',
      left: '42%',
      doctorCount: doctors.length > 0 ? doctors.length : 1,
    },
    {
      id: 'loc-2',
      name: 'Clínica Mayo',
      address: 'Av. 24 de Septiembre 1100, San Miguel de Tucumán',
      top: '55%',
      left: '60%',
      doctorCount: 2,
    },
    {
      id: 'loc-3',
      name: 'Centro Médico Plaza',
      address: 'Calle 25 de Mayo 420, San Miguel de Tucumán',
      top: '68%',
      left: '32%',
      doctorCount: 1,
    },
  ];

  return (
    <div className="relative w-full h-[380px] lg:h-[calc(100vh-210px)] min-h-[380px] rounded-2xl overflow-hidden border border-slate-200/80 bg-slate-100 shadow-inner flex flex-col justify-between p-4">
      {/* Fondo de Estilo Cartográfico Clean Health */}
      <div
        className="absolute inset-0 opacity-40 pointer-events-none"
        style={{
          backgroundImage: `
            radial-gradient(#0d9488 1px, transparent 1px),
            linear-gradient(to right, #cbd5e1 1px, transparent 1px),
            linear-gradient(to bottom, #cbd5e1 1px, transparent 1px)
          `,
          backgroundSize: '24px 24px, 48px 48px, 48px 48px',
          backgroundColor: '#f8fafc',
        }}
      />

      {/* Vías simuladas en el mapa */}
      <svg
        className="absolute inset-0 w-full h-full pointer-events-none stroke-slate-300/70"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path d="M 0 100 Q 200 150 450 120 T 900 250" fill="none" strokeWidth="4" />
        <path d="M 150 0 Q 180 300 350 500 T 500 800" fill="none" strokeWidth="6" stroke="#94a3b8" />
        <path d="M 300 0 L 300 800" fill="none" strokeWidth="2" strokeDasharray="6,6" />
        <path d="M 0 350 L 900 350" fill="none" strokeWidth="3" />
      </svg>

      {/* Barra superior de herramientas del mapa */}
      <div className="relative z-10 flex items-center justify-between gap-2">
        <div className="bg-white/95 backdrop-blur-xs px-3 py-1.5 rounded-xl border border-slate-200/80 shadow-xs flex items-center gap-2 text-xs font-semibold text-slate-800">
          <Navigation className="w-3.5 h-3.5 text-teal-600" aria-hidden="true" />
          <span>San Miguel de Tucumán</span>
        </div>

        <div className="flex items-center gap-1 bg-white/95 backdrop-blur-xs p-1 rounded-xl border border-slate-200/80 shadow-xs">
          <button
            type="button"
            aria-label="Aumentar zoom"
            className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-600 focus:outline-none focus:ring-2 focus:ring-teal-500"
          >
            <Plus className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            aria-label="Disminuir zoom"
            className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-600 focus:outline-none focus:ring-2 focus:ring-teal-500"
          >
            <Minus className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Marcadores / Pines Interactivos */}
      {locations.map((loc) => {
        const isSelected = selectedPin?.id === loc.id;
        return (
          <div
            key={loc.id}
            style={{ top: loc.top, left: loc.left }}
            className="absolute z-10 -translate-x-1/2 -translate-y-1/2 transition-transform duration-200 hover:scale-110"
          >
            <button
              type="button"
              onClick={() => setSelectedPin(isSelected ? null : loc)}
              aria-label={`Ver consultorios en ${loc.name}`}
              className={`relative flex items-center justify-center p-2 rounded-full shadow-lg transition-all focus:outline-none focus:ring-2 focus:ring-teal-500 ${
                isSelected
                  ? 'bg-teal-600 text-white ring-4 ring-teal-200 scale-110'
                  : 'bg-white text-teal-700 hover:bg-teal-50'
              }`}
            >
              <Building2 className="w-5 h-5" aria-hidden="true" />
              <span className="absolute -top-1 -right-1 w-4 h-4 bg-emerald-600 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                {loc.doctorCount}
              </span>
            </button>
          </div>
        );
      })}

      {/* Tarjeta flotante inferior de información de ubicación seleccionada */}
      {selectedPin ? (
        <div className="relative z-20 bg-white/95 backdrop-blur-xs rounded-xl p-3.5 border border-teal-200 shadow-lg animate-in slide-in-from-bottom-2 duration-200">
          <div className="flex items-start justify-between gap-2">
            <div>
              <h4 className="text-sm font-bold font-heading text-slate-900">{selectedPin.name}</h4>
              <p className="text-xs text-slate-500 flex items-center gap-1 mt-0.5">
                <MapPin className="w-3 h-3 text-teal-600" />
                <span>{selectedPin.address}</span>
              </p>
              <span className="inline-block mt-2 text-[11px] font-semibold text-teal-700 bg-teal-50 px-2 py-0.5 rounded-md">
                {selectedPin.doctorCount} profesionales disponibles
              </span>
            </div>
            <button
              type="button"
              onClick={() => setSelectedPin(null)}
              className="text-xs text-slate-400 hover:text-slate-600 p-1"
              aria-label="Cerrar detalle de mapa"
            >
              ✕
            </button>
          </div>
        </div>
      ) : (
        <div className="relative z-10 self-center bg-white/90 backdrop-blur-xs px-3.5 py-2 rounded-full border border-slate-200/80 shadow-xs text-xs text-slate-600 font-medium">
          Haz clic en los consultorios para ver detalles de ubicación
        </div>
      )}
    </div>
  );
};
