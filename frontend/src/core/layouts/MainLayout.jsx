import React from 'react';
import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { Hospital, Stethoscope, CalendarHeart, BriefcaseMedical, HeartPulse, ShieldPlus, CalendarDays } from 'lucide-react';
import { Button } from '../../shared/components/ui/Button';
import { ContextSwitcher } from '../../modules/professional/components/ContextSwitcher';
import { UserDropdownMenu } from '../../shared/components/ui/UserDropdownMenu';
import { AccessibilityMenu } from '../../shared/components/ui/AccessibilityMenu';
import { snappySpring } from '../../shared/motion';

export const MainLayout = () => {
  const { user } = useAuth();
  const location = useLocation();

  const navLinks = React.useMemo(() => {
    if (!user) return [];

    switch (user.rol) {
      case 'Paciente':
        return [
          { label: 'Inicio', path: '/patient/dashboard', icon: HeartPulse },
          { label: 'Buscar Médicos', path: '/patient/search', icon: Stethoscope },
          { label: 'Mis Citas', path: '/patient/appointments', icon: CalendarHeart },
          { label: 'Calendario', path: '/patient/calendar', icon: CalendarDays },
        ];
      case 'AdminConsultorio':
        return [
          { label: 'Administración de Sede', path: '/institution/sede-admin', icon: Hospital },
        ];
      case 'Institucion':
      case 'AdminInstitucion':
        return [
          { label: 'Sedes y Consultorios', path: '/institution/admin', icon: Hospital },
        ];
      case 'SuperAdmin':
        return [
          { label: 'Consola Vitality', path: '/vitality/clients', icon: Hospital },
        ];
      case 'Asistente':
        return [
          { label: 'Mesa de Recepción', path: '/institution/reception', icon: BriefcaseMedical },
          { label: 'Configuración Médica', path: '/institution/configuracion-medica', icon: ShieldPlus },
        ];
      case 'Profesional':
        return [
          { label: 'Portal Médico', path: '/professional/dashboard', icon: Stethoscope },
        ];
      default:
        return [];
    }
  }, [user]);

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col text-slate-900 font-sans">
      {/* Enlace para saltar directamente al contenido principal (WCAG 2.1 AA - RNF-ACC-02) */}
      <a
        href="#main-content"
        title="Saltar directamente al contenido principal de la página"
        className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2.5 focus:bg-primary-800 focus:text-white focus:font-bold focus:rounded-xl focus:shadow-2xl focus:outline-none focus:ring-4 focus:ring-amber-400 focus:ring-offset-2 transition-all"
      >
        Saltar al contenido principal
      </a>

      {/* Barra Superior de Navegación Accesible */}
      <header className="bg-white border-b border-slate-200/80 sticky top-0 z-30 shadow-xs">
        <div className="w-full max-w-[1920px] mx-auto px-4 sm:px-6 lg:px-8 h-16 sm:h-20 flex items-center justify-between gap-4">
          <div className="flex items-center gap-6 sm:gap-8">
            {/* Identidad Visual: Logo del proyecto y Eslogan sutil */}
            <Link
              to="/"
              tabIndex={0}
              title="Ir a la página principal de TempusCare"
              aria-label="Ir al inicio de TempusCare"
              className="flex items-center gap-3 rounded-xl p-1 focus:outline-none focus:ring-2 focus:ring-primary-500 group"
            >
              <img
                src={user?.rol === 'SuperAdmin' ? '/vitality.png' : '/tempuscare.png'}
                alt={user?.rol === 'SuperAdmin' ? 'Vitality Logo' : 'TempusCare Logo'}
                title={user?.rol === 'SuperAdmin' ? 'Logotipo de VitalityOS' : 'Logotipo de TempusCare'}
                className="w-10 h-10 object-contain transition-transform group-hover:scale-105"
              />
              <div className="flex flex-col">
                <span className="text-lg sm:text-xl font-bold font-heading tracking-tight text-slate-900 leading-tight">
                  {user?.rol === 'SuperAdmin' ? (
                    <>Vitality<span className="text-primary-600">OS</span></>
                  ) : (
                    <>Tempus<span className="text-primary-600">Care</span></>
                  )}
                </span>
                <span className="text-sm text-slate-500 font-medium leading-normal hidden sm:block">
                  Salud Inclusiva
                </span>
              </div>
            </Link>

            {/* Enlaces de Navegación en Desktop con Indicador Deslizante */}
            {navLinks.length > 0 && (
              <nav aria-label="Navegación principal" className="hidden md:flex items-center gap-1 relative">
                {navLinks.map((item) => {
                  const isActive = location.pathname === item.path;
                  const Icon = item.icon;
                  return (
                    <Link
                      key={item.path}
                      to={item.path}
                      tabIndex={0}
                      title={`Ir a ${item.label}`}
                      className={`relative flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs sm:text-sm font-semibold transition-transform duration-75 active:scale-[0.98] focus:outline-none focus:ring-2 focus:ring-primary-500 ${
                        isActive
                          ? 'text-primary-700 font-bold'
                          : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                      }`}
                    >
                      <Icon className={`w-4 h-4 relative z-10 ${isActive ? 'text-primary-600' : 'text-slate-400'}`} strokeWidth={2} aria-hidden="true" />
                      <span className="relative z-10">{item.label}</span>
                      {isActive && (
                        <motion.div
                          layoutId="main-nav-pill"
                          className="absolute inset-0 bg-primary-50 rounded-xl"
                          transition={snappySpring}
                        />
                      )}
                    </Link>
                  );
                })}
              </nav>
            )}
          </div>

          <div className="flex items-center gap-2.5 sm:gap-3">
            {/* Opciones de Accesibilidad Web (WCAG AAA) */}
            <AccessibilityMenu />

            {user?.rol === 'Profesional' && (
              <ContextSwitcher />
            )}

            {user ? (
              <UserDropdownMenu />
            ) : (
              <Link to="/login" title="Ir a la pantalla de inicio de sesión">
                <Button size="sm" title="Iniciar Sesión en TempusCare">Iniciar Sesión</Button>
              </Link>
            )}
          </div>
        </div>
      </header>

      {/* Área Central de Contenido */}
      <main id="main-content" tabIndex="-1" className="flex-1 w-full max-w-[1920px] mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 pb-20 md:pb-8 focus:outline-none">
        <Outlet />
      </main>

      {/* Menú de Navegación Inferior Móvil (Bottom Navigation) */}
      {navLinks.length > 0 && (
        <nav
          aria-label="Navegación inferior móvil"
          className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-200/80 px-4 py-2 flex items-center justify-around shadow-lg"
        >
          {navLinks.map((item) => {
            const isActive = location.pathname === item.path;
            const Icon = item.icon;
            return (
              <Link
                key={item.path}
                to={item.path}
                tabIndex={0}
                title={`Ir a ${item.label}`}
                className={`flex flex-col items-center gap-1 p-1.5 rounded-xl transition-transform duration-75 active:scale-[0.98] focus:outline-none focus:ring-2 focus:ring-primary-500 ${
                  isActive ? 'text-primary-600 font-bold' : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                <Icon className={`w-5 h-5 ${isActive ? 'text-primary-600' : 'text-slate-400'}`} strokeWidth={2} aria-hidden="true" />
                <span className="text-[10px] tracking-tight">{item.label}</span>
              </Link>
            );
          })}
        </nav>
      )}
    </div>
  );
};
