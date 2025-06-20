import React from 'react';
import { useAuth } from '../context/AuthContext';

export default function Dashboard() {
  const { user } = useAuth(); // Usamos el contexto para obtener la información del usuario

  if (!user) {
    return <p>Cargando información del usuario...</p>;
  }

  return (
    <div className="p-6 bg-gray-100 dark:bg-gray-800 min-h-screen">
      <div className="max-w-4xl mx-auto bg-white dark:bg-gray-900 rounded-lg shadow-md p-8">
        <h1 className="text-4xl font-bold text-gray-800 dark:text-white mb-4">
          ¡Bienvenido, {user.nombres}!
        </h1>
        <p className="text-lg text-gray-600 dark:text-gray-300 mb-6">
          Has iniciado sesión correctamente. Desde aquí puedes navegar a las diferentes secciones utilizando la barra de navegación superior.
        </p>

        <div className="bg-gray-50 dark:bg-gray-700 p-6 rounded-lg">
          <h2 className="text-2xl font-semibold text-gray-700 dark:text-white mb-4">Tu Perfil</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="font-semibold text-gray-600 dark:text-gray-200">Correo:</p>
              <p className="text-gray-800 dark:text-gray-100">{user.correo}</p>
            </div>
            <div>
              <p className="font-semibold text-gray-600 dark:text-gray-200">Roles:</p>
              <p className="text-gray-800 dark:text-gray-100">{user.roles?.join(', ') || 'No asignado'}</p>
            </div>
          </div>
          <div className="mt-4">
            <p className="font-semibold text-gray-600 dark:text-gray-200">Permisos:</p>
            {user.permisos && user.permisos.length > 0 ? (
              <div className="flex flex-wrap gap-2 mt-2">
                {user.permisos.map((permiso) => (
                  <span key={permiso} className="px-2 py-1 bg-blue-100 text-blue-800 text-xs font-semibold rounded-full">
                    {permiso}
                  </span>
                ))}
              </div>
            ) : (
              <p className="text-gray-800 dark:text-gray-100">No tienes permisos específicos asignados.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
