import React from 'react';
import { Outlet, Link } from 'react-router-dom';

export const AuthLayout = () => {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col text-slate-900 font-sans selection:bg-primary-100 selection:text-primary-900 relative">
      {/* Elementos ambientales de diseño sutil Clean Health */}
      <div 
        className="pointer-events-none absolute -top-40 -right-40 w-96 h-96 bg-primary-200/30 rounded-full blur-3xl" 
        aria-hidden="true" 
      />
      <div 
        className="pointer-events-none absolute -bottom-40 -left-40 w-96 h-96 bg-secondary-200/20 rounded-full blur-3xl" 
        aria-hidden="true" 
      />

      {/* Header Accesible de Autenticación alineado a la izquierda */}
      <header className="w-full px-6 sm:px-8 py-4 flex items-center justify-between relative z-10 flex-shrink-0">
        <Link 
          to="/" 
          tabIndex={0}
          aria-label="Ir a página de inicio de TempusCare"
          className="flex items-center gap-2.5 rounded-xl p-1 focus:outline-none focus:ring-2 focus:ring-primary-500"
        >
          <img
            src="/tempuscare.png"
            alt="TempusCare Logo"
            className="w-9 h-9 object-contain"
          />
          <div className="flex flex-col">
            <span className="text-lg font-bold font-heading tracking-tight text-slate-900 block leading-tight">
              Tempus<span className="text-primary-600">Care</span>
            </span>
            <span className="text-sm text-slate-500 font-medium leading-normal block">
              Salud Inclusiva
            </span>
          </div>
        </Link>
      </header>

      {/* Contenido Principal centrado con espaciado vertical seguro */}
      <main id="main-content" className="flex-1 w-full flex flex-col justify-center items-center py-12 px-4 relative z-10">
        <Outlet />
      </main>
    </div>
  );
};
