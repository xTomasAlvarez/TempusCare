import React from 'react';
import { User, Calendar as CalendarIcon, Plus, RotateCcw, UserPlus } from 'lucide-react';
import { Button } from '../../../shared/components/ui/Button';

export const ReceptionFilters = ({
  doctors = [],
  selectedDoctorCuil,
  onDoctorChange,
  selectedDate,
  onDateChange,
  onOpenCreateAgenda,
  onOpenCreateWalkInPatient,
  onRefresh,
  isLoading = false,
}) => {
  const getTodayStr = () => new Date().toISOString().split('T')[0];
  const getTomorrowStr = () => {
    const d = new Date();
    d.setDate(d.getDate() + 1);
    return d.toISOString().split('T')[0];
  };

  const isToday = selectedDate === getTodayStr();
  const isTomorrow = selectedDate === getTomorrowStr();

  return (
    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
      {/* Grupo Izquierdo de Controles */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-4 flex-1 flex-wrap">
        {/* Selector de Médico */}
        <div className="flex items-center gap-2 min-w-[260px]">
          <div className="w-9 h-9 rounded-lg bg-teal-50 text-teal-700 flex items-center justify-center shrink-0 border border-teal-100">
            <User className="w-4 h-4" aria-hidden="true" />
          </div>
          <div className="flex-1">
            <label htmlFor="filter-reception-doctor" className="sr-only">
              Seleccionar Médico
            </label>
            <select
              id="filter-reception-doctor"
              value={selectedDoctorCuil}
              onChange={(e) => onDoctorChange(e.target.value)}
              className="w-full h-10 px-3 pr-8 rounded-lg border border-slate-200 bg-slate-50/50 hover:bg-white text-sm font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:bg-white transition-colors cursor-pointer"
            >
              {doctors.map((doc) => (
                <option key={doc.cuil} value={doc.cuil}>
                  Dr. {doc.nombre} {doc.apellido} — {doc.especialidades?.[0] || 'Medicina'}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="hidden sm:block h-6 w-px bg-slate-200" aria-hidden="true" />

        {/* Date Picker con Accesos Rápidos */}
        <div className="flex items-center gap-2">
          <div className="relative flex items-center">
            <input
              id="filter-reception-date"
              type="date"
              value={selectedDate}
              onChange={(e) => onDateChange(e.target.value)}
              aria-label="Seleccionar fecha de atención"
              className="h-10 px-3 rounded-lg border border-slate-200 bg-slate-50/50 hover:bg-white text-sm font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:bg-white transition-colors cursor-pointer"
            />
          </div>

          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg">
            <button
              type="button"
              onClick={() => onDateChange(getTodayStr())}
              className={`h-8 px-3 rounded-md text-xs font-semibold transition-all ${
                isToday
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
              }`}
            >
              Hoy
            </button>
            <button
              type="button"
              onClick={() => onDateChange(getTomorrowStr())}
              className={`h-8 px-3 rounded-md text-xs font-semibold transition-all ${
                isTomorrow
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
              }`}
            >
              Mañana
            </button>
          </div>

          <button
            type="button"
            onClick={onRefresh}
            disabled={isLoading}
            aria-label="Actualizar datos del tablero"
            className="w-10 h-10 rounded-lg border border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-slate-50 flex items-center justify-center transition-colors focus:outline-none focus:ring-2 focus:ring-teal-500 shrink-0"
          >
            <RotateCcw className={`w-4 h-4 ${isLoading ? 'animate-spin text-teal-600' : ''}`} aria-hidden="true" />
          </button>
        </div>
      </div>

      {/* Botones de Acción de Recepción */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 shrink-0">
        <Button
          variant="outline"
          size="md"
          onClick={onOpenCreateWalkInPatient}
          className="w-full sm:w-auto gap-2 rounded-xl shadow-xs font-semibold border-teal-200 text-teal-800 hover:bg-teal-50 hover:text-teal-900"
        >
          <UserPlus className="w-4 h-4 text-teal-600" aria-hidden="true" />
          <span>+ Nuevo Paciente Presencial</span>
        </Button>

        <Button
          variant="primary"
          size="md"
          onClick={onOpenCreateAgenda}
          className="w-full sm:w-auto gap-2 rounded-xl shadow-xs font-semibold"
        >
          <Plus className="w-4 h-4" aria-hidden="true" />
          <span>+ Nueva Agenda Horaria</span>
        </Button>
      </div>
    </div>
  );
};
