import api from '../../services/api';

const API_URL = 'usuarios/roles/';

export const getRoles = () => api.get(API_URL);
export const getRol = (id) => api.get(`${API_URL}${id}/`);
export const createRol = (data) => api.post(API_URL, data);
export const updateRol = (id, data) => api.put(`${API_URL}${id}/`, data);
export const deleteRol = (id) => api.delete(`${API_URL}${id}/`);
