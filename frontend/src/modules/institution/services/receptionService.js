const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export const receptionService = {
  /**
   * Obtiene todos los profesionales médicos
   */
  async getProfessionals() {
    const res = await fetch(`${API_BASE_URL}/profesionales`);
    if (!res.ok) throw new Error('Error al cargar la lista de profesionales.');
    return await res.json();
  },

  /**
   * Obtiene todos los consultorios de la institución
   */
  async getConsultorios() {
    const res = await fetch(`${API_BASE_URL}/consultorios`);
    if (!res.ok) throw new Error('Error al cargar los consultorios.');
    return await res.json();
  },

  /**
   * Obtiene los turnos disponibles para un profesional en una fecha
   */
  async getAvailableTurnos(profesionalCuil, fecha) {
    const params = new URLSearchParams();
    params.append('profesionalCuil', profesionalCuil);
    if (fecha) {
      const dateStr = typeof fecha === 'string' ? fecha : fecha.toISOString().split('T')[0];
      params.append('fecha', dateStr);
    }

    const res = await fetch(`${API_BASE_URL}/turnos/disponibles?${params.toString()}`);
    if (!res.ok) throw new Error('Error al consultar turnos disponibles.');
    return await res.json();
  },

  /**
   * Obtiene todas las citas de un profesional en una fecha
   */
  async getAppointmentsByDoctorAndDate(profesionalCuil, fecha) {
    const params = new URLSearchParams();
    if (fecha) {
      const dateStr = typeof fecha === 'string' ? fecha : fecha.toISOString().split('T')[0];
      params.append('fecha', dateStr);
    }

    const res = await fetch(`${API_BASE_URL}/citas/profesional/${profesionalCuil}?${params.toString()}`);
    if (!res.ok) throw new Error('Error al consultar las citas del profesional.');
    return await res.json();
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
    const res = await fetch(`${API_BASE_URL}/agendas`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        profesionalCuil,
        cuitConsultorio,
        dia: Number(dia),
        mes: Number(mes),
        anio: Number(anio),
        horaEntrada: horaEntrada.length === 5 ? `${horaEntrada}:00` : horaEntrada,
        horaSalida: horaSalida.length === 5 ? `${horaSalida}:00` : horaSalida,
        duracionTurnoMinutos: Number(duracionTurnoMinutos),
      }),
    });

    const data = await res.json().catch(() => null);
    if (!res.ok) {
      throw new Error(data?.detail || data?.message || 'Error al generar la agenda horaria.');
    }
    return data;
  },

  /**
   * Modifica el estado de una cita médica
   */
  async updateAppointmentStatus(citaId, nuevoEstado) {
    const res = await fetch(`${API_BASE_URL}/citas/${citaId}/estado`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        citaId: Number(citaId),
        estado: Number(nuevoEstado),
      }),
    });

    const data = await res.json().catch(() => null);
    if (!res.ok) {
      throw new Error(data?.detail || data?.message || 'No se pudo actualizar el estado de la cita.');
    }
    return data;
  },

  /**
   * Cancela una cita (cumpliendo RN-01 liberando el turno)
   */
  async cancelAppointment(citaId) {
    const res = await fetch(`${API_BASE_URL}/citas/${citaId}`, {
      method: 'DELETE',
    });
    if (!res.ok && res.status !== 204) {
      const err = await res.json().catch(() => null);
      throw new Error(err?.detail || err?.message || 'Error al cancelar la cita.');
    }
    return true;
  },
};
