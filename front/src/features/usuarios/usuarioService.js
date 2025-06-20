// src/features/usuarios/usuarioService.js
import api from '../../services/api';

// La ruta base correcta para los usuarios.
const USER_API_URL = 'usuarios/usuarios/';

export const getUsuarios = () => {
  return api.get(USER_API_URL);
};

// Esta función no se usa actualmente, pero se corrige por si se necesita en el futuro.
export const getUsuario = (id) => {
  return api.get(`${USER_API_URL}${id}/`);
};

export const createUsuario = (data) => {
  return api.post(USER_API_URL, data);
};

export const updateUsuario = (id, data) => {
  return api.put(`${USER_API_URL}${id}/`, data);
};

export const deleteUsuario = (id) => {
  return api.delete(`${USER_API_URL}${id}/`);
};


// --- AÑADIR ESTE CÓDIGO AL FINAL DEL ARCHIVO ---

// El endpoint para roles personalizados, según lo que vimos en urls.py
const ROL_URL = '/usuarios/roles/';

/**
 * Crea un nuevo rol personalizado.
 * @param {object} rolData - Los datos del rol, ej: { rol: 'Nombre', permiso_ids: [1, 2], usuario: 3 }
 */
export const createRol = (rolData) => {
  return api.post(ROL_URL, rolData);
};

/**
 * Actualiza un rol existente.
 * @param {number} id - El ID del rol a actualizar.
 * @param {object} rolData - Los datos a actualizar, ej: { rol: 'Nuevo Nombre', permiso_ids: [1, 3] }
 */
export const updateRol = (id, rolData) => {
  // DRF espera un PUT o PATCH en la URL específica del recurso
  return api.put(`${ROL_URL}${id}/`, rolData);
};


// --- AÑADIR ESTE CÓDIGO AL FINAL DEL ARCHIVO ---

const PERMISO_URL = '/usuarios/permisos/';

/**
 * Obtiene la lista de todos los permisos disponibles.
 */
export const getPermisos = () => {
  return api.get(PERMISO_URL);
};

// Obtener todos los roles
export const getRoles = () => {
  return api.get('/usuarios/roles/');
};