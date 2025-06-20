import React, { useState, useEffect } from 'react';
import * as permisoApi from './permisoService';
import PermisoForm from './PermisoForm';
import ModalBase from '../../components/modals/ModalBase';

const defaultFormState = {
  nombre: '',
  codigo: '',
  descripcion: '',
};

export default function PermisoModal({ isOpen, onClose, initialData, onSuccess }) {
  const [formData, setFormData] = useState(defaultFormState);

  useEffect(() => {
    if (isOpen) {
      if (initialData) {
        setFormData(initialData);
      } else {
        setFormData(defaultFormState);
      }
    }
  }, [initialData, isOpen]);

  const handleChange = (e) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async () => {
    try {
      if (formData.id) {
        await permisoApi.updatePermiso(formData.id, formData);
      } else {
        await permisoApi.createPermiso(formData);
      }
      onSuccess();
    } catch (error) {
      console.error('Error al guardar el permiso:', error.response?.data || error.message);
      alert(`Error al guardar: ${JSON.stringify(error.response?.data)}`);
    }
  };

  if (!isOpen) return null;

  const title = initialData ? 'Editar Permiso' : 'Crear Permiso';

  return (
    <ModalBase isOpen={isOpen} onClose={onClose} title={title}>
      <div>
        <PermisoForm
          formData={formData}
          onFormChange={handleChange}
        />
        <div className="flex justify-end items-center pt-4 mt-4 border-t gap-2">
          <button onClick={onClose} className="px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300">Cancelar</button>
          <button onClick={handleSubmit} className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600">Guardar</button>
        </div>
      </div>
    </ModalBase>
  );
}