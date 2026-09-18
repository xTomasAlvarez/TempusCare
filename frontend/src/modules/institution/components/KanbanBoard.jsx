import React from 'react';
import { Calendar, Clock, Stethoscope, CheckCircle2 } from 'lucide-react';
import { KanbanColumn } from './KanbanColumn';

export const KanbanBoard = ({
  columnDisponibles = [],
  columnEspera = [],
  columnAtendiendose = [],
  columnFinalizados = [],
  isLoading = false,
  isActionLoading = false,
  onStartAttention,
  onFinishAttention,
  onCancel,
}) => {
  return (
    <div className="w-full overflow-x-auto pb-4 scrollbar-thin">
      <div className="flex gap-4 min-w-[1140px] items-start">
        {/* Columna 1: Disponibles */}
        <KanbanColumn
          title="Disponibles"
          count={columnDisponibles.length}
          icon={Calendar}
          columnType="disponible"
          items={columnDisponibles}
          isLoading={isLoading}
          isActionLoading={isActionLoading}
          emptyMessage="No hay turnos disponibles para esta fecha"
        />

        {/* Columna 2: En Sala de Espera */}
        <KanbanColumn
          title="En Sala de Espera"
          count={columnEspera.length}
          icon={Clock}
          columnType="espera"
          items={columnEspera}
          isLoading={isLoading}
          isActionLoading={isActionLoading}
          emptyMessage="No hay pacientes en esta etapa"
          onStartAttention={onStartAttention}
          onCancel={onCancel}
        />

        {/* Columna 3: Atendiéndose */}
        <KanbanColumn
          title="Atendiéndose"
          count={columnAtendiendose.length}
          icon={Stethoscope}
          columnType="atendiendo"
          items={columnAtendiendose}
          isLoading={isLoading}
          isActionLoading={isActionLoading}
          emptyMessage="No hay pacientes en consulta activa"
          onFinishAttention={onFinishAttention}
        />

        {/* Columna 4: Finalizados */}
        <KanbanColumn
          title="Finalizados"
          count={columnFinalizados.length}
          icon={CheckCircle2}
          columnType="finalizado"
          items={columnFinalizados}
          isLoading={isLoading}
          isActionLoading={isActionLoading}
          emptyMessage="No hay consultas finalizadas hoy"
        />
      </div>
    </div>
  );
};
