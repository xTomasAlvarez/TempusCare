const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

/**
 * Servicio de administración institucional y parametrización B2B.
 * Normaliza y gestiona las llamadas a la API cumpliendo con la separación arquitectónica.
 */
export const institutionAdminService = {
  // ==========================================
  // Sedes y Consultorios
  // ==========================================

  async getConsultorios() {
    const res = await fetch(`${API_BASE_URL}/consultorios`);
    if (!res.ok) throw new Error('Error al cargar la lista de consultorios.');
    return await res.json();
  },

  async getConsultorioByCuit(cuit) {
    const res = await fetch(`${API_BASE_URL}/consultorios/${cuit}`);
    if (!res.ok) throw new Error('Error al obtener el consultorio.');
    return await res.json();
  },

  async createConsultorio(dto) {
    const res = await fetch(`${API_BASE_URL}/consultorios`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(dto),
    });

    const data = await res.json().catch(() => null);
    if (!res.ok) {
      throw new Error(data?.detail || data?.message || 'No se pudo registrar el consultorio.');
    }
    return data;
  },

  async updateConsultorio(cuit, dto) {
    const res = await fetch(`${API_BASE_URL}/consultorios/${cuit}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(dto),
    });

    const data = await res.json().catch(() => null);
    if (!res.ok) {
      throw new Error(data?.detail || data?.message || 'No se pudo actualizar el consultorio.');
    }
    return data;
  },

  async deleteConsultorio(cuit) {
    const res = await fetch(`${API_BASE_URL}/consultorios/${cuit}`, {
      method: 'DELETE',
    });
    if (!res.ok) {
      const data = await res.json().catch(() => null);
      throw new Error(data?.detail || data?.message || 'No se pudo eliminar el consultorio.');
    }
    return true;
  },

  // ==========================================
  // Personal y Asistentes
  // ==========================================

  async getAsistentes(consultorioCuit = null) {
    const url = consultorioCuit
      ? `${API_BASE_URL}/asistentes?consultorioCuit=${encodeURIComponent(consultorioCuit)}`
      : `${API_BASE_URL}/asistentes`;
    const res = await fetch(url);
    if (!res.ok) throw new Error('Error al cargar la lista de asistentes.');
    return await res.json();
  },

  async createAsistente(dto) {
    const res = await fetch(`${API_BASE_URL}/asistentes`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(dto),
    });

    const data = await res.json().catch(() => null);
    if (!res.ok) {
      throw new Error(data?.detail || data?.message || 'No se pudo registrar el asistente.');
    }
    return data;
  },

  async deleteAsistente(cuil) {
    const res = await fetch(`${API_BASE_URL}/asistentes/${cuil}`, {
      method: 'DELETE',
    });
    if (!res.ok) {
      const data = await res.json().catch(() => null);
      throw new Error(data?.detail || data?.message || 'No se pudo eliminar el asistente.');
    }
    return true;
  },

  // ==========================================
  // Profesionales de Consultorio / Sede
  // ==========================================

  async getConsultorioProfesionales(cuit) {
    const res = await fetch(`${API_BASE_URL}/consultorios/${encodeURIComponent(cuit)}/profesionales`);
    if (!res.ok) throw new Error('Error al cargar los profesionales vinculados al consultorio.');
    return await res.json();
  },

  async assignProfesionalToConsultorio(cuit, profesionalCuil) {
    const res = await fetch(`${API_BASE_URL}/consultorios/${encodeURIComponent(cuit)}/profesionales/${encodeURIComponent(profesionalCuil)}`, {
      method: 'POST',
    });
    const data = await res.json().catch(() => null);
    if (!res.ok) {
      throw new Error(data?.detail || data?.message || 'No se pudo vincular el profesional al consultorio.');
    }
    return data;
  },

  async removeProfesionalFromConsultorio(cuit, profesionalCuil) {
    const res = await fetch(`${API_BASE_URL}/consultorios/${encodeURIComponent(cuit)}/profesionales/${encodeURIComponent(profesionalCuil)}`, {
      method: 'DELETE',
    });
    if (!res.ok) {
      const data = await res.json().catch(() => null);
      throw new Error(data?.detail || data?.message || 'No se pudo desvincular el profesional del consultorio.');
    }
    return true;
  },

  // ==========================================
  // Catálogos y Coberturas (RN-02)
  // ==========================================

  async getProfesionales() {
    const res = await fetch(`${API_BASE_URL}/profesionales`);
    if (!res.ok) throw new Error('Error al cargar la lista de profesionales.');
    return await res.json();
  },

  async getEstudios(especialidadId) {
    const params = new URLSearchParams();
    if (especialidadId) params.append('especialidadId', especialidadId);

    const res = await fetch(`${API_BASE_URL}/estudios?${params.toString()}`);
    if (!res.ok) throw new Error('Error al cargar catálogo de estudios.');
    return await res.json();
  },

  async getObrasSociales() {
    const res = await fetch(`${API_BASE_URL}/obrassociales`);
    if (!res.ok) throw new Error('Error al cargar catálogo de obras sociales.');
    return await res.json();
  },

  async getEspecialidades() {
    const res = await fetch(`${API_BASE_URL}/especialidades`);
    if (!res.ok) throw new Error('Error al cargar especialidades.');
    return await res.json();
  },

  async getProfesionalEstudios(cuil) {
    const res = await fetch(`${API_BASE_URL}/profesionales/${cuil}/estudios`);
    if (!res.ok) throw new Error('Error al cargar estudios del profesional.');
    return await res.json();
  },

  async assignEstudioProfesional(cuil, dto) {
    const res = await fetch(`${API_BASE_URL}/profesionales/${cuil}/estudios`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(dto),
    });

    const data = await res.json().catch(() => null);
    if (!res.ok) {
      throw new Error(data?.detail || data?.message || 'No se pudo parametrizar el estudio y su cobertura.');
    }
    return data;
  },

  async deleteEstudioProfesional(cuil, estudioId) {
    const res = await fetch(`${API_BASE_URL}/profesionales/${cuil}/estudios/${estudioId}`, {
      method: 'DELETE',
    });
    if (!res.ok) {
      const data = await res.json().catch(() => null);
      throw new Error(data?.detail || data?.message || 'No se pudo desasignar el estudio.');
    }
    return true;
  },

  async getInstituciones() {
    const res = await fetch(`${API_BASE_URL}/instituciones`);
    if (!res.ok) throw new Error('Error al cargar instituciones.');
    return await res.json();
  },
};
