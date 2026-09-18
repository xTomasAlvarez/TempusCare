const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export const professionalService = {
  /**
   * Obtiene la lista de consultorios / sedes de atención
   */
  async getConsultorios() {
    const res = await fetch(`${API_BASE_URL}/consultorios`);
    if (!res.ok) throw new Error('Error al cargar consultorios.');
    return await res.json();
  },

  /**
   * Obtiene el perfil del profesional
   */
  async getDoctorProfile(cuil) {
    const res = await fetch(`${API_BASE_URL}/profesionales/${cuil}`);
    if (!res.ok) throw new Error('Error al cargar perfil del profesional.');
    return await res.json();
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

    const res = await fetch(`${API_BASE_URL}/citas/profesional/${profesionalCuil}?${params.toString()}`);
    if (!res.ok) throw new Error('Error al consultar la agenda médica diaria.');
    return await res.json();
  },

  /**
   * Obtiene la Historia Clínica Unificada del paciente (RN-04)
   */
  async getPatientClinicalHistory(pacienteCuil) {
    const res = await fetch(`${API_BASE_URL}/historiasclinicas/paciente/${pacienteCuil}`);
    if (res.status === 404) return null;
    if (!res.ok) {
      const err = await res.json().catch(() => null);
      throw new Error(err?.detail || err?.message || 'Error al obtener la historia clínica.');
    }
    return await res.json();
  },

  /**
   * Obtiene el historial de citas del paciente para complementar el timeline
   */
  async getPatientAppointments(pacienteCuil) {
    const res = await fetch(`${API_BASE_URL}/citas/paciente/${pacienteCuil}`);
    if (!res.ok) return [];
    return await res.json();
  },

  /**
   * Registra la evolución de la consulta actual en Observaciones (RN-04)
   */
  async saveClinicalObservation({
    citaId,
    historiaClinicaId = null,
    profesionalCuil,
    motivo,
    detalle,
  }) {
    const res = await fetch(`${API_BASE_URL}/observaciones`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        citaId: Number(citaId),
        historiaClinicaId: historiaClinicaId ? Number(historiaClinicaId) : null,
        profesionalCuil,
        motivo: motivo.trim(),
        detalle: detalle.trim(),
      }),
    });

    const data = await res.json().catch(() => null);
    if (!res.ok) {
      throw new Error(data?.detail || data?.message || 'No se pudo guardar la evolución clínica.');
    }
    return data;
  },

  /**
   * Modifica el estado de la cita (ej. marcar como Atendida tras finalizar consulta)
   */
  async updateAppointmentStatus(citaId, estado) {
    const res = await fetch(`${API_BASE_URL}/citas/${citaId}/estado`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        citaId: Number(citaId),
        estado: Number(estado),
      }),
    });

    const data = await res.json().catch(() => null);
    if (!res.ok) {
      throw new Error(data?.detail || data?.message || 'No se pudo actualizar el estado de la cita.');
    }
    return data;
  },
};
