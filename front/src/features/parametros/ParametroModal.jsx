import React, { useState, useEffect } from 'react';
import { createParametro, updateParametro } from './parametroService';
import ParametroForm from './ParametroForm';
import ModalBase from '../../components/modals/ModalBase';

const defaultFormState = {
  edad_min: '',
  edad_max: '',
  calorias: '',
  proteinas: '',
  hierro: '',
  fuente: '',
};

export default function ParametroModal({ isOpen, onClose, initialData, onSuccess }) {
  const [formData, setFormData] = useState(defaultFormState);

  useEffect(() => {
    if (isOpen) {
      if (initialData) {
        setFormData({ ...defaultFormState, ...initialData });
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
        await updateParametro(formData.id, formData);
      } else {
        await createParametro(formData);
      }
      onSuccess();
    } catch (error) {
      console.error('Error al guardar el parámetro:', error.response?.data || error.message);
      alert(`Error al guardar: ${JSON.stringify(error.response?.data)}`);
    }
  };

  if (!isOpen) return null;

  const title = initialData ? 'Editar Parámetro de Referencia' : 'Crear Parámetro de Referencia';

  return (
    <ModalBase isOpen={isOpen} onClose={onClose} title={title}>
      <div>
        <ParametroForm formData={formData} onChange={handleChange} />
        <div className="flex justify-end items-center pt-4 mt-4 border-t gap-2">
          <button onClick={onClose} className="px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300">Cancelar</button>
          <button onClick={handleSubmit} className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600">Guardar</button>
        </div>
      </div>
    </ModalBase>
  );
}
