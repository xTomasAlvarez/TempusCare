import { apiClient } from '../../../core/api/apiClient';

/**
 * Servicio de administración institucional y parametrización B2B.
 * Normaliza y gestiona las llamadas a la API cumpliendo con la separación arquitectónica.
 */
export const institutionAdminService = {
  // ==========================================
  // Sedes y Consultorios
  // ==========================================

  async getConsultorios() {
    return await apiClient.get('consultorios');
  },

  async getConsultorioByCuit(cuit) {
    return await apiClient.get(`consultorios/${cuit}`);
  },

  async createConsultorio(dto) {
    return await apiClient.post('consultorios', dto);
  },

  async updateConsultorio(cuit, dto) {
    return await apiClient.put(`consultorios/${cuit}`, dto);
  },

  async deleteConsultorio(cuit) {
    await apiClient.delete(`consultorios/${cuit}`);
    return true;
  },

  // ==========================================
  // Personal y Asistentes
  // ==========================================

  async getAsistentes(consultorioCuit = null) {
    const endpoint = consultorioCuit
      ? `asistentes?consultorioCuit=${encodeURIComponent(consultorioCuit)}`
      : 'asistentes';
    return await apiClient.get(endpoint);
  },

  async createAsistente(dto) {
    return await apiClient.post('asistentes', dto);
  },

  async deleteAsistente(cuil) {
    await apiClient.delete(`asistentes/${cuil}`);
    return true;
  },

  // ==========================================
  // Profesionales de Consultorio / Sede
  // ==========================================

  async getConsultorioProfesionales(cuit) {
    return await apiClient.get(`consultorios/${encodeURIComponent(cuit)}/profesionales`);
  },

  async assignProfesionalToConsultorio(cuit, profesionalCuil) {
    return await apiClient.post(`consultorios/${encodeURIComponent(cuit)}/profesionales/${encodeURIComponent(profesionalCuil)}`);
  },

  async removeProfesionalFromConsultorio(cuit, profesionalCuil) {
    await apiClient.delete(`consultorios/${encodeURIComponent(cuit)}/profesionales/${encodeURIComponent(profesionalCuil)}`);
    return true;
  },

  async registerDoctor(dto) {
    return await apiClient.post('profesionales', dto);
  },

  async createAdminConsultorio(dto) {
    return await apiClient.post('administradores/consultorio', dto);
  },

  // ==========================================
  // Catálogos y Coberturas (RN-02)
  // ==========================================

  async getProfesionales() {
    return await apiClient.get('profesionales');
  },

  async getEstudios(especialidadId) {
    const params = new URLSearchParams();
    if (especialidadId) params.append('especialidadId', especialidadId);
    const query = params.toString();
    return await apiClient.get(`estudios${query ? `?${query}` : ''}`);
  },

  async getObrasSociales() {
    return await apiClient.get('obrassociales');
  },

  async getEspecialidades() {
    return await apiClient.get('especialidades');
  },

  async getProfesionalEstudios(cuil) {
    return await apiClient.get(`profesionales/${cuil}/estudios`);
  },

  async assignEstudioProfesional(cuil, dto) {
    return await apiClient.post(`profesionales/${cuil}/estudios`, dto);
  },

  async deleteEstudioProfesional(cuil, estudioId) {
    await apiClient.delete(`profesionales/${cuil}/estudios/${estudioId}`);
    return true;
  },

  async getInstituciones() {
    return await apiClient.get('instituciones');
  },
};
