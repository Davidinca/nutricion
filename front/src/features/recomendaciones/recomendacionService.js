import api from '../../services/api';

// --- Funciones para el CRUD de Recomendaciones ---

// Obtener TODAS las recomendaciones (para la lista)
export const getRecomendaciones = () => api.get('/usuarios/recomendaciones/');

// Obtener UNA recomendación por su ID (para ver detalles)
export const getRecomendacion = (id) => api.get(`/usuarios/recomendaciones/${id}/`);

// Crear una recomendación manualmente
export const createRecomendacion = (data) => api.post('/usuarios/recomendaciones/', data);

// Actualizar una recomendación manualmente
export const updateRecomendacion = (id, data) => api.put(`/usuarios/recomendaciones/${id}/`, data);

// Eliminar una recomendación
export const deleteRecomendacion = (id) => api.delete(`/usuarios/recomendaciones/${id}/`);


// --- Función para la Generación Automática ---

// Llama al endpoint del generador automático
// Devuelve: { ok: true, recomendacion_id: ... }
export const generateRecomendacion = (ninoId) => api.post(`/recomendacion/${ninoId}/crear/`);