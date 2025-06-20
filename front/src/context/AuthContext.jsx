import React, { createContext, useState, useContext, useEffect } from 'react';
import * as authService from '../services/auth';

// 1. Crear el contexto
const AuthContext = createContext();

// Hook personalizado para usar el contexto de autenticación más fácilmente
export const useAuth = () => {
  return useContext(AuthContext);
};

// 2. Crear el proveedor del contexto
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);

  // Cargar el usuario desde localStorage al iniciar la aplicación
  useEffect(() => {
    try {
      const storedUser = localStorage.getItem('user');
      if (storedUser) {
        const userData = JSON.parse(storedUser);
        console.log("AuthContext: Usuario cargado desde localStorage", userData); // Log para depuración
        setUser(userData);
      }
    } catch (error) {
      console.error("Failed to parse user from localStorage", error);
      authService.logout();
      setUser(null);
    }
  }, []);

  // Función de login que actualiza el estado
  const login = async (correo, password) => {
    try {
      const data = await authService.login(correo, password);
      if (data.user) {
        console.log("AuthContext: Usuario recibido en login", data.user); // Log para depuración
        setUser(data.user);
      }
      return data;
    } catch (error) {
      logout();
      throw error;
    }
  };

  // Función de logout que limpia el estado
  const logout = () => {
    authService.logout();
    setUser(null);
  };

  // Función para verificar si el usuario tiene un permiso específico
  const hasPermission = (permissionCode) => {
    // 1. Un superusuario de Django o un usuario con el rol 'admin' tienen acceso a todo.
    if (user && (user.is_superuser || (Array.isArray(user.roles) && user.roles.includes('admin')))) {
      return true;
    }

    // Si no se requiere un permiso específico (ej. para el dashboard), permitir acceso si está autenticado.
    if (!permissionCode) {
      return !!user;
    }

    // 2. Para otros usuarios, verificar la lista de permisos explícita.
    if (!user || !Array.isArray(user.permisos)) {
      return false;
    }
    return user.permisos.includes(permissionCode);
  };

  // El valor que se pasará a los componentes hijos
  const value = {
    user,
    isAuthenticated: !!user,
    login,
    logout,
    hasPermission,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
