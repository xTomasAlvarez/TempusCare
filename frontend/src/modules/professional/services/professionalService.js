import { apiClient } from '../../../core/api/apiClient';

export const professionalService = {
  /**
   * Obtiene la lista de consultorios / sedes de atención
   */
  async getConsultorios() {
    return await apiClient.get('consultorios');
  },

  /**
   * Obtiene el perfil del profesional
   */
  async getDoctorProfile(cuil) {
    return await apiClient.get(`profesionales/${cuil}`);
  },

  /**
   * Obtiene las citas del día para el médico
   */
  async getDailyAppointments(profesionalCuil, fecha) {
    const params = new URLSearchParams();
    if (fecha) {
      const dateStr = typeof fecha === 'string' ? fecha : fecha.toISOString().split('T')[0];
      params.append('fecha', dateStr);
    }

    const query = params.toString();
    return await apiClient.get(`citas/profesional/${profesionalCuil}${query ? `?${query}` : ''}`);
  },

  /**
   * Obtiene la Historia Clínica Unificada del paciente (RN-04)
   */
  async getPatientClinicalHistory(pacienteCuil) {
    try {
      return await apiClient.get(`historiasclinicas/paciente/${pacienteCuil}`);
    } catch (err) {
      if (err.status === 404) return null;
      throw err;
    }
  },

  /**
   * Obtiene el historial de citas del paciente para complementar el timeline
   */
  async getPatientAppointments(pacienteCuil) {
    try {
      return await apiClient.get(`citas/paciente/${pacienteCuil}`);
    } catch {
      return [];
    }
  },

  /**
   * Registra la evolución de la consulta actual en Observaciones (RN-04)
   * (Al invocar esto, el backend actualiza automáticamente Cita -> Atendida y Turno -> Atendido en la misma transacción)
   */
  async saveClinicalObservation({
    citaId,
    historiaClinicaId = null,
    profesionalCuil,
    motivo,
    detalle,
  }) {
    return await apiClient.post('observaciones', {
      citaId: Number(citaId),
      historiaClinicaId: historiaClinicaId ? Number(historiaClinicaId) : null,
      profesionalCuil,
      motivo: motivo.trim(),
      detalle: detalle.trim(),
    });
  },

  /**
   * Modifica el estado de la cita (ej. marcar como Atendida tras finalizar consulta)
   */
  async updateAppointmentStatus(citaId, estado) {
    return await apiClient.put(`citas/${citaId}/estado`, {
      citaId: Number(citaId),
      estado: Number(estado),
    });
  },
};
