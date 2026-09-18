const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

/**
 * Servicio exclusivo para el Super Administrador de Vitality.
 * Gestiona el alta, supervisión y contratos de las instituciones clientes B2B.
 */
export const vitalityService = {
  /**
   * Obtiene todas las instituciones clientes que han contratado Tempus Care.
   */
  async getInstitutions() {
    const res = await fetch(`${API_BASE_URL}/instituciones`);
    if (!res.ok) throw new Error('Error al cargar la lista de instituciones clientes.');
    return await res.json();
  },

  /**
   * Obtiene una institución por su identificador único.
   */
  async getInstitutionById(id) {
    const res = await fetch(`${API_BASE_URL}/instituciones/${id}`);
    if (!res.ok) throw new Error('Error al consultar los detalles de la institución.');
    return await res.json();
  },

  /**
   * Da de alta una nueva institución médica en el ecosistema.
   */
  async createInstitution({ nombre, cuit, email }) {
    const res = await fetch(`${API_BASE_URL}/instituciones`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        nombre: nombre.trim(),
        cuit: cuit.trim(),
        email: email.trim(),
      }),
    });

    const data = await res.json().catch(() => null);
    if (!res.ok) {
      throw new Error(data?.detail || data?.message || 'No se pudo dar de alta la institución.');
    }
    return data;
  },

  /**
   * Da de baja una institución cliente del SaaS.
   */
  async deleteInstitution(id) {
    const res = await fetch(`${API_BASE_URL}/instituciones/${id}`, {
      method: 'DELETE',
    });

    if (!res.ok) {
      const data = await res.json().catch(() => null);
      throw new Error(data?.detail || data?.message || 'No se pudo dar de baja la institución.');
    }
    return true;
  },

  /**
   * Obtiene los consultorios asociados a una institución.
   */
  async getInstitutionConsultorios(id) {
    const res = await fetch(`${API_BASE_URL}/instituciones/${id}/consultorios`);
    if (!res.ok) return [];
    return await res.json();
  },

  /**
   * Obtiene los asistentes asociados a una institución.
   */
  async getInstitutionAsistentes(id) {
    const res = await fetch(`${API_BASE_URL}/instituciones/${id}/asistentes`);
    if (!res.ok) return [];
    return await res.json();
  },
};
