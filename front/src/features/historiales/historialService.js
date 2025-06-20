import api from '../../services/api';

const API_URL = 'usuarios/historiales/';

// Obtener todos los historiales
export const getHistoriales = () => {
  return api.get(API_URL);
};

// Crear un nuevo historial
export const createHistorial = (historialData) => {
  return api.post(API_URL, historialData);
};

// Actualizar un historial
export const updateHistorial = (id, historialData) => {
  return api.put(`${API_URL}${id}/`, historialData);
};

// Eliminar un historial
export const deleteHistorial = (id) => {
  return api.delete(`${API_URL}${id}/`);
};
