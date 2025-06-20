import React from 'react';

// Este componente ahora recibe el usuario como prop
const UsuarioDetail = ({ usuario }) => {
  // El componente que lo llama (UsuarioList) ya se encarga de verificar si el usuario existe
  if (!usuario) {
    return <div>No se ha seleccionado ningún usuario.</div>;
  }

  return (
    // No se necesita el div p-4 ni el título h1, ya que el modal los proporciona.
    <div className="bg-white rounded-lg p-2">
        <div className="mb-4">
          <strong className="text-gray-700">Nombres:</strong>
          <p>{usuario.nombres}</p>
        </div>
        <div className="mb-4">
          <strong className="text-gray-700">Apellido Paterno:</strong>
          <p>{usuario.apellido_paterno}</p>
        </div>
        <div className="mb-4">
          <strong className="text-gray-700">Apellido Materno:</strong>
          <p>{usuario.apellido_materno}</p>
        </div>
        <div className="mb-4">
          <strong className="text-gray-700">Correo Electrónico:</strong>
          <p>{usuario.correo}</p>
        </div>
        <div className="mb-4">
          <strong className="text-gray-700">Rol:</strong>
          <p>{usuario.rol_nombre || 'No asignado'}</p>
        </div>
        {/* El botón para cerrar/volver lo maneja el modal (ModalBase) */}
    </div>
  );
};

export default UsuarioDetail;
