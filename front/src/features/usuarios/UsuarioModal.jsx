import React, { useState, useEffect } from 'react';
import { createUsuario, updateUsuario } from './usuarioService';
import UsuarioForm from './UsuarioForm';
import ModalBase from '../../components/modals/ModalBase';

// Estado inicial que coincide con el formulario y el modelo
const defaultFormState = {
  nombres: '',
  apellido_paterno: '',
  apellido_materno: '',
  correo: '',
  ci: '',
  rol: '',
  password: '',
};

export default function UsuarioModal({ isOpen, onClose, initialData, onSuccess }) {
  const [formData, setFormData] = useState(defaultFormState);

  useEffect(() => {
    if (isOpen) {
      // Si hay datos iniciales (modo edición), los usamos. Si no, usamos el estado por defecto.
      // Aseguramos que el campo password esté vacío al abrir para no mostrar la contraseña hasheada.
      const data = initialData ? { ...defaultFormState, ...initialData, password: '' } : defaultFormState;
      setFormData(data);
    }
  }, [initialData, isOpen]);

  const handleChange = (e) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async () => {
    const dataToSend = { ...formData };

    // Lógica clave: si estamos editando y la contraseña está en blanco,
    // la eliminamos de los datos a enviar para no sobreescribirla.
    if (dataToSend.id && !dataToSend.password) {
      delete dataToSend.password;
    }

    try {
      if (dataToSend.id) {
        await updateUsuario(dataToSend.id, dataToSend);
      } else {
        await createUsuario(dataToSend);
      }
      onSuccess();
    } catch (error) {
      if (error.response && error.response.data) {
        console.error('Error de validación:', error.response.data);
        alert(`Error al guardar: ${JSON.stringify(error.response.data)}`);
      } else {
        console.error('Error al guardar usuario:', error.message);
        alert('Ocurrió un error inesperado al guardar.');
      }
    }
  };

  if (!isOpen) return null;

  const title = initialData ? 'Editar Usuario' : 'Crear Usuario';

  return (
    <ModalBase isOpen={isOpen} onClose={onClose} title={title}>
      <div>
        <UsuarioForm formData={formData} onChange={handleChange} />
        <div className="flex justify-end items-center pt-4 mt-4 border-t gap-2">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300"
          >
            Cancelar
          </button>
          <button
            onClick={handleSubmit}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Guardar
          </button>
        </div>
      </div>
    </ModalBase>
  );
}