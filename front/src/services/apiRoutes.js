// src/services/apiRoutes.js

const API_BASE = "http://localhost:8000/api/usuarios"; // Ajustá si tu prefix o dominio es distinto

const apiRoutes = {
  usuarios: {
    list: `${API_BASE}/usuarios/`,
    detail: id => `${API_BASE}/usuarios/${id}/`,
  },
  ninos: {
    list: `${API_BASE}/ninos/`,
    detail: id => `${API_BASE}/ninos/${id}/`,
  },
  logs: {
    list: `${API_BASE}/logs/`,
    detail: id => `${API_BASE}/logs/${id}/`,
  },
  historiales: {
    list: `${API_BASE}/historiales/`,
    detail: id => `${API_BASE}/historiales/${id}/`,
  },
  alimentos: {
    list: `${API_BASE}/alimentos/`,
    detail: id => `${API_BASE}/alimentos/${id}/`,
  },
  recomendaciones: {
    list: `${API_BASE}/recomendaciones/`,
    detail: id => `${API_BASE}/recomendaciones/${id}/`,
    generar: ninoId => `${API_BASE}/recomendacion/${ninoId}/crear/`,
  },
  desayuno: {
    list: `${API_BASE}/recomendacion-desayuno/`,
    detail: id => `${API_BASE}/recomendacion-desayuno/${id}/`,
  },
  almuerzo: {
    list: `${API_BASE}/recomendacion-almuerzo/`,
    detail: id => `${API_BASE}/recomendacion-almuerzo/${id}/`,
  },
  cena: {
    list: `${API_BASE}/recomendacion-cena/`,
    detail: id => `${API_BASE}/recomendacion-cena/${id}/`,
  },
  parametros: {
    list: `${API_BASE}/parametros-referencia/`,
    detail: id => `${API_BASE}/parametros-referencia/${id}/`,
  },
  permisos: {
    list: `${API_BASE}/permisos/`,
    detail: id => `${API_BASE}/permisos/${id}/`,
  },
  roles: {
    list: `${API_BASE}/roles/`,
    detail: id => `${API_BASE}/roles/${id}/`,
  },
  rolPermisos: {
    list: `${API_BASE}/rol-permisos/`,
    detail: id => `${API_BASE}/rol-permisos/${id}/`,
  },
};

export default apiRoutes;
