const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export const authService = {
  /**
   * Conecta con AuthController POST /api/auth/iniciar-sesion
   * @param {Object} credentials
   * @param {string} credentials.usuario - Nombre de usuario o credencial
   * @param {string} credentials.contra - Contraseña
   * @returns {Promise<{id: number, usuario: string, mail: string, rol: string, cuil: string|null, token: string}>}
   */
  async login({ usuario, contra }) {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/iniciar-sesion`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          usuario: usuario.trim(),
          contra,
        }),
      });

      const data = await response.json().catch(() => null);

      if (!response.ok) {
        const errorMsg = data?.detail || data?.message || 'Error de autenticación. Verifica tus credenciales.';
        throw new Error(errorMsg);
      }

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
    } catch (err) {
      if (err instanceof TypeError && err.message.includes('Failed to fetch')) {
        throw new Error('No se pudo conectar con el servidor backend. Verifica que esté en ejecución en el puerto 5000.');
      }
      throw err;
    }
  },

  /**
   * Conecta con AuthController POST /api/auth/registrar
   */
  async register({ usuario, contra, mail, rol }) {
    const response = await fetch(`${API_BASE_URL}/auth/registrar`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ usuario, contra, mail, rol }),
    });

    const data = await response.json().catch(() => null);

    if (!response.ok) {
      throw new Error(data?.detail || data?.message || 'No se pudo completar el registro.');
    }

    return data;
  },
};
