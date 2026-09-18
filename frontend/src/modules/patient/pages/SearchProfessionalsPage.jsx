import React, { useState } from 'react';
import { useSearchProfessionals } from '../hooks/useSearchProfessionals';
import { SearchFilters } from '../components/SearchFilters';
import { DoctorCard } from '../components/DoctorCard';
import { InteractiveMapPlaceholder } from '../components/InteractiveMapPlaceholder';
import { BookingModal } from '../components/BookingModal';
import { Toast } from '../../../shared/components/ui/Toast';
import { MapPin, Search, AlertCircle, Sparkles, Map } from 'lucide-react';
import { Button } from '../../../shared/components/ui/Button';

export const SearchProfessionalsPage = () => {
  const {
    professionals,
    specialties,
    healthInsurances,
    filters,
    isLoading,
    error,
    selectedDoctorForBooking,
    setSelectedDoctorForBooking,
    highlightedDoctorCuil,
    setHighlightedDoctorCuil,
    updateFilter,
    resetFilters,
  } = useSearchProfessionals();

  const [toastMessage, setToastMessage] = useState(null);
  const [showMobileMap, setShowMobileMap] = useState(false);

  const handleBookingSuccess = (bookingData) => {
    setToastMessage({
      type: 'success',
      title: '¡Turno Confirmado!',
      message: `Tu cita ha sido agendada con éxito para el Dr. ${bookingData.profesionalNombre || ''}.`,
    });
  };

  return (
    <div className="space-y-6">
      {/* Toast Notificación */}
      {toastMessage && (
        <Toast
          type={toastMessage.type}
          title={toastMessage.title}
          message={toastMessage.message}
          onClose={() => setToastMessage(null)}
        />
      )}

      {/* Encabezado Principal */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold font-heading tracking-tight text-slate-900">
            Buscar Profesionales y Turnos
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Encuentra especialistas médicos, consulta disponibilidad en tiempo real y reserva tu cita.
          </p>
        </div>

        {/* Botón de alternar mapa en móviles para no bloquear scroll */}
        <div className="lg:hidden">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowMobileMap(!showMobileMap)}
            className="w-full sm:w-auto gap-2 text-xs"
          >
            <Map className="w-4 h-4 text-teal-600" aria-hidden="true" />
            <span>{showMobileMap ? 'Ocultar Mapa' : 'Ver en Mapa'}</span>
          </Button>
        </div>
      </div>

      {/* Barra de Filtros */}
      <SearchFilters
        filters={filters}
        specialties={specialties}
        healthInsurances={healthInsurances}
        onFilterChange={updateFilter}
        onReset={resetFilters}
        totalResults={professionals.length}
      />

      {/* Mapa en móviles si está activo */}
      {showMobileMap && (
        <div className="lg:hidden mb-6">
          <InteractiveMapPlaceholder
            doctors={professionals}
            highlightedDoctorCuil={highlightedDoctorCuil}
            onSelectDoctor={(doc) => setSelectedDoctorForBooking(doc)}
          />
        </div>
      )}

      {/* Grid Principal Dividido: Izquierda Médicos / Derecha Mapa (Desktop) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Columna Izquierda: Lista de Médicos (7 cols en desktop) */}
        <section className="lg:col-span-7 space-y-4" aria-label="Lista de profesionales médicos">
          {isLoading ? (
            /* Skeleton Loader de Tarjetas de Médicos */
            <div className="space-y-4">
              {[1, 2, 3].map((n) => (
                <div
                  key={n}
                  className="bg-white rounded-2xl border border-slate-200 p-6 space-y-4 animate-pulse shadow-xs"
                >
                  <div className="flex gap-4">
                    <div className="w-16 h-16 rounded-2xl bg-slate-200" />
                    <div className="flex-1 space-y-2">
                      <div className="h-5 bg-slate-200 rounded-md w-1/3" />
                      <div className="h-4 bg-slate-200 rounded-md w-1/4" />
                      <div className="h-4 bg-slate-200 rounded-md w-1/2" />
                    </div>
                  </div>
                  <div className="h-10 bg-slate-100 rounded-xl" />
                </div>
              ))}
            </div>
          ) : error ? (
            <div className="bg-rose-50 border border-rose-200 rounded-2xl p-6 text-center text-rose-700">
              <AlertCircle className="w-8 h-8 mx-auto mb-2 text-rose-500" />
              <p className="font-semibold text-sm">{error}</p>
              <Button
                variant="outline"
                size="sm"
                onClick={resetFilters}
                className="mt-4"
              >
                Restablecer filtros
              </Button>
            </div>
          ) : professionals.length === 0 ? (
            /* Empty State */
            <div className="bg-white border-2 border-dashed border-slate-200 rounded-2xl p-10 text-center space-y-3">
              <div className="w-14 h-14 rounded-2xl bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
                <Search className="w-7 h-7" aria-hidden="true" />
              </div>
              <h3 className="text-base font-bold font-heading text-slate-800">
                No encontramos médicos que coincidan
              </h3>
              <p className="text-xs text-slate-500 max-w-md mx-auto">
                Prueba cambiando el nombre o seleccionando otra especialidad u obra social en los filtros superiores.
              </p>
              <Button variant="outline" size="sm" onClick={resetFilters}>
                Limpiar Filtros
              </Button>
            </div>
          ) : (
            professionals.map((doctor) => (
              <DoctorCard
                key={doctor.cuil}
                doctor={doctor}
                isHighlighted={highlightedDoctorCuil === doctor.cuil}
                onHover={(cuil) => setHighlightedDoctorCuil(cuil)}
                onBook={(doc) => setSelectedDoctorForBooking(doc)}
              />
            ))
          )}
        </section>

        {/* Columna Derecha: Placeholder Mapa Interactivo (5 cols en desktop, sticky) */}
        <aside className="hidden lg:block lg:col-span-5 sticky top-24" aria-label="Mapa de consultorios">
          <InteractiveMapPlaceholder
            doctors={professionals}
            highlightedDoctorCuil={highlightedDoctorCuil}
            onSelectDoctor={(doc) => setSelectedDoctorForBooking(doc)}
          />
        </aside>
      </div>

      {/* Modal Accesible de Reserva */}
      <BookingModal
        isOpen={Boolean(selectedDoctorForBooking)}
        onClose={() => setSelectedDoctorForBooking(null)}
        doctor={selectedDoctorForBooking}
        onBookingSuccess={handleBookingSuccess}
      />
    </div>
  );
};
