import React from 'react';
import { Outlet, Link } from 'react-router-dom';
import { Activity, ShieldCheck, HeartPulse } from 'lucide-react';

export const AuthLayout = () => {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-between text-slate-900 selection:bg-teal-100 selection:text-teal-900 relative overflow-hidden">
      {/* Elementos ambientales de diseño sutil Clean Health */}
      <div 
        className="pointer-events-none absolute -top-40 -right-40 w-96 h-96 bg-teal-200/30 rounded-full blur-3xl" 
        aria-hidden="true" 
      />
      <div 
        className="pointer-events-none absolute -bottom-40 -left-40 w-96 h-96 bg-emerald-200/20 rounded-full blur-3xl" 
        aria-hidden="true" 
      />

      {/* Header Accesible de Autenticación */}
      <header className="w-full max-w-7xl mx-auto px-6 py-6 flex items-center justify-between relative z-10">
        <Link 
          to="/" 
          tabIndex={0}
          aria-label="Ir a página de inicio de TempusCare"
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

        <div className="flex items-center gap-2 text-xs font-medium text-slate-500 bg-white/80 backdrop-blur border border-slate-200/60 rounded-full px-3 py-1.5 shadow-sm">
          <ShieldCheck className="w-4 h-4 text-teal-600" aria-hidden="true" />
          <span>Acceso Seguro Encriptado</span>
        </div>
      </header>

      {/* Contenido Principal con Semántica HTML (<main>) */}
      <main id="main-content" className="flex-1 flex items-center justify-center p-4 sm:p-6 lg:p-8 relative z-10">
        <Outlet />
      </main>

      {/* Footer con Mención de Accesibilidad y Ley 25.326 */}
      <footer className="w-full max-w-7xl mx-auto px-6 py-4 text-center text-xs text-slate-400 border-t border-slate-200/60 flex flex-col sm:flex-row items-center justify-between gap-2 relative z-10">
        <p>© 2026 TempusCare — Vitality. Todos los derechos reservados.</p>
        <p className="flex items-center gap-1">
          <Activity className="w-3.5 h-3.5 text-teal-600" aria-hidden="true" />
          Plataforma adaptada a pautas de accesibilidad WCAG & Ley 25.326
        </p>
      </footer>
    </div>
  );
};
