import { apiClient } from '../../../core/api/apiClient';

/**
 * Servicio integral para el Super Administrador de Vitality.
 * Gestiona clientes B2B (Instituciones), Catálogo de Especialidades y Estudios, y Obras Sociales.
 */
export const vitalityService = {
  // ==========================================
  // 1. INSTITUCIONES / CLIENTES B2B
  // ==========================================

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
   * Modifica una institución médica existente (Razón social, CUIT, Email y Plan).
   */
  async updateInstitution({ id, nombre, cuit, email, plan }) {
    return await apiClient.put(`instituciones/${id}`, {
      id: Number(id),
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

  // ==========================================
  // 2. CATÁLOGO DE ESPECIALIDADES
  // ==========================================

  /**
   * Obtiene todas las especialidades registradas en el catálogo.
   */
  async getSpecialties() {
    return await apiClient.get('especialidades');
  },

  /**
   * Obtiene una especialidad por su ID.
   */
  async getSpecialtyById(id) {
    return await apiClient.get(`especialidades/${id}`);
  },

  /**
   * Crea una nueva especialidad médica.
   */
  async createSpecialty({ nombre, descripcion }) {
    return await apiClient.post('especialidades', {
      nombre: nombre.trim(),
      descripcion: (descripcion || '').trim(),
    });
  },

  /**
   * Modifica una especialidad médica existente.
   */
  async updateSpecialty({ id, nombre, descripcion }) {
    return await apiClient.put(`especialidades/${id}`, {
      id: Number(id),
      nombre: nombre.trim(),
      descripcion: (descripcion || '').trim(),
    });
  },

  /**
   * Elimina una especialidad médica del catálogo.
   */
  async deleteSpecialty(id) {
    await apiClient.delete(`especialidades/${id}`);
    return true;
  },

  /**
   * Obtiene los estudios asociados a una especialidad específica.
   */
  async getSpecialtyStudies(specialtyId) {
    return await apiClient.get(`especialidades/${specialtyId}/estudios`);
  },

  // ==========================================
  // 3. CATÁLOGO DE ESTUDIOS
  // ==========================================

  /**
   * Obtiene todos los estudios del catálogo, opcionalmente filtrados por especialidad.
   */
  async getAllStudies(especialidadId = null) {
    const url = especialidadId ? `estudios?especialidadId=${especialidadId}` : 'estudios';
    return await apiClient.get(url);
  },

  /**
   * Obtiene un estudio por su ID.
   */
  async getStudyById(id) {
    return await apiClient.get(`estudios/${id}`);
  },

  /**
   * Da de alta un nuevo estudio médico en el catálogo asociado a una especialidad,
   * con duración obligatoria en minutos.
   */
  async createStudy({ nombre, descripcion, duracion, preparacion, especialidadId }) {
    return await apiClient.post('estudios', {
      nombre: nombre.trim(),
      descripcion: (descripcion || '').trim(),
      duracion: Number(duracion),
      preparacion: (preparacion || '').trim(),
      especialidadId: especialidadId ? Number(especialidadId) : null,
    });
  },

  /**
   * Modifica un estudio médico existente.
   */
  async updateStudy({ id, nombre, descripcion, duracion, preparacion, especialidadId }) {
    return await apiClient.put(`estudios/${id}`, {
      id: Number(id),
      nombre: nombre.trim(),
      descripcion: (descripcion || '').trim(),
      duracion: Number(duracion),
      preparacion: (preparacion || '').trim(),
      especialidadId: especialidadId ? Number(especialidadId) : null,
    });
  },

  /**
   * Elimina un estudio médico del catálogo.
   */
  async deleteStudy(id) {
    await apiClient.delete(`estudios/${id}`);
    return true;
  },

  // ==========================================
  // 4. CATÁLOGO GLOBAL DE OBRAS SOCIALES
  // ==========================================

  /**
   * Obtiene todas las obras sociales y prepagas del catálogo global.
   */
  async getObrasSociales() {
    return await apiClient.get('obrassociales');
  },

  /**
   * Obtiene una obra social por su ID.
   */
  async getObraSocialById(id) {
    return await apiClient.get(`obrassociales/${id}`);
  },

  /**
   * Da de alta una nueva obra social o prepaga en el catálogo global.
   */
  async createObraSocial({ nombre, catalogo }) {
    return await apiClient.post('obrassociales', {
      nombre: nombre.trim(),
      catalogo: (catalogo || '').trim(),
    });
  },

  /**
   * Modifica una obra social existente.
   */
  async updateObraSocial({ id, nombre, catalogo }) {
    return await apiClient.put(`obrassociales/${id}`, {
      id: Number(id),
      nombre: nombre.trim(),
      catalogo: (catalogo || '').trim(),
    });
  },

  /**
   * Elimina una obra social del catálogo global.
   */
  async deleteObraSocial(id) {
    await apiClient.delete(`obrassociales/${id}`);
    return true;
  },

  // ==========================================
  // 5. MÉTRICAS GLOBALES Y ESTADO DEL SISTEMA
  // ==========================================

  /**
   * Obtiene las estadísticas globales de adopción:
   * total de instituciones activas, sedes registradas, profesionales en la red y volumen de turnos.
   */
  async getMetrics() {
    return await apiClient.get('vitality/metrics');
  },

  /**
   * Obtiene el estado del servicio en tiempo real (Uptime simulado) y la auditoría global de accesibilidad.
   */
  async getSystemStatus() {
    return await apiClient.get('vitality/system');
  },

  // ==========================================
  // 6. GESTIÓN DE ADMINS & CONSENSO MULTIPARTITO
  // ==========================================

  /**
   * Obtiene todas las solicitudes de alta de Super Administradores.
   */
  async getAdminRequests() {
    return await apiClient.get('vitality/admins/solicitudes');
  },

  /**
   * Obtiene todas las cuentas activas de Super Administradores en la plataforma.
   */
  async getSuperAdmins() {
    return await apiClient.get('vitality/admins');
  },

  /**
   * Propone la creación de un nuevo Super Administrador (queda en estado 'Pendiente').
   */
  async proposeAdmin(email) {
    return await apiClient.post('vitality/admins/proponer', {
      email: email.trim().toLowerCase(),
    });
  },

  /**
   * Aprueba la creación de un Super Administrador (valida consenso: aprobador !== proponente).
   */
  async approveAdmin(id) {
    return await apiClient.post(`vitality/admins/aprobar/${id}`);
  },

  /**
   * Rechaza una propuesta de Super Administrador.
   */
  async rejectAdmin(id) {
    return await apiClient.post(`vitality/admins/rechazar/${id}`);
  },
};

