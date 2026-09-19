import { apiClient } from '../../../core/api/apiClient';

export const authService = {
  /**
   * Conecta con AuthController POST /api/auth/iniciar-sesion
   * @param {Object} credentials
   * @param {string} credentials.usuario - Nombre de usuario o credencial
   * @param {string} credentials.contra - Contraseña
   * @returns {Promise<{id: number, usuario: string, mail: string, rol: string, cuil: string|null, token: string}>}
   */
  async login({ usuario, contra }) {
    const data = await apiClient.post('auth/iniciar-sesion', {
      usuario: usuario.trim(),
      contra,
    });

    return {
      id: data.id,
      usuario: data.usuario,
      mail: data.mail,
      rol: data.rol,
      cuil: data.cuil,
      token: data.token,
      consultorioCuit: data.consultorioCuit || null,
      institucionId: data.institucionId || null,
      sedeNombre: data.sedeNombre || null,
    };
  },

  /**
   * Conecta con AuthController POST /api/auth/registrar
   */
  async register({ usuario, contra, mail, rol }) {
    return await apiClient.post('auth/registrar', {
      usuario,
      contra,
      mail,
      rol,
    });
  },

  /**
   * Conecta con AuthController POST /api/auth/register/patient
   */
  async registerPatient({ nombre, apellido, dni, email, contrasena, obraSocialId }) {
    const data = await apiClient.post('auth/register/patient', {
      nombre: nombre.trim(),
      apellido: apellido.trim(),
      dni: dni.trim(),
      email: email.trim().toLowerCase(),
      contrasena,
      obraSocialId: obraSocialId ? Number(obraSocialId) : null,
    });

    return {
      id: data.id,
      usuario: data.usuario,
      mail: data.mail,
      rol: data.rol,
      cuil: data.cuil,
      token: data.token,
    };
  },
};
