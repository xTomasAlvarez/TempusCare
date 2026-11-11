import React from 'react';
import { CalendarHeart, Clock, Stethoscope, ClipboardCheck } from 'lucide-react';
import { KanbanColumn } from './KanbanColumn';

export const KanbanBoard = ({
  columnDisponibles = [],
  columnEspera = [],
  columnAtendiendose = [],
  columnFinalizados = [],
  isLoading = false,
  isActionLoading = false,
  onMarkArrived,
  onStartAttention,
  onMarkAbsent,
  onCancel,
}) => {
  return (
    <div className="w-full overflow-x-auto pb-4 scrollbar-thin">
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4 w-full min-w-[1100px] items-start">
        {/* Columna 1: Disponibles */}
        <KanbanColumn
          title="Disponibles"
          count={columnDisponibles.length}
          icon={CalendarHeart}
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
          onMarkArrived={onMarkArrived}
          onStartAttention={onStartAttention}
          onMarkAbsent={onMarkAbsent}
          onCancel={onCancel}
        />

        {/* Columna 3: Atendiéndose (Solo el médico finaliza al evolucionar) */}
        <KanbanColumn
          title="Atendiéndose"
          count={columnAtendiendose.length}
          icon={Stethoscope}
          columnType="atendiendo"
          items={columnAtendiendose}
          isLoading={isLoading}
          isActionLoading={isActionLoading}
          emptyMessage="No hay pacientes en consulta activa"
        />

        {/* Columna 4: Finalizados */}
        <KanbanColumn
          title="Finalizados"
          count={columnFinalizados.length}
          icon={ClipboardCheck}
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
