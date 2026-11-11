import React from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../../../core/context/AuthContext';
import { CoverageParameterizationForm } from '../components/CoverageParameterizationForm';
import { ShieldCheck, Stethoscope } from 'lucide-react';
import { pageTransitionVariants } from '../../../shared/motion';

/**
 * Página Exclusiva de Secretaría / Asistente para la Parametrización de Cobertura y Estudios (RN-02).
 * Responsabilidad Exclusiva del Asistente:
 * Establecer qué estudios realiza cada profesional y qué obras sociales acepta para esos estudios específicos.
 */
export const CoverageParameterizationPage = () => {
  const { user } = useAuth();

  return (
    <motion.div variants={pageTransitionVariants} initial="hidden" animate="visible" className="space-y-6 w-full max-w-[1920px] mx-auto">
      {/* Encabezado Principal */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-primary-50 border border-primary-100 flex items-center justify-center text-primary-600 shadow-xs">
              <ShieldCheck className="w-5 h-5" strokeWidth={2} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl sm:text-3xl font-bold font-heading text-slate-900 tracking-tight">
                  Configuración Médica
                </h1>
              </div>
            </div>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Define los estudios que realiza cada profesional en esta sede y las obras sociales aceptadas para cada combinación.
          </p>
        </div>

        <div className="flex items-center gap-3">
          {user?.sedeNombre && (
            <div className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 text-xs font-semibold text-slate-700">
              <span>Sede: {user.sedeNombre}</span>
            </div>
          )}
          <div className="hidden sm:flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white border border-slate-200/80 text-xs text-slate-600 shadow-xs">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>Asistente a cargo: <strong>{user?.nombreCompleto || (user?.nombre && user?.apellido ? `${user.nombre} ${user.apellido}` : 'Asistente de Sede')}</strong></span>
          </div>
        </div>
      </div>

      {/* Formulario Reactivo y Seguro de Parametrización */}
      <CoverageParameterizationForm />
    </motion.div>
  );
};

export default CoverageParameterizationPage;
