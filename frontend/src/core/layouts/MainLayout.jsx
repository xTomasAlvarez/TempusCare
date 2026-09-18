import React from 'react';
import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { HeartPulse, LogOut, User, Building2, Stethoscope, Calendar, Search, LayoutDashboard } from 'lucide-react';
import { Button } from '../../shared/components/ui/Button';
import { ContextSwitcher } from '../../modules/professional/components/ContextSwitcher';

export const MainLayout = () => {
  const { user, clearAuthData } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    clearAuthData();
    navigate('/login', { replace: true });
  };

  const navLinks = React.useMemo(() => {
    if (!user) return [];

    switch (user.rol) {
      case 'Paciente':
        return [
          { label: 'Inicio', path: '/patient/dashboard', icon: LayoutDashboard },
          { label: 'Buscar Médicos', path: '/patient/search', icon: Search },
          { label: 'Mis Citas', path: '/patient/appointments', icon: Calendar },
        ];
      case 'AdminConsultorio':
        return [
          { label: 'Administración de Sede', path: '/institution/sede-admin', icon: Building2 },
          { label: 'Mesa de Recepción', path: '/institution/reception', icon: LayoutDashboard },
        ];
      case 'Institucion':
      case 'AdminInstitucion':
      case 'SuperAdmin':
        return [
          { label: 'Administración B2B', path: '/institution/admin', icon: Building2 },
          { label: 'Mesa de Recepción', path: '/institution/reception', icon: LayoutDashboard },
        ];
      case 'Asistente':
        return [
          { label: 'Mesa de Recepción', path: '/institution/reception', icon: LayoutDashboard },
        ];
      case 'Profesional':
        return [
          { label: 'Portal Médico', path: '/professional/dashboard', icon: Stethoscope },
        ];
      default:
        return [];
    }
  }, [user]);

  const getRoleBadge = (rol) => {
    switch (rol) {
      case 'Paciente':
        return <span className="bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs px-2.5 py-0.5 rounded-full font-medium">Paciente</span>;
      case 'Profesional':
        return <span className="bg-teal-50 text-teal-700 border border-teal-200 text-xs px-2.5 py-0.5 rounded-full font-medium">Médico / Profesional</span>;
      case 'Asistente':
        return <span className="bg-indigo-50 text-indigo-700 border border-indigo-200 text-xs px-2.5 py-0.5 rounded-full font-medium">Secretaría / Asistente</span>;
      case 'AdminConsultorio':
        return (
          <span className="bg-cyan-50 text-cyan-800 border border-cyan-200 text-xs px-2.5 py-0.5 rounded-full font-medium">
            Admin Sede {user?.sedeNombre ? `(${user.sedeNombre})` : ''}
          </span>
        );
      case 'AdminInstitucion':
        return <span className="bg-blue-50 text-blue-800 border border-blue-200 text-xs px-2.5 py-0.5 rounded-full font-medium">Admin Institución</span>;
      case 'SuperAdmin':
        return <span className="bg-purple-50 text-purple-800 border border-purple-200 text-xs px-2.5 py-0.5 rounded-full font-medium">Super Admin Vitality</span>;
      default:
        return <span className="bg-slate-100 text-slate-700 border border-slate-200 text-xs px-2.5 py-0.5 rounded-full font-medium">Administrador</span>;
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col text-slate-900 font-sans">
      {/* Barra Superior de Navegación Accesible */}
      <header className="bg-white border-b border-slate-200/80 sticky top-0 z-30 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-6 sm:gap-8">
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

            {/* Enlaces de Navegación en Desktop */}
            {navLinks.length > 0 && (
              <nav aria-label="Navegación principal" className="hidden md:flex items-center gap-1">
                {navLinks.map((item) => {
                  const isActive = location.pathname === item.path;
                  const Icon = item.icon;
                  return (
                    <Link
                      key={item.path}
                      to={item.path}
                      tabIndex={0}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs sm:text-sm font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-teal-500 ${
                        isActive
                          ? 'bg-teal-50 text-teal-700 font-bold'
                          : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                      }`}
                    >
                      <Icon className={`w-4 h-4 ${isActive ? 'text-teal-600' : 'text-slate-400'}`} aria-hidden="true" />
                      <span>{item.label}</span>
                    </Link>
                  );
                })}
              </nav>
            )}
          </div>

          <div className="flex items-center gap-3">
            {user?.rol === 'Profesional' && (
              <ContextSwitcher />
            )}

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
      <main id="main-content" className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 pb-20 md:pb-8">
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
                className={`flex flex-col items-center gap-1 p-1.5 rounded-xl transition-colors focus:outline-none focus:ring-2 focus:ring-teal-500 ${
                  isActive ? 'text-teal-600 font-bold' : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                <Icon className={`w-5 h-5 ${isActive ? 'text-teal-600' : 'text-slate-400'}`} aria-hidden="true" />
                <span className="text-[10px] tracking-tight">{item.label}</span>
              </Link>
            );
          })}
        </nav>
      )}
    </div>
  );
};
