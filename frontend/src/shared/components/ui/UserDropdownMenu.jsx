import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { LogOut, ChevronDown, LayoutDashboard, CalendarHeart } from 'lucide-react';
import { useAuth } from '../../../core/context/AuthContext';

// Mapeo defensivo de nombres reales para perfiles sembrados de prueba
const KNOWN_REAL_NAMES = {
  '27000000001': 'Ana García',
  '20123456789': 'Dr. Carlos Pérez',
  '27223344551': 'Dra. Valeria Gómez',
  '27301112221': 'Dra. Sofía Martínez',
  '20312223331': 'Dr. Martín Benítez',
  '20284445551': 'Dr. Fernando Morales',
  '27325556661': 'Dra. Camila Rossi',
  '27296667771': 'Dra. Mariana López',
  '20347778881': 'Dr. Lucas Navarro',
  '20258889991': 'Dr. Esteban Vega',
  '27289990001': 'Dra. Gabriela Castro',
  '27111111111': 'Lucía Fernández',
  '20334455667': 'Roberto Sánchez',
  'admin.cons101': 'Roberto Sánchez',
  '30111222334': 'Sanatorio Tucumán',
  '30555666778': 'Clínica Mayo',
  'admin@vitality.com': 'Super Administrador Vitality',
};

/**
 * Obtiene el nombre real representativo del usuario autenticado
 */
export const getDisplayName = (user) => {
  if (!user) return 'Usuario';
  if (user.nombreCompleto && user.nombreCompleto !== user.usuario) {
    return user.nombreCompleto;
  }
  if (user.usuario && KNOWN_REAL_NAMES[user.usuario]) {
    return KNOWN_REAL_NAMES[user.usuario];
  }
  if (user.cuil && KNOWN_REAL_NAMES[user.cuil]) {
    return KNOWN_REAL_NAMES[user.cuil];
  }
  if (user.nombre && user.apellido) {
    return `${user.nombre} ${user.apellido}`.trim();
  }
  return user.usuario || 'Usuario';
};

/**
 * Obtiene las iniciales para el avatar
 */
const getInitials = (name) => {
  if (!name) return 'U';
  const clean = name.replace(/^Dr\(a\)\.\s*|^Dr\.\s*|^Dra\.\s*/i, '').trim();
  const parts = clean.split(' ').filter(Boolean);
  if (parts.length >= 2) {
    return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
  }
  return clean.substring(0, 2).toUpperCase() || 'U';
};

/**
 * Badge corporativo de rol de usuario
 */
