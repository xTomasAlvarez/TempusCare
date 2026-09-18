import { apiClient } from '../../../core/api/apiClient';

/**
 * Servicio exclusivo para el Super Administrador de Vitality.
 * Gestiona el alta, supervisión y contratos de las instituciones clientes B2B.
 */
export const vitalityService = {
  /**
   * Obtiene todas las instituciones clientes que han contratado Tempus Care.
   */
  async getInstitutions() {
    return await apiClient.get('instituciones');
  },

  /**
   * Obtiene una institución por su identificador único.
   */
  async getInstitutionById(id) {
    return await apiClient.get(`instituciones/${id}`);
  },

  /**
   * Da de alta una nueva institución médica en el ecosistema.
   */
  async createInstitution({ nombre, cuit, email, plan }) {
    return await apiClient.post('instituciones', {
      nombre: nombre.trim(),
      cuit: cuit.trim(),
      email: email.trim(),
      plan: plan || 'Profesional',
    });
  },

  /**
   * Da de baja una institución cliente del SaaS.
   */
  async deleteInstitution(id) {
    await apiClient.delete(`instituciones/${id}`);
    return true;
  },

  /**
   * Obtiene los consultorios asociados a una institución.
   */
  async getInstitutionConsultorios(id) {
    try {
      return await apiClient.get(`instituciones/${id}/consultorios`);
    } catch {
      return [];
    }
  },

  /**
   * Obtiene los asistentes asociados a una institución.
   */
  async getInstitutionAsistentes(id) {
    try {
      return await apiClient.get(`instituciones/${id}/asistentes`);
    } catch {
      return [];
    }
  },
};
