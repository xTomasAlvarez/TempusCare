import React from 'react';
import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../../../core/context/AuthContext';
import {
  ShieldAlert,
  Hospital,
  Stethoscope,
  ShieldPlus,
  LogOut,
  Sparkles,
  Server,
  Layers,
  BarChart3,
} from 'lucide-react';
import { Button } from '../../../shared/components/ui/Button';
import { Badge } from '../../../shared/components/ui/Badge';
import { AccessibilityMenu } from '../../../shared/components/ui/AccessibilityMenu';
import { useConfirmDelete } from '../../../shared/hooks/useConfirmDelete';
import { snappySpring } from '../../../shared/motion';

/**
 * Layout Exclusivo y Minimalista para el Super Administrador (Dueño del SaaS Vitality).
 * Estética ejecutiva, sobria y de alta tecnología.
 */
export const VitalityLayout = () => {
  const { user, clearAuthData } = useAuth();
  const { confirmDelete } = useConfirmDelete();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = async () => {
    const confirmed = await confirmDelete({
      title: '¿Estás seguro de cerrar sesión?',
      message: 'Finalizarás tu sesión actual en la Consola Global de VitalityOS y deberás volver a ingresar tus credenciales para acceder.',
      itemName: `${user?.nombreCompleto || 'Super Administrador'} — Consola Global`,
      confirmText: 'Sí, cerrar sesión',
      cancelText: 'Cancelar',
      iconType: 'logout',
    });
    if (!confirmed) return;
    clearAuthData();
    navigate('/login', { replace: true });
  };

  const navItems = [
    { label: 'Instituciones', path: '/vitality/clients', icon: Hospital },
    { label: 'Especialidades y Estudios', path: '/vitality/specialties', icon: Stethoscope },
    { label: 'Obras Sociales', path: '/vitality/insurance', icon: ShieldPlus },
    { label: 'Métricas', path: '/vitality/metrics', icon: BarChart3 },
    { label: 'Sistema', path: '/vitality/system', icon: Server },
    { label: 'Gestión de Admins', path: '/vitality/admins', icon: ShieldAlert },
  ];

  return (
    <div className="min-h-screen w-full overflow-x-hidden bg-slate-50 flex flex-col text-slate-900 font-sans">
      {/* Enlace para saltar directamente al contenido principal (WCAG 2.1 AA - RNF-ACC-02) */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2.5 focus:bg-primary-800 focus:text-white focus:font-bold focus:rounded-xl focus:shadow-2xl focus:outline-none focus:ring-4 focus:ring-amber-400 focus:ring-offset-2 transition-all"
      >
        Saltar al contenido principal
      </a>

      {/* Barra de Navegación Ejecutiva Minimalista */}
      <header className="bg-white border-b border-slate-200/80 sticky top-0 z-30 shadow-xs">
        <div className="w-full max-w-[1920px] mx-auto px-3 sm:px-6 lg:px-8 h-14 sm:h-16 flex items-center justify-between gap-2">
          {/* Marca / Identidad Vitality */}
          <div className="flex items-center gap-6 sm:gap-8">
            <Link
              to="/vitality/clients"
              tabIndex={0}
              title="Vitality Consola de Super Administrador"
              aria-label="Vitality Consola de Super Administrador"
              className="flex items-center rounded-xl p-1 focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              <img
                src="/vitality.png"
                alt="Vitality Logo"
                title="Logotipo de VitalityOS"
                className="h-9 w-auto object-contain"
              />
            </Link>

            {/* Enlaces de Navegación con Indicador Deslizante (Desktop) */}
            <nav aria-label="Navegación de administración global" className="hidden lg:flex items-center gap-1 relative">
              {navItems.map((item) => {
                const isActive = location.pathname === item.path;
                const Icon = item.icon;
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    tabIndex={0}
                    title={`Ir a ${item.label}`}
                    className={`relative flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs sm:text-sm font-semibold transition-transform duration-75 active:scale-[0.98] focus:outline-none focus:ring-2 focus:ring-primary-500 ${
                      isActive
                        ? 'text-primary-700 font-bold'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                    }`}
                  >
                    <Icon className={`w-4 h-4 relative z-10 ${isActive ? 'text-primary-600' : 'text-slate-400'}`} strokeWidth={2} aria-hidden="true" />
                    <span className="relative z-10">{item.label}</span>
                    {isActive && (
                      <motion.div
                        layoutId="vitality-active-pill"
                        className="absolute inset-0 bg-primary-50 rounded-xl"
                        transition={snappySpring}
                      />
                    )}
                  </Link>
                );
              })}
            </nav>
          </div>

          {/* Estado del Sistema, Accesibilidad y Perfil */}
          <div className="flex items-center gap-3">
            <AccessibilityMenu />

            {/* Usuario y Salir */}
            <div className="flex items-center gap-3">
              <div className="hidden sm:flex flex-col items-end">
                <span className="text-xs font-bold text-slate-800 font-heading">
                  {user?.nombreCompleto || 'Super Administrador'}
                </span>
                <span className="text-[10px] text-primary-700 font-mono">Consola Global</span>
              </div>

              <Button
                variant="outline"
                size="sm"
                onClick={handleLogout}
                aria-label="Cerrar sesión de Super Administrador"
                className="text-slate-600 hover:text-rose-600 hover:border-rose-200 text-xs"
              >
                <LogOut className="w-4 h-4" aria-hidden="true" />
                <span className="hidden md:inline">Salir</span>
              </Button>
            </div>
          </div>
        </div>

        {/* Sub-navegación para pantallas medianas y móviles */}
        <div className="lg:hidden border-t border-slate-100 bg-slate-50/90 px-4 py-2 overflow-x-auto scrollbar-none flex items-center gap-2">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path;
            const Icon = item.icon;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs whitespace-nowrap font-medium transition-colors ${
                  isActive
                    ? 'bg-primary-600 text-white font-bold shadow-xs'
                    : 'bg-white text-slate-700 border border-slate-200/80 hover:bg-slate-100'
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-white' : 'text-slate-500'}`} />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </div>
      </header>

      {/* Área Central de Contenido */}
      <main id="main-content" tabIndex="-1" className="flex-1 w-full max-w-[1920px] mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 focus:outline-none">
        <Outlet />
      </main>

      {/* Pie de Página Minimalista */}
      <footer className="bg-white border-t border-slate-200/80 py-4 px-4 sm:px-6 lg:px-8 text-center text-xs text-slate-400">
        <div className="w-full max-w-[1920px] mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>Vitality Health Tech Platform — Administración de Instituciones</span>
          <span className="font-mono text-[11px]">Tempus Care Core v1.0</span>
        </div>
      </footer>
    </div>
  );
};
