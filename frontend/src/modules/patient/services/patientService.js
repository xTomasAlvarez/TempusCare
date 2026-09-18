import { apiClient } from '../../../core/api/apiClient';

export const patientService = {
  /**
   * Consulta profesionales con filtros opcionales
   */
  async getProfessionals({ nombre, especialidadId, obraSocialId, consultorioCuit } = {}) {
    const params = new URLSearchParams();
    if (nombre) params.append('nombre', nombre.trim());
    if (especialidadId) params.append('especialidadId', especialidadId);
    if (obraSocialId) params.append('obraSocialId', obraSocialId);
    if (consultorioCuit) params.append('consultorioCuit', consultorioCuit);

    const query = params.toString();
    return await apiClient.get(`profesionales${query ? `?${query}` : ''}`);
  },

  /**
   * Obtiene catálogo de especialidades médicas
   */
  async getSpecialties() {
    return await apiClient.get('especialidades');
  },

  /**
   * Obtiene catálogo de obras sociales y prepagas
   */
  async getHealthInsurances() {
    return await apiClient.get('obrassociales');
  },

  /**
   * Obtiene los turnos disponibles para un profesional y fecha específica
   */
  async getAvailableSlots(profesionalCuil, fecha) {
    const params = new URLSearchParams();
    params.append('profesionalCuil', profesionalCuil);
    if (fecha) {
      const dateStr = typeof fecha === 'string' ? fecha : fecha.toISOString().split('T')[0];
      params.append('fecha', dateStr);
    }

    return await apiClient.get(`turnos/disponibles?${params.toString()}`);
  },

  /**
   * Reserva una nueva cita médica
   */
  async bookAppointment({
    pacienteCuil,
    profesionalCuil,
    turnoId,
    tipo = 1, // 1: Consulta, 2: Operacion, 3: Estudio
    obraSocialId = null,
    estudioId = null,
    documentoPedidoMedico = null,
  }) {
    return await apiClient.post('citas', {
      pacienteCuil,
      profesionalCuil,
      turnoId,
      tipo,
      obraSocialId: obraSocialId ? Number(obraSocialId) : null,
      estudioId: estudioId ? Number(estudioId) : null,
      documentoPedidoMedico,
    });
  },

  /**
   * Obtiene todas las citas de un paciente
   */
  async getPatientAppointments(pacienteCuil) {
    return await apiClient.get(`citas/paciente/${pacienteCuil}`);
  },

  /**
   * Cancela una cita (cumple RN-01 liberando el turno a Disponible en backend)
   */
  async cancelAppointment(citaId) {
    await apiClient.delete(`citas/${citaId}`);
    return true;
  },

  /**
   * Envía la encuesta de satisfacción post-atención (1 a 5 estrellas)
   */
  async submitSatisfactionSurvey({
    citaId,
    puntualidad,
    atencion,
    profesionalismo,
    comentario = '',
  }) {
    return await apiClient.post('cuestionarios', {
      citaId,
      puntualidad,
      atencion,
      profesionalismo,
      comentario,
    });
  },

  /**
   * Consulta si una cita ya fue calificada
   */
  async getSurveyForAppointment(citaId) {
    try {
      return await apiClient.get(`cuestionarios/cita/${citaId}`);
    } catch (err) {
      if (err.status === 404) return null;
      return null;
    }
  },
};
