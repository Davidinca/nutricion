import axios from 'axios';

// Función para obtener el valor de una cookie por su nombre
function getCookie(name) {
  let cookieValue = null;
  if (document.cookie && document.cookie !== '') {
    const cookies = document.cookie.split(';');
    for (let i = 0; i < cookies.length; i++) {
      const cookie = cookies[i].trim();
      if (cookie.substring(0, name.length + 1) === (name + '=')) {
        cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
        break;
      }
    }
  }
  return cookieValue;
}

const api = axios.create({
  baseURL: 'http://localhost:8000/api/',  // Cambia esto si usas otro puerto o URL
  withCredentials: true, // Permite que axios envíe cookies
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor para añadir tokens (JWT y CSRF) a cada petición
api.interceptors.request.use(config => {
  // 1. Añadir el token de autenticación (Bearer)
  const token = localStorage.getItem('access_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  // 2. Añadir el token CSRF para peticiones que modifican datos
  if (!['get', 'head', 'options'].includes(config.method.toLowerCase())) {
    const csrfToken = getCookie('csrftoken');
    if (csrfToken) {
      config.headers['X-CSRFToken'] = csrfToken;
    }
  }

  return config;
});

export default api;
