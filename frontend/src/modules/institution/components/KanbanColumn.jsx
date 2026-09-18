import React from 'react';
import { KanbanCard } from './KanbanCard';

export const KanbanColumn = ({
  title,
  count = 0,
  icon: Icon,
  columnType,
  items = [],
  isLoading = false,
  isActionLoading = false,
  emptyMessage = 'No hay pacientes en esta etapa',
  onMarkArrived,
  onStartAttention,
  onFinishAttention,
  onCancel,
}) => {
  return (
    <div className="flex flex-col min-w-[280px] w-full max-w-sm bg-slate-50/50 rounded-2xl p-4">
      {/* Cabecera Sutil sin bordes duros */}
      <div className="flex items-center justify-between gap-2 pb-3 mb-3 border-b border-slate-200/60">
        <div className="flex items-center gap-2">
          <Icon className="w-4 h-4 text-slate-500" aria-hidden="true" />
          <h3 className="text-sm font-heading font-semibold text-slate-800 tracking-tight">
            {title}
          </h3>
        </div>

        <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-slate-200/70 text-slate-700">
          {count}
        </span>
      </div>

      {/* Lista de Tarjetas */}
      <div className="flex-1 space-y-3 overflow-y-auto max-h-[calc(100vh-260px)] min-h-[380px] pr-1 scrollbar-thin">
        {isLoading ? (
          /* Skeletons limpios sin saltos de interfaz */
          <div className="space-y-3">
            {[1, 2, 3].map((n) => (
              <div
                key={n}
                className="bg-white rounded-xl border border-slate-200 p-4 space-y-3 animate-pulse shadow-xs"
              >
                <div className="h-4 bg-slate-200 rounded w-1/3" />
                <div className="h-5 bg-slate-200 rounded w-2/3" />
                <div className="h-3 bg-slate-100 rounded w-1/2" />
              </div>
            ))}
          </div>
        ) : items.length === 0 ? (
          /* Empty State Premium: Contenedor invisible sin bordes punteados */
          <div className="flex flex-col items-center justify-center p-8 text-center min-h-[220px]">
            <Icon className="w-10 h-10 text-slate-300 mb-2 stroke-[1.5]" aria-hidden="true" />
            <p className="text-sm font-medium text-slate-500 font-sans">
              {emptyMessage}
            </p>
          </div>
        ) : (
          items.map((item) => (
            <KanbanCard
              key={item.id}
              item={item}
              columnType={columnType}
              onMarkArrived={onMarkArrived}
              onStartAttention={onStartAttention}
              onFinishAttention={onFinishAttention}
              onCancel={onCancel}
              isActionLoading={isActionLoading}
            />
          ))
        )}
      </div>
    </div>
  );
};
