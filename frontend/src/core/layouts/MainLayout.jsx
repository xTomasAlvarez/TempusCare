import React from 'react';
import { Outlet, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { HeartPulse, LogOut, User, Building2, Stethoscope, Calendar, Settings } from 'lucide-react';
import { Button } from '../../shared/components/ui/Button';

export const MainLayout = () => {
  const { user, clearAuthData } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    clearAuthData();
    navigate('/login', { replace: true });
  };

  const getRoleBadge = (rol) => {
    switch (rol) {
      case 'Paciente':
        return <span className="bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs px-2.5 py-0.5 rounded-full font-medium">Paciente</span>;
      case 'Profesional':
        return <span className="bg-teal-50 text-teal-700 border border-teal-200 text-xs px-2.5 py-0.5 rounded-full font-medium">Médico / Profesional</span>;
      case 'Asistente':
        return <span className="bg-indigo-50 text-indigo-700 border border-indigo-200 text-xs px-2.5 py-0.5 rounded-full font-medium">Secretaría / Asistente</span>;
      default:
        return <span className="bg-slate-100 text-slate-700 border border-slate-200 text-xs px-2.5 py-0.5 rounded-full font-medium">Administrador</span>;
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col text-slate-900">
      {/* Barra Superior de Navegación Accesible */}
      <header className="bg-white border-b border-slate-200/80 sticky top-0 z-30 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-6">
            <Link
              to="/"
              tabIndex={0}
              aria-label="Ir al panel principal"
              className="flex items-center gap-2.5 rounded-xl p-1 focus:outline-none focus:ring-2 focus:ring-teal-500"
            >
              <div className="w-9 h-9 rounded-xl bg-teal-600 flex items-center justify-center text-white shadow-xs">
                <HeartPulse className="w-5 h-5" aria-hidden="true" />
              </div>
              <span className="text-lg font-bold font-heading tracking-tight text-slate-900">
                Tempus<span className="text-teal-600">Care</span>
              </span>
            </Link>
          </div>

          <div className="flex items-center gap-3">
            {user ? (
              <div className="flex items-center gap-3">
                <div className="hidden sm:flex flex-col items-end">
                  <span className="text-sm font-semibold text-slate-800">{user.usuario}</span>
                  {getRoleBadge(user.rol)}
                </div>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleLogout}
                  aria-label="Cerrar sesión"
                  className="text-slate-600 hover:text-rose-600 hover:border-rose-200"
                >
                  <LogOut className="w-4 h-4" aria-hidden="true" />
                  <span className="hidden md:inline">Salir</span>
                </Button>
              </div>
            ) : (
              <Link to="/login">
                <Button size="sm">Iniciar Sesión</Button>
              </Link>
            )}
          </div>
        </div>
      </header>

      {/* Área Central de Contenido */}
      <main id="main-content" className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        <Outlet />
      </main>
    </div>
  );
};
