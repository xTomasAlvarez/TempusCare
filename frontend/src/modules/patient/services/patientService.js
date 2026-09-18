const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

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

    const res = await fetch(`${API_BASE_URL}/profesionales?${params.toString()}`);
    if (!res.ok) {
      const err = await res.json().catch(() => null);
      throw new Error(err?.detail || err?.message || 'Error al buscar profesionales.');
    }
    return await res.json();
  },

  /**
   * Obtiene catálogo de especialidades médicas
   */
  async getSpecialties() {
    const res = await fetch(`${API_BASE_URL}/especialidades`);
    if (!res.ok) throw new Error('Error al obtener especialidades.');
    return await res.json();
  },

  /**
   * Obtiene catálogo de obras sociales y prepagas
   */
  async getHealthInsurances() {
    const res = await fetch(`${API_BASE_URL}/obrassociales`);
    if (!res.ok) throw new Error('Error al obtener obras sociales.');
    return await res.json();
  },

  /**
   * Obtiene los turnos disponibles para un profesional y fecha específica
   */
  async getAvailableSlots(profesionalCuil, fecha) {
    const params = new URLSearchParams();
    params.append('profesionalCuil', profesionalCuil);
    if (fecha) {
      // Formato YYYY-MM-DD
      const dateStr = typeof fecha === 'string' ? fecha : fecha.toISOString().split('T')[0];
      params.append('fecha', dateStr);
    }

    const res = await fetch(`${API_BASE_URL}/turnos/disponibles?${params.toString()}`);
    if (!res.ok) {
      const err = await res.json().catch(() => null);
      throw new Error(err?.detail || err?.message || 'Error al consultar disponibilidad.');
    }
    return await res.json();
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
    const res = await fetch(`${API_BASE_URL}/citas`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        pacienteCuil,
        profesionalCuil,
        turnoId,
        tipo,
        obraSocialId: obraSocialId ? Number(obraSocialId) : null,
        estudioId: estudioId ? Number(estudioId) : null,
        documentoPedidoMedico,
      }),
    });

    const data = await res.json().catch(() => null);
    if (!res.ok) {
      throw new Error(data?.detail || data?.message || 'No se pudo confirmar la reserva del turno.');
    }
    return data;
  },

  /**
   * Obtiene todas las citas de un paciente
   */
  async getPatientAppointments(pacienteCuil) {
    const res = await fetch(`${API_BASE_URL}/citas/paciente/${pacienteCuil}`);
    if (!res.ok) {
      const err = await res.json().catch(() => null);
      throw new Error(err?.detail || err?.message || 'Error al obtener tus citas.');
    }
    return await res.json();
  },

  /**
   * Cancela una cita (cumple RN-01 liberando el turno a Disponible en backend)
   */
  async cancelAppointment(citaId) {
    const res = await fetch(`${API_BASE_URL}/citas/${citaId}`, {
      method: 'DELETE',
    });
    if (!res.ok && res.status !== 204) {
      const err = await res.json().catch(() => null);
      throw new Error(err?.detail || err?.message || 'No se pudo cancelar la cita.');
    }
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
    const res = await fetch(`${API_BASE_URL}/cuestionarios`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        citaId,
        puntualidad,
        atencion,
        profesionalismo,
        comentario,
      }),
    });

    const data = await res.json().catch(() => null);
    if (!res.ok) {
      throw new Error(data?.detail || data?.message || 'No se pudo enviar la encuesta.');
    }
    return data;
  },

  /**
   * Consulta si una cita ya fue calificada
   */
  async getSurveyForAppointment(citaId) {
    const res = await fetch(`${API_BASE_URL}/cuestionarios/cita/${citaId}`);
    if (res.status === 404) return null;
    if (!res.ok) return null;
    return await res.json().catch(() => null);
  },
};
