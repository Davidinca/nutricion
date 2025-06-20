import api from '../../services/api';

const API_URL = 'usuarios/logs/';

// Obtener todos los logs
export const getLogs = () => {
  return api.get(API_URL);
};
