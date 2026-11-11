import React from 'react';
import { Check, X, ShieldAlert, ShieldCheck } from 'lucide-react';
import { cn } from '../../utils/cn';

/**
 * Función pura para evaluar el cumplimiento de las condiciones de seguridad
 */
export const checkPasswordConditions = (password = '') => {
  const value = password || '';
  return {
    minLength: value.length >= 8,
    hasUpper: /[A-Z]/.test(value),
    hasLower: /[a-z]/.test(value),
    hasNumber: /[0-9]/.test(value),
    hasSpecial: /[^A-Za-z0-9]/.test(value),
  };
};

/**
 * Determina el nivel de fortaleza de la contraseña
 */
export const getPasswordStrength = (conditions) => {
  const metCount = Object.values(conditions).filter(Boolean).length;
  if (metCount <= 2) {
    return { score: metCount, label: 'Débil', color: 'bg-rose-500', textColor: 'text-rose-600', percent: 20 * metCount };
  }
  if (metCount <= 4) {
    return { score: metCount, label: 'Media', color: 'bg-amber-500', textColor: 'text-amber-600', percent: 20 * metCount };
  }
  return { score: metCount, label: 'Segura', color: 'bg-emerald-500', textColor: 'text-emerald-600', percent: 100 };
};

/**
 * Componente visual de requisitos mínimos de contraseña
 */
export const PasswordRequirements = ({ password = '', className }) => {
  const conditions = checkPasswordConditions(password);
  const strength = getPasswordStrength(conditions);
  const isStarted = (password || '').length > 0;

  const requirementsList = [
    { key: 'minLength', label: 'Mínimo 8 caracteres', met: conditions.minLength },
    { key: 'hasUpper', label: 'Al menos una mayúscula (A-Z)', met: conditions.hasUpper },
    { key: 'hasLower', label: 'Al menos una minúscula (a-z)', met: conditions.hasLower },
    { key: 'hasNumber', label: 'Al menos un número (0-9)', met: conditions.hasNumber },
    { key: 'hasSpecial', label: 'Al menos un símbolo (!@#$%)', met: conditions.hasSpecial },
  ];

  return (
    <div
      className={cn(
        'p-2.5 rounded-xl bg-slate-50/80 border border-slate-200/80 space-y-1.5 text-xs transition-all duration-150',
        className
      )}
      aria-live="polite"
      title="Requisitos de seguridad obligatorios para la contraseña"
    >
      {/* Barra de Fuerza y Etiqueta */}
      <div className="flex items-center justify-between gap-2">
        <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider">
          Seguridad de la contraseña
        </span>
        <span className={cn('text-[10px] font-bold font-mono', isStarted ? strength.textColor : 'text-slate-400')}>
          {isStarted ? strength.label : 'Requerida'}
        </span>
      </div>

      <div className="w-full h-1 bg-slate-200 rounded-full overflow-hidden">
        <div
          className={cn('h-full transition-all duration-300 ease-out', strength.color)}
          style={{ width: isStarted ? `${strength.percent}%` : '0%' }}
        />
      </div>

      {/* Checklist de Condiciones */}
      <ul className="grid grid-cols-1 sm:grid-cols-2 gap-1 pt-0.5">
        {requirementsList.map((req) => (
          <li
            key={req.key}
            title={`${req.label}: ${req.met ? 'Cumplido' : 'Pendiente'}`}
            className={cn(
              'flex items-center gap-1.5 text-[11px] transition-colors duration-150 font-medium',
              req.met
                ? 'text-emerald-700 font-semibold'
                : isStarted
                ? 'text-slate-500'
                : 'text-slate-400'
            )}
          >
            <span
              className={cn(
                'w-3.5 h-3.5 rounded-full flex items-center justify-center shrink-0 transition-all duration-150',
                req.met
                  ? 'bg-emerald-100 text-emerald-600'
                  : 'bg-slate-200/80 text-slate-400'
              )}
            >
              {req.met ? <Check className="w-2.5 h-2.5 stroke-[3]" /> : <span className="w-1.5 h-1.5 rounded-full bg-slate-400" />}
            </span>
            <span className="truncate">{req.label}</span>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default PasswordRequirements;
