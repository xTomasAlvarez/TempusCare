import React from 'react';
import { useAuth } from '../../../core/context/AuthContext';
import { useDailyAgenda } from '../hooks/useDailyAgenda';
import { DailyAgendaList } from '../components/DailyAgendaList';
import { UnifiedClinicalRecord } from '../components/UnifiedClinicalRecord';

/**
 * Vista Principal del Módulo Profesional (Atención Médica).
 * Coordina la Vista de Agenda Diaria y la Ficha Clínica Unificada con división en dos paneles.
 */
export const ProfessionalDashboardPage = () => {
  const { user, activeConsultorio } = useAuth();
  const {
    selectedDate,
    setSelectedDate,
    appointments,
    allAppointments,
    selectedAppointment,
    selectPatientAppointment,
    clearSelectedAppointment,
    searchQuery,
    setSearchQuery,
    statusFilter,
    setStatusFilter,
    stats,
    isLoading,
    refreshAgenda,
  } = useDailyAgenda();

  return (
    <div className="space-y-6">
      {/* Vista Condicional: Ficha Clínica Unificada vs Agenda Diaria */}
      {selectedAppointment ? (
        <UnifiedClinicalRecord
          appointment={selectedAppointment}
          onBack={clearSelectedAppointment}
          onAppointmentUpdated={refreshAgenda}
        />
      ) : (
        <DailyAgendaList
          appointments={appointments}
          allAppointments={allAppointments}
          selectedDate={selectedDate}
          onDateChange={setSelectedDate}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          statusFilter={statusFilter}
          onStatusFilterChange={setStatusFilter}
          stats={stats}
          isLoading={isLoading}
          onSelectPatient={selectPatientAppointment}
          activeConsultorio={activeConsultorio}
        />
      )}
    </div>
  );
};

export default ProfessionalDashboardPage;
