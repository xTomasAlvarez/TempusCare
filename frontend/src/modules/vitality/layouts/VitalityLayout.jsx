import React from 'react';
import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../../core/context/AuthContext';
import {
  ShieldAlert,
  Building2,
  LogOut,
  Sparkles,
  Server,
  Layers,
  BarChart3,
} from 'lucide-react';
import { Button } from '../../../shared/components/ui/Button';
import { Badge } from '../../../shared/components/ui/Badge';

/**
 * Layout Exclusivo y Minimalista para el Super Administrador (Dueño del SaaS Vitality).
 * Estética ejecutiva, sobria y de alta tecnología.
 */
export const VitalityLayout = () => {
  const { user, clearAuthData } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    clearAuthData();
    navigate('/login', { replace: true });
  };

  const navItems = [
    { label: 'Clientes B2B', path: '/vitality/clients', icon: Building2 },
  ];

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col text-slate-900 font-sans">
      {/* Barra de Navegación Ejecutiva Minimalista */}
      <header className="bg-white border-b border-slate-200/80 sticky top-0 z-30 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          {/* Marca / Identidad Vitality */}
          <div className="flex items-center gap-6 sm:gap-8">
            <Link
              to="/vitality/clients"
              tabIndex={0}
              aria-label="Vitality Consola de Super Administrador"
              className="flex items-center gap-3 rounded-xl p-1 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-600 to-teal-600 flex items-center justify-center text-white shadow-xs">
                <Sparkles className="w-5 h-5" aria-hidden="true" />
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xl font-bold font-heading tracking-tight text-slate-900">
                  Vitality<span className="text-indigo-600 font-normal ml-0.5">OS</span>
                </span>
                <span className="text-[10px] font-bold uppercase tracking-wider bg-indigo-50 border border-indigo-200 text-indigo-700 px-2 py-0.5 rounded-full">
                  Super Admin
                </span>
              </div>
            </Link>

            {/* Enlaces de Navegación Minimalistas */}
            <nav aria-label="Navegación de administración global" className="hidden md:flex items-center gap-1">
              {navItems.map((item) => {
                const isActive = location.pathname === item.path;
                const Icon = item.icon;
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    tabIndex={0}
                    className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs sm:text-sm font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
                      isActive
                        ? 'bg-indigo-50 text-indigo-700 font-bold'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                    }`}
                  >
                    <Icon className={`w-4 h-4 ${isActive ? 'text-indigo-600' : 'text-slate-400'}`} aria-hidden="true" />
                    <span>{item.label}</span>
                  </Link>
                );
              })}
            </nav>
          </div>

          {/* Estado del Sistema y Perfil */}
          <div className="flex items-center gap-4">
            {/* Pill de Estado del SaaS */}
            <div className="hidden sm:flex items-center gap-2 px-2.5 py-1 rounded-full bg-slate-100 border border-slate-200 text-[11px] text-slate-600 font-medium">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>SaaS Operativo</span>
            </div>

            {/* Usuario y Salir */}
            <div className="flex items-center gap-3">
              <div className="hidden sm:flex flex-col items-end">
                <span className="text-xs font-bold text-slate-800 font-heading">
                  {user?.usuario || 'Super Admin'}
                </span>
                <span className="text-[10px] text-indigo-700 font-mono">Consola Global</span>
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
      </header>

      {/* Área Central de Contenido */}
      <main id="main-content" className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        <Outlet />
      </main>

      {/* Pie de Página Minimalista */}
      <footer className="bg-white border-t border-slate-200/80 py-4 text-center text-xs text-slate-400">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>Vitality Health Tech Platform — Administración B2B Multi-Tenant</span>
          <span className="font-mono text-[11px]">Tempus Care Core v1.0</span>
        </div>
      </footer>
    </div>
  );
};
