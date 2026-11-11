import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { KanbanCard } from './KanbanCard';
import { staggerItemVariants } from '../../../shared/motion';

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
  onMarkAbsent,
  onCancel,
}) => {
  return (
    <div className="flex flex-col w-full bg-slate-50/60 rounded-2xl p-4 border border-slate-200/70 shadow-2xs">
      {/* Cabecera Sutil sin bordes duros */}
      <div className="flex items-center justify-between gap-2 pb-3 mb-3 border-b border-slate-200/60">
        <div className="flex items-center gap-2">
          <Icon className="w-4 h-4 text-slate-500" strokeWidth={2} aria-hidden="true" />
          <h3 className="text-sm font-heading font-semibold text-slate-800 tracking-tight">
            {title}
          </h3>
        </div>

        <span
          className="text-xs font-semibold px-2 py-0.5 rounded-full bg-slate-200/70 text-slate-700"
          aria-live="polite"
          aria-atomic="true"
        >
          {count}
        </span>
      </div>

      {/* Lista de Tarjetas con región viva para lectores de pantalla */}
      <div
        role="region"
        aria-label={`Columna ${title}, ${count} pacientes`}
        aria-live="polite"
        aria-atomic="false"
        className="flex-1 space-y-3 overflow-y-auto max-h-[calc(100vh-260px)] min-h-[380px] pr-1 scrollbar-thin"
      >
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
            <Icon className="w-10 h-10 text-slate-300 mb-2" strokeWidth={2} aria-hidden="true" />
            <p className="text-sm font-medium text-slate-500 font-sans">
              {emptyMessage}
            </p>
          </div>
        ) : (
          <AnimatePresence mode="popLayout" initial={false}>
            {items.map((item) => (
              <motion.div
                key={item.id}
                layout
                variants={staggerItemVariants}
                initial="hidden"
                animate="visible"
                exit={{ opacity: 0, scale: 0.96, transition: { duration: 0.15 } }}
              >
                <KanbanCard
                  item={item}
                  columnType={columnType}
                  onMarkArrived={onMarkArrived}
                  onStartAttention={onStartAttention}
                  onMarkAbsent={onMarkAbsent}
                  onCancel={onCancel}
                  isActionLoading={isActionLoading}
                />
              </motion.div>
            ))}
          </AnimatePresence>
        )}
      </div>
    </div>
  );
};
