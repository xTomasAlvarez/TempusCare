import React from 'react';
import { Outlet, Link } from 'react-router-dom';
import { HeartPulse } from 'lucide-react';

export const AuthLayout = () => {
  return (
    <div className="h-screen max-h-screen bg-slate-50 flex flex-col text-slate-900 font-sans selection:bg-teal-100 selection:text-teal-900 relative overflow-hidden">
      {/* Elementos ambientales de diseño sutil Clean Health */}
      <div 
        className="pointer-events-none absolute -top-40 -right-40 w-96 h-96 bg-teal-200/30 rounded-full blur-3xl" 
        aria-hidden="true" 
      />
      <div 
        className="pointer-events-none absolute -bottom-40 -left-40 w-96 h-96 bg-emerald-200/20 rounded-full blur-3xl" 
        aria-hidden="true" 
      />

      {/* Header Accesible de Autenticación alineado a la izquierda */}
      <header className="w-full px-6 sm:px-8 py-3 sm:py-3.5 flex items-center justify-between relative z-10 flex-shrink-0">
        <Link 
          to="/" 
          tabIndex={0}
          aria-label="Ir a página de inicio de TempusCare"
          className="flex items-center gap-2.5 rounded-xl p-1 focus:outline-none focus:ring-2 focus:ring-teal-500"
        >
          <div className="w-9 h-9 rounded-xl bg-teal-600 flex items-center justify-center text-white shadow-sm shadow-teal-600/20">
            <HeartPulse className="w-5 h-5" aria-hidden="true" />
          </div>
          <div>
            <span className="text-lg font-bold font-heading tracking-tight text-slate-900 block leading-tight">
              Tempus<span className="text-teal-600">Care</span>
            </span>
            <span className="text-[10px] font-medium tracking-widest text-slate-400 uppercase block">
              Salud Inclusiva
            </span>
          </div>
        </Link>
      </header>

      {/* Contenido Principal perfectamente centrado y alineado */}
      <main id="main-content" className="flex-1 flex items-center justify-center px-4 relative z-10">
        <Outlet />
      </main>
    </div>
  );
};
