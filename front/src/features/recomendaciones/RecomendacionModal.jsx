import React, { useState, useEffect } from 'react';
import * as api from './recomendacionService';
import { getNinos } from '../ninos/ninoService';
import { getAlimentos } from '../alimentos/alimentoService';
import RecomendacionForm from './RecomendacionForm';
import ModalBase from '../../components/modals/ModalBase';

const defaultFormState = {
  nino: '',
  fecha: new Date().toISOString().split('T')[0],
  motivo: '',
  notas: '',
  desayuno: [],
  almuerzo: [],
  cena: [],
};

export default function RecomendacionModal({ isOpen, onClose, initialData, onSuccess }) {
  const [formData, setFormData] = useState(defaultFormState);
  const [ninos, setNinos] = useState([]);
  const [alimentos, setAlimentos] = useState([]);

  useEffect(() => {
    if (isOpen) {
      getNinos().then(res => setNinos(res.data));
      getAlimentos().then(res => setAlimentos(res.data));

      if (initialData) {
        // Fetch existing meal items and populate form
        Promise.all([
          api.getDesayunos(initialData.id),
          api.getAlmuerzos(initialData.id),
          api.getCenas(initialData.id),
        ]).then(([desayunosRes, almuerzosRes, cenasRes]) => {
          setFormData({
            ...initialData,
            desayuno: desayunosRes.data.map(d => String(d.alimento)),
            almuerzo: almuerzosRes.data.map(a => String(a.alimento)),
            cena: cenasRes.data.map(c => String(c.alimento)),
          });
        });
      } else {
        setFormData(defaultFormState);
      }
    }
  }, [initialData, isOpen]);

  const handleChange = (e) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleMealChange = (e) => {
    const { name, options } = e.target;
    const value = Array.from(options).filter(option => option.selected).map(option => option.value);
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async () => {
    const { desayuno, almuerzo, cena, ...recData } = formData;

    try {
      if (recData.id) {
        // Update logic is complex. For now, we just update the main object.
        // A full implementation would compare and sync meal items.
        await api.updateRecomendacion(recData.id, recData);
      } else {
        const response = await api.createRecomendacion(recData);
        const newRecId = response.data.id;

        const mealPromises = [
          ...desayuno.map(alimentoId => api.createDesayuno({ recomendacion: newRecId, alimento: alimentoId })),
          ...almuerzo.map(alimentoId => api.createAlmuerzo({ recomendacion: newRecId, alimento: alimentoId })),
          ...cena.map(alimentoId => api.createCena({ recomendacion: newRecId, alimento: alimentoId })),
        ];
        await Promise.all(mealPromises);
      }
      onSuccess();
    } catch (error) {
      console.error('Error al guardar la recomendación:', error.response?.data || error.message);
      alert(`Error al guardar: ${JSON.stringify(error.response?.data)}`);
    }
  };

  if (!isOpen) return null;

  const title = initialData ? 'Editar Recomendación' : 'Crear Recomendación';

  return (
    <ModalBase isOpen={isOpen} onClose={onClose} title={title} size="3xl">
      <div>
        <RecomendacionForm
          formData={formData}
          onChange={handleChange}
          onMealChange={handleMealChange}
          ninos={ninos}
          alimentos={alimentos}
        />
        <div className="flex justify-end items-center pt-4 mt-4 border-t gap-2">
          <button onClick={onClose} className="px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300">Cancelar</button>
          <button onClick={handleSubmit} className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600">Guardar</button>
        </div>
      </div>
    </ModalBase>
  );
}
