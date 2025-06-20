import React, { useState, useEffect } from 'react';
import { createNino, updateNino } from './ninoService';
import NinoForm from './NinoForm';
import ModalBase from '../../components/modals/ModalBase';

const defaultFormState = {
  nombres: '',
  apellido_paterno: '',
  apellido_materno: '',
  ci: '',
  fecha_nacimiento: '',
  usuario: '', // ID del usuario padre/tutor
};

export default function NinoModal({ isOpen, onClose, initialData, onSuccess }) {
  const [formData, setFormData] = useState(defaultFormState);

  useEffect(() => {
    if (isOpen) {
      setFormData(initialData ? { ...defaultFormState, ...initialData } : defaultFormState);
    }
  }, [initialData, isOpen]);

  const handleChange = (e) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async () => {
    try {
      if (formData.id) {
        await updateNino(formData.id, formData);
      } else {
        await createNino(formData);
      }
      onSuccess();
    } catch (error) {
      if (error.response && error.response.data) {
        console.error('Error de validación:', error.response.data);
        alert(`Error al guardar: ${JSON.stringify(error.response.data)}`);
      } else {
        console.error('Error al guardar:', error.message);
        alert('Ocurrió un error inesperado al guardar.');
      }
    }
  };

  if (!isOpen) return null;

  const title = initialData ? 'Editar Niño' : 'Crear Niño';

  return (
    <ModalBase isOpen={isOpen} onClose={onClose} title={title}>
      <div>
        <NinoForm formData={formData} onChange={handleChange} />
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
