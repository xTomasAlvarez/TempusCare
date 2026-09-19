import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { HeartPulse, LogIn, UserPlus, Map, Calendar, Sparkles, ShieldCheck, Activity } from 'lucide-react';
import { useAuth } from '../../../core/context/AuthContext';
import { useSearchProfessionals } from '../../patient/hooks/useSearchProfessionals';
import { SearchFilters } from '../../patient/components/SearchFilters';
import { DoctorCard } from '../../patient/components/DoctorCard';
import { InteractiveMapPlaceholder } from '../../patient/components/InteractiveMapPlaceholder';
import { BookingModal } from '../../patient/components/BookingModal';
import { AuthRequiredModal } from '../components/AuthRequiredModal';
import { Button } from '../../../shared/components/ui/Button';
import { Toast } from '../../../shared/components/ui/Toast';

export const HomePage = () => {
  const { user, isAuthenticated, getDashboardRoute, clearAuthData } = useAuth();
  const navigate = useNavigate();

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

  // Estados para modales y navegación
  const [authRequiredDoctor, setAuthRequiredDoctor] = useState(null);
  const [showMobileMap, setShowMobileMap] = useState(false);
  const [toastMessage, setToastMessage] = useState(null);

  /**
   * Intercepción de reserva: Si no está logueado o no es paciente, abre el AuthRequiredModal
   */
  const handleBookClick = (doctor) => {
    if (!isAuthenticated) {
      setAuthRequiredDoctor(doctor);
      return;
    }

    if (user?.rol !== 'Paciente') {
      setToastMessage({
        type: 'info',
        title: 'Acceso Restringido',
        message: 'Para agendar citas como paciente, debes iniciar sesión con una cuenta de Paciente.',
      });
      return;
    }

    // Usuario autenticado como Paciente: procede a la reserva directa
    setSelectedDoctorForBooking(doctor);
  };

  const handleBookingSuccess = (bookingData) => {
    setToastMessage({
      type: 'success',
      title: '¡Turno Confirmado!',
      message: `Tu cita ha sido agendada con éxito para el Dr. ${bookingData.profesionalNombre || ''}.`,
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 via-slate-100 to-slate-200/90 text-slate-900 font-sans flex flex-col selection:bg-teal-100 selection:text-teal-900">
      {/* Toast Notificación */}
      {toastMessage && (
        <Toast
          type={toastMessage.type}
          title={toastMessage.title}
          message={toastMessage.message}
          onClose={() => setToastMessage(null)}
        />
      )}

      {/* Encabezado Público con Logo y Botones Prominentes */}
      <header className="sticky top-0 z-30 bg-white/85 backdrop-blur-md border-b border-slate-200/70 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 sm:h-20 flex items-center justify-between gap-4">
          {/* Logo de TempusCare */}
          <Link
            to="/"
            tabIndex={0}
            aria-label="Inicio de TempusCare"
            className="flex items-center gap-2.5 rounded-xl p-1 focus:outline-none focus:ring-2 focus:ring-teal-500"
          >
            <div className="w-10 h-10 rounded-xl bg-teal-600 flex items-center justify-center text-white shadow-sm shadow-teal-600/20">
              <HeartPulse className="w-6 h-6" aria-hidden="true" />
            </div>
            <div>
              <span className="text-xl font-bold font-heading tracking-tight text-slate-900 block leading-tight">
                Tempus<span className="text-teal-600">Care</span>
              </span>
              <span className="text-[10px] font-medium tracking-widest text-slate-400 uppercase block">
                Salud Inclusiva
              </span>
            </div>
          </Link>

          {/* Acciones de Autenticación */}
          <div className="flex items-center gap-2.5 sm:gap-3">
            {isAuthenticated ? (
              <div className="flex items-center gap-2 sm:gap-3">
                <div className="hidden sm:flex flex-col text-right">
                  <span className="text-xs font-bold text-slate-800 font-heading leading-tight">
                    {user?.usuario}
                  </span>
                  <span className="text-[10px] text-teal-700 font-medium">
                    Rol: {user?.rol}
                  </span>
                </div>

                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => navigate(getDashboardRoute(user?.rol))}
                  className="shadow-xs font-semibold gap-1.5"
                >
                  <Activity className="w-4 h-4" />
                  <span>Mi Panel</span>
                </Button>

                <Button
                  variant="ghost"
                  size="sm"
                  onClick={clearAuthData}
                  className="text-slate-500 hover:text-slate-800 text-xs hidden sm:inline-flex"
                >
                  Cerrar Sesión
                </Button>
              </div>
            ) : (
              <>
                <Link to="/login">
                  <Button
                    variant="outline"
                    size="sm"
                    className="border-slate-200 text-slate-700 hover:bg-slate-50 hover:text-slate-900 font-semibold gap-1.5 shadow-xs"
                  >
                    <LogIn className="w-4 h-4 text-teal-600" />
                    <span>Iniciar Sesión</span>
                  </Button>
                </Link>

                <Link to="/register">
                  <Button
                    variant="primary"
                    size="sm"
                    className="shadow-sm font-semibold gap-1.5 bg-teal-600 hover:bg-teal-700 text-white"
                  >
                    <UserPlus className="w-4 h-4" />
                    <span>Registrarse</span>
                  </Button>
                </Link>
              </>
            )}
          </div>
        </div>
      </header>

      {/* Contenido Principal: Buscador Abierto B2C y Mapa Interactivo */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-6">
        {/* Banner Hero Sutil */}
        <div className="text-center sm:text-left max-w-3xl space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-teal-50 border border-teal-200/80 text-teal-700 text-xs font-semibold shadow-2xs mb-1">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Portal Abierto de Salud y Reserva Inmediata</span>
          </div>
          <h1 className="text-2xl sm:text-4xl font-bold font-heading text-slate-900 tracking-tight leading-tight">
            Encuentra a tu especialista y agenda tu turno en segundos
          </h1>
          <p className="text-sm sm:text-base text-slate-600 leading-relaxed">
            Explora profesionales médicos acreditados, consulta obras sociales aceptadas y ubica los consultorios en el mapa interactivo.
          </p>
        </div>

        {/* Toolbar de Filtros y Búsqueda Abierta */}
        <div className="space-y-4">
          <SearchFilters
            filters={filters}
            specialties={specialties}
            healthInsurances={healthInsurances}
            onFilterChange={updateFilter}
            onReset={resetFilters}
            totalResults={professionals.length}
          />

          {/* Botón de alternar mapa en móviles */}
          <div className="lg:hidden">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowMobileMap(!showMobileMap)}
              className="w-full gap-2 text-xs bg-white/80 border-slate-200"
            >
              <Map className="w-4 h-4 text-teal-600" aria-hidden="true" />
              <span>{showMobileMap ? 'Ocultar Mapa' : 'Explorar Consultorios en el Mapa'}</span>
            </Button>
          </div>
        </div>

        {/* Mapa en móviles si está desplegado */}
        {showMobileMap && (
          <div className="lg:hidden mb-4">
            <InteractiveMapPlaceholder
              doctors={professionals}
              highlightedDoctorCuil={highlightedDoctorCuil}
              onSelectDoctor={(doc) => handleBookClick(doc)}
            />
          </div>
        )}

        {/* Grilla Principal: Tarjetas de Médicos (Izq) y Mapa Interactivo (Der) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Lista de Profesionales */}
          <section className="lg:col-span-7 space-y-4" aria-label="Lista de médicos disponibles">
            {isLoading ? (
              <div className="space-y-4">
                {[1, 2, 3].map((n) => (
                  <div
                    key={n}
                    className="bg-white/80 backdrop-blur rounded-2xl border border-slate-200 p-6 space-y-4 animate-pulse shadow-xs"
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
              <div className="bg-white/80 backdrop-blur border-2 border-dashed border-slate-200 rounded-2xl p-10 text-center space-y-3">
                <h3 className="text-base font-bold font-heading text-slate-800">
                  No se encontraron profesionales para este criterio
                </h3>
                <p className="text-xs text-slate-500 max-w-md mx-auto">
                  Prueba cambiando la especialidad o seleccionando otra cobertura médica en los filtros.
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
                  onBook={(doc) => handleBookClick(doc)}
                />
              ))
            )}
          </section>

          {/* Mapa Interactivo Fijo en Desktop */}
          <aside className="hidden lg:block lg:col-span-5 sticky top-28" aria-label="Mapa de consultorios">
            <InteractiveMapPlaceholder
              doctors={professionals}
              highlightedDoctorCuil={highlightedDoctorCuil}
              onSelectDoctor={(doc) => handleBookClick(doc)}
            />
          </aside>
        </div>
      </main>

      {/* Modal de Intercepción Auth Guard para Usuarios No Logueados */}
      <AuthRequiredModal
        isOpen={Boolean(authRequiredDoctor)}
        onClose={() => setAuthRequiredDoctor(null)}
        doctor={authRequiredDoctor}
      />

      {/* Modal de Reserva para Pacientes Autenticados */}
      {isAuthenticated && user?.rol === 'Paciente' && (
        <BookingModal
          isOpen={Boolean(selectedDoctorForBooking)}
          onClose={() => setSelectedDoctorForBooking(null)}
          doctor={selectedDoctorForBooking}
          onBookingSuccess={handleBookingSuccess}
        />
      )}

      {/* Pie de Página Público */}
      <footer className="mt-12 bg-white/70 border-t border-slate-200/80 py-4 px-6 sm:px-8 text-center text-xs text-slate-400 flex flex-col sm:flex-row items-center justify-between gap-2">
        <p className="text-[11px]">© 2026 TempusCare — Vitality. Todos los derechos reservados.</p>
        <p className="flex items-center gap-1 text-[11px]">
          <ShieldCheck className="w-3.5 h-3.5 text-teal-600" aria-hidden="true" />
          Plataforma médica adaptada a pautas de accesibilidad WCAG & Ley 25.326
        </p>
      </footer>
    </div>
  );
};

export default HomePage;