const getRoleTag = (rol) => {
  switch (rol) {
    case 'Paciente':
      return { label: 'Paciente', bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-200' };
    case 'Profesional':
      return { label: 'Médico Especialista', bg: 'bg-primary-50', text: 'text-primary-700', border: 'border-primary-200' };
    case 'Asistente':
      return { label: 'Recepción y Asistencia', bg: 'bg-indigo-50', text: 'text-indigo-700', border: 'border-indigo-200' };
    case 'AdminConsultorio':
      return { label: 'Admin Sede', bg: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-200' };
    case 'AdminInstitucion':
    case 'Institucion':
      return { label: 'Institución', bg: 'bg-sky-50', text: 'text-sky-700', border: 'border-sky-200' };
    case 'SuperAdmin':
      return { label: 'Super Admin', bg: 'bg-purple-50', text: 'text-purple-700', border: 'border-purple-200' };
    default:
      return { label: rol || 'Usuario', bg: 'bg-slate-50', text: 'text-slate-700', border: 'border-slate-200' };
  }
};

export const UserDropdownMenu = () => {
  const { user, clearAuthData, getDashboardRoute } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef(null);
  const navigate = useNavigate();

  const realName = getDisplayName(user);
  const initials = getInitials(realName);
  const roleTag = getRoleTag(user?.rol);

  // Cerrar el menú al hacer clic fuera o presionar Escape
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    const handleKeyDown = (event) => {
      if (event.key === 'Escape') {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('keydown', handleKeyDown);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen]);

  const handleLogout = () => {
    setIsOpen(false);
    clearAuthData();
    navigate('/', { replace: true });
  };

  const handleGoDashboard = () => {
    setIsOpen(false);
    const route = getDashboardRoute(user?.rol);
    navigate(route);
  };

  if (!user) return null;

  return (
    <div className="relative" ref={menuRef}>
      {/* Botón / Avatar disparador que exhibe el nombre real */}
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        aria-haspopup="true"
        aria-expanded={isOpen}
        aria-label={`Menú de usuario: ${realName}`}
        className={`flex items-center gap-2.5 p-1.5 sm:px-3 sm:py-1.5 rounded-xl border transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-primary-500 cursor-pointer ${
          isOpen
            ? 'bg-primary-50/80 border-primary-300 shadow-xs'
            : 'bg-white hover:bg-slate-50 border-slate-200/90 shadow-xs'
        }`}
      >
        {/* Avatar visual con iniciales */}
        <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-gradient-to-br from-primary-600 to-primary-800 text-white font-bold text-xs sm:text-sm flex items-center justify-center shadow-xs select-none flex-shrink-0">
          {initials}
        </div>

        {/* Nombre real y Rol en pantallas medianas y superiores */}
        <div className="hidden sm:flex flex-col text-left max-w-[150px] md:max-w-[190px]">
          <span className="text-xs sm:text-sm font-bold text-slate-800 font-heading leading-tight truncate">
            {realName}
          </span>
          <span className="text-[10px] text-slate-500 font-medium truncate">
            {roleTag.label}
          </span>
        </div>

        {/* Icono de flecha indicadora */}
        <ChevronDown
          className={`w-4 h-4 text-slate-400 transition-transform duration-200 flex-shrink-0 ${
            isOpen ? 'rotate-180 text-primary-600' : ''
          }`}
          aria-hidden="true"
        />
      </button>

      {/* Menú Desplegable Flotante */}
      {isOpen && (
        <div
          role="menu"
          aria-orientation="vertical"
          className="absolute right-0 top-full mt-2 w-64 rounded-2xl bg-white shadow-xl border border-slate-200/90 p-2 z-50 animate-in fade-in slide-in-from-top-2 duration-150 focus:outline-none"
        >
          {/* Cabecera del Dropdown con información completa del usuario */}
          <div className="px-3 py-2.5 bg-slate-50/80 rounded-xl mb-1.5 border border-slate-100">
            <p className="text-xs font-bold text-slate-900 font-heading leading-tight">
              {realName}
            </p>
            <p className="text-[11px] text-slate-500 font-mono truncate mt-0.5">
              {user.mail || user.usuario}
            </p>
            <div className="mt-2 flex items-center gap-1.5">
              <span
                className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-semibold border ${roleTag.bg} ${roleTag.text} ${roleTag.border}`}
              >
                {roleTag.label}
              </span>
            </div>
          </div>

          {/* Opciones de Navegación según Rol */}
          <div className="space-y-0.5 py-1">
            <button
              type="button"
              role="menuitem"
              onClick={handleGoDashboard}
              className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-slate-700 hover:text-primary-700 hover:bg-primary-50 transition-colors cursor-pointer"
            >
              <LayoutDashboard className="w-4 h-4 text-primary-600 shrink-0" />
              <span>Mi Panel Principal</span>
            </button>

            {user.rol === 'Paciente' && (
              <button
                type="button"
                role="menuitem"
                onClick={() => {
                  setIsOpen(false);
                  navigate('/patient/appointments');
                }}
                className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-slate-700 hover:text-primary-700 hover:bg-primary-50 transition-colors cursor-pointer"
              >
                <CalendarHeart className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Mis Turnos Médicos</span>
              </button>
            )}
          </div>

          {/* Separador */}
          <div className="border-t border-slate-100 my-1" />

          {/* Opción Obligatoria: Cerrar Sesión */}
          <button
            type="button"
            role="menuitem"
            onClick={handleLogout}
            className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-rose-600 hover:bg-rose-50 hover:text-rose-700 transition-colors cursor-pointer"
          >
            <LogOut className="w-4 h-4 text-rose-500 shrink-0" />
            <span>Cerrar Sesión</span>
          </button>
        </div>
      )}
    </div>
  );
};

export default UserDropdownMenu;
