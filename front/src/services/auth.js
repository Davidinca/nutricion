// src/services/auth.js
import api from './api';

export async function login(correo, password) {
  try {
    const response = await api.post('token/', { correo, password });
    
    const { access, refresh, user } = response.data;

    if (access && user) {
      // 1. Guardar tokens y datos del usuario en localStorage
      localStorage.setItem('access_token', access);
      localStorage.setItem('refresh_token', refresh);
      localStorage.setItem('user', JSON.stringify(user)); // Guardamos el objeto de usuario completo
      
      // 2. Configurar la cabecera de autorización para todas las peticiones futuras
      api.defaults.headers.common['Authorization'] = `Bearer ${access}`;
      
      console.log('Login exitoso. Usuario y token guardados.');
    }

    return response.data;
  } catch (error) {
    console.error('Error en login:', error);
    // Limpiar todo en caso de error para evitar un estado inconsistente
    logout();
    throw error.response?.data || error;
  }
}

export function logout() {
  // 1. Eliminar toda la información de sesión de localStorage
  localStorage.removeItem('access_token');
  localStorage.removeItem('refresh_token');
  localStorage.removeItem('user'); // Eliminamos el objeto de usuario
  
  // 2. Eliminar la cabecera de autorización de la instancia de api
  delete api.defaults.headers.common['Authorization'];

  console.log('Sesión cerrada y datos de usuario eliminados.');
}
