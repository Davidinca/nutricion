import api from '../../services/api';

const API_URL = 'usuarios/alimentos/';

// Obtener todos los alimentos
export const getAlimentos = () => {
  return api.get(API_URL);
};

// Crear un nuevo alimento
export const createAlimento = (alimentoData) => {
  return api.post(API_URL, alimentoData);
};

// Actualizar un alimento
export const updateAlimento = (id, alimentoData) => {
  return api.put(`${API_URL}${id}/`, alimentoData);
};

// Eliminar un alimento
export const deleteAlimento = (id) => {
  return api.delete(`${API_URL}${id}/`);
};
