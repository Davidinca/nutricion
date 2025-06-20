import api from '../../services/api';

const API_URL = 'usuarios/ninos/';

// Obtener todos los ninos
export const getNinos = () => {
  return api.get(API_URL);
};

// Crear un nuevo nino
export const createNino = (ninoData) => {
  return api.post(API_URL, ninoData);
};

// Actualizar un nino
export const updateNino = (id, ninoData) => {
  return api.put(`${API_URL}${id}/`, ninoData);
};

// Eliminar un nino
export const deleteNino = (id) => {
  return api.delete(`${API_URL}${id}/`);
};
