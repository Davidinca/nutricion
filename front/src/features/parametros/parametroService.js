import api from '../../services/api';

const API_URL = 'usuarios/parametros-referencia/';

// Obtener todos los parámetros
export const getParametros = () => {
  return api.get(API_URL);
};

// Crear un nuevo parámetro
export const createParametro = (parametroData) => {
  return api.post(API_URL, parametroData);
};

// Actualizar un parámetro
export const updateParametro = (id, parametroData) => {
  return api.put(`${API_URL}${id}/`, parametroData);
};

// Eliminar un parámetro
export const deleteParametro = (id) => {
  return api.delete(`${API_URL}${id}/`);
};
