import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../../core/context/AuthContext';
import { professionalService } from '../services/professionalService';
import { useDailyAgenda } from '../hooks/useDailyAgenda';
import { DailyAgendaList } from '../components/DailyAgendaList';
import { UnifiedClinicalRecord } from '../components/UnifiedClinicalRecord';
import { tabContentVariants, pageTransitionVariants } from '../../../shared/motion';

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

  const handleSelectPatient = async (appointment, shouldStartAttention = false, forzarFueraDeHorario = false) => {
    if (shouldStartAttention && appointment.estado !== 7 && appointment.estado !== 'EnAtencion') {
      try {
        await professionalService.updateAppointmentStatus(appointment.id, 7, forzarFueraDeHorario);
        appointment = { ...appointment, estado: 7 };
        refreshAgenda();
      } catch (err) {
        console.warn('No se pudo actualizar estado a EnAtencion:', err);
      }
    }
    selectPatientAppointment(appointment);
  };

  return (
    <motion.div variants={pageTransitionVariants} initial="hidden" animate="visible" className="space-y-6">
      {/* Vista Condicional: Ficha Clínica Unificada vs Agenda Diaria con Transición Fluida */}
      <AnimatePresence mode="popLayout" initial={false}>
        {selectedAppointment ? (
          <motion.div
            key="clinical-record"
            variants={tabContentVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
          >
            <UnifiedClinicalRecord
              appointment={selectedAppointment}
              onBack={clearSelectedAppointment}
              onAppointmentUpdated={refreshAgenda}
            />
          </motion.div>
        ) : (
          <motion.div
            key="agenda-list"
            variants={tabContentVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
          >
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
              onSelectPatient={handleSelectPatient}
              activeConsultorio={activeConsultorio}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default ProfessionalDashboardPage;
