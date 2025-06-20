import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

/**
 * Un componente guardián que protege un conjunto de rutas.
 * Verifica si el usuario está autenticado. Si no lo está, lo redirige al login.
 * Si está autenticado, renderiza las rutas anidadas a través del componente Outlet.
 */
const ProtectedRoute = () => {
  const { isAuthenticated } = useAuth();

  // Si el usuario está autenticado, permite el acceso a las rutas hijas.
  // El <Outlet /> es el marcador de posición donde se renderizarán esas rutas.
  return isAuthenticated ? <Outlet /> : <Navigate to="/login" replace />;
};

export default ProtectedRoute;
