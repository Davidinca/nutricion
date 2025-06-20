import api from '../../services/api';

const API_URL = 'usuarios/permisos/';

// CRUD para Permisos
export const getPermisos = () => api.get(API_URL);
export const getPermiso = (id) => api.get(`${API_URL}${id}/`);
export const createPermiso = (data) => api.post(API_URL, data);
export const updatePermiso = (id, data) => api.put(`${API_URL}${id}/`, data);
export const deletePermiso = (id) => api.delete(`${API_URL}${id}/`);