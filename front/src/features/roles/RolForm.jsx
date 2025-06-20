import React from 'react';

export default function RolForm({ formData, allPermissions, allUsers, onFormChange, onPermissionsChange, isEditing }) {

  const handleCheckboxChange = (permisoId) => {
    const newPermissionIds = formData.permiso_ids.includes(permisoId)
      ? formData.permiso_ids.filter(id => id !== permisoId)
      : [...formData.permiso_ids, permisoId];
    onPermissionsChange(newPermissionIds);
  };

  // Buscar el nombre completo del usuario para mostrarlo en modo edición
  const selectedUserName = isEditing && allUsers.find(u => u.id === formData.usuario)?.correo;

  return (
    <form className="space-y-4">
      {/* Selector de Usuario (solo para nuevos roles) */}
      <div>
        <label htmlFor="usuario" className="block text-sm font-medium text-gray-700">Usuario</label>
        {isEditing ? (
          <input
            type="text"
            value={selectedUserName || `ID: ${formData.usuario}`}
            disabled
            className="mt-1 block w-full px-3 py-2 bg-gray-100 border border-gray-300 rounded-md shadow-sm"
          />
        ) : (
          <select
            name="usuario"
            id="usuario"
            value={formData.usuario || ''}
            onChange={onFormChange}
            className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
          >
            <option value="" disabled>Seleccione un usuario</option>
            {allUsers.map(user => (
              <option key={user.id} value={user.id}>
                {user.nombres} {user.apellido_paterno} ({user.correo})
              </option>
            ))}
          </select>
        )}
      </div>

      {/* Nombre del Rol */}
      <div>
        <label htmlFor="rol" className="block text-sm font-medium text-gray-700">Nombre del Rol</label>
        <input
          type="text"
          name="rol" // Cambiado de 'nombre' a 'rol'
          id="rol"
          value={formData.rol || ''}
          onChange={onFormChange}
          className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
        />
      </div>

      {/* Permisos */}
      <div>
        <label className="block text-sm font-medium text-gray-700">Permisos</label>
        <div className="mt-2 p-3 border border-gray-300 rounded-md max-h-60 overflow-y-auto grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
          {allPermissions.map(permiso => (
            <div key={permiso.id} className="flex items-center">
              <input
                id={`permiso-${permiso.id}`}
                name={`permiso-${permiso.id}`}
                type="checkbox"
                checked={formData.permiso_ids.includes(permiso.id)}
                onChange={() => handleCheckboxChange(permiso.id)}
                className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
              />
              <label htmlFor={`permiso-${permiso.id}`} className="ml-2 block text-sm text-gray-900">
                {permiso.nombre}
              </label>
            </div>
          ))}
        </div>
      </div>
    </form>
  );
}