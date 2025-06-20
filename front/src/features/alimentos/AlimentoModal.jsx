import React, { useState, useEffect } from 'react';
import { createAlimento, updateAlimento } from './alimentoService';
import AlimentoForm from './AlimentoForm';
import ModalBase from '../../components/modals/ModalBase';

const defaultFormState = {
  nombre: '',
  categoria: '',
  calorias: '',
  proteinas: '',
  grasas: '',
  carbohidratos: '',
  grupo_alimenticio: '',
  alergenos: '', // Se manejará como string en el form
};

export default function AlimentoModal({ isOpen, onClose, initialData, onSuccess }) {
  const [formData, setFormData] = useState(defaultFormState);

  useEffect(() => {
    if (isOpen) {
      if (initialData) {
        // Si hay data inicial, convierte el array de alérgenos a string
        setFormData({ ...defaultFormState, ...initialData, alergenos: (initialData.alergenos || []).join(', ') });
      } else {
        setFormData(defaultFormState);
      }
    }
  }, [initialData, isOpen]);

  const handleChange = (e) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async () => {
    // Prepara los datos para enviar, convirtiendo alérgenos a un array
    const dataToSend = {
      ...formData,
      alergenos: formData.alergenos.split(',').map(s => s.trim()).filter(Boolean), // Filtra vacíos
    };

    try {
      if (formData.id) {
        await updateAlimento(formData.id, dataToSend);
      } else {
        await createAlimento(dataToSend);
      }
      onSuccess();
    } catch (error) {
      console.error('Error al guardar el alimento:', error.response?.data || error.message);
      alert(`Error al guardar: ${JSON.stringify(error.response?.data)}`);
    }
  };

  if (!isOpen) return null;

  const title = initialData ? 'Editar Alimento' : 'Crear Alimento';

  return (
    <ModalBase isOpen={isOpen} onClose={onClose} title={title}>
      <div>
        <AlimentoForm formData={formData} onChange={handleChange} />
        <div className="flex justify-end items-center pt-4 mt-4 border-t gap-2">
          <button onClick={onClose} className="px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300">Cancelar</button>
          <button onClick={handleSubmit} className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600">Guardar</button>
        </div>
      </div>
    </ModalBase>
  );
}
