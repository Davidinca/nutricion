import React, { useState, useEffect } from 'react';
import { createHistorial, updateHistorial } from './historialService';
import { getNinos } from '../ninos/ninoService';
import HistorialForm from './HistorialForm';
import ModalBase from '../../components/modals/ModalBase';

const defaultFormState = {
  nino: '',
  peso: '',
  talla: '',
  actividad_fisica: '',
  enfermedades: '',
  alergias: '',
  observaciones: '',
};

export default function HistorialModal({ isOpen, onClose, initialData, onSuccess }) {
  const [formData, setFormData] = useState(defaultFormState);
  const [ninos, setNinos] = useState([]);

  useEffect(() => {
    if (isOpen) {
      getNinos()
        .then(response => setNinos(response.data))
        .catch(error => console.error('Error fetching ninos', error));

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
        await updateHistorial(formData.id, formData);
      } else {
        await createHistorial(formData);
      }
      onSuccess();
    } catch (error) {
      console.error('Error al guardar el historial:', error.response?.data || error.message);
      alert(`Error al guardar: ${JSON.stringify(error.response?.data)}`);
    }
  };

  if (!isOpen) return null;

  const title = initialData ? 'Editar Historial Clínico' : 'Crear Historial Clínico';

  return (
    <ModalBase isOpen={isOpen} onClose={onClose} title={title}>
      <div>
        <HistorialForm formData={formData} onChange={handleChange} ninos={ninos} />
        <div className="flex justify-end items-center pt-4 mt-4 border-t gap-2">
          <button onClick={onClose} className="px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300">Cancelar</button>
          <button onClick={handleSubmit} className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600">Guardar</button>
        </div>
      </div>
    </ModalBase>
  );
}
