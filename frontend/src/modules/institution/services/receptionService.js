import { apiClient } from '../../../core/api/apiClient';

export const receptionService = {
  /**
   * Obtiene los profesionales médicos (filtrados por consultorio si se especifica)
   */
  async getProfessionals(consultorioCuit = null) {
    const endpoint = consultorioCuit
      ? `profesionales?consultorioCuit=${encodeURIComponent(consultorioCuit)}`
      : 'profesionales';
    return await apiClient.get(endpoint);
  },

  /**
   * Obtiene todos los consultorios de la institución
   */
  async getConsultorios() {
    return await apiClient.get('consultorios');
  },

  /**
   * Obtiene los turnos disponibles para un profesional en una fecha (y consultorio)
   */
  async getAvailableTurnos(profesionalCuil, fecha, consultorioCuit = null) {
    const params = new URLSearchParams();
    params.append('profesionalCuil', profesionalCuil);
    if (fecha) {
      const dateStr = typeof fecha === 'string' ? fecha : fecha.toISOString().split('T')[0];
      params.append('fecha', dateStr);
    }
    if (consultorioCuit) {
      params.append('consultorioCuit', consultorioCuit);
    }

    return await apiClient.get(`turnos/disponibles?${params.toString()}`);
  },

  /**
   * Obtiene todas las citas de un profesional en una fecha (y consultorio)
   */
  async getAppointmentsByDoctorAndDate(profesionalCuil, fecha, consultorioCuit = null) {
    const params = new URLSearchParams();
    if (fecha) {
      const dateStr = typeof fecha === 'string' ? fecha : fecha.toISOString().split('T')[0];
      params.append('fecha', dateStr);
    }
    if (consultorioCuit) {
      params.append('consultorioCuit', consultorioCuit);
    }

    return await apiClient.get(`citas/profesional/${profesionalCuil}?${params.toString()}`);
  },

  /**
   * Crea una nueva franja horaria / agenda con slots dinámicos llamando a AgendasController
   */
  async createAgenda({
    profesionalCuil,
    cuitConsultorio,
    dia,
    mes,
    anio,
    horaEntrada,
    horaSalida,
    duracionTurnoMinutos = 30,
  }) {
    return await apiClient.post('agendas', {
      profesionalCuil,
      cuitConsultorio,
      dia: Number(dia),
      mes: Number(mes),
      anio: Number(anio),
      horaEntrada: horaEntrada.length === 5 ? `${horaEntrada}:00` : horaEntrada,
      horaSalida: horaSalida.length === 5 ? `${horaSalida}:00` : horaSalida,
      duracionTurnoMinutos: Number(duracionTurnoMinutos),
    });
  },

  /**
   * Modifica el estado de una cita médica
   */
  async updateAppointmentStatus(citaId, nuevoEstado) {
    return await apiClient.put(`citas/${citaId}/estado`, {
      citaId: Number(citaId),
      estado: Number(nuevoEstado),
    });
  },

  /**
   * Cancela una cita (cumpliendo RN-01 liberando el turno)
   */
  async cancelAppointment(citaId) {
    await apiClient.delete(`citas/${citaId}`);
    return true;
  },
};
