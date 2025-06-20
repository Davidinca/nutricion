import React, { useState, useEffect } from 'react';
import { generateRecomendacion } from './recomendacionService';
import { getNinos } from '../ninos/ninoService';
import Modal from '../../components/modals/ModalBase';
import { Button } from 'flowbite-react';
import Select from 'react-select';

const GeneradorModal = ({ isOpen, onClose, onGenerateSuccess }) => {
  const [ninos, setNinos] = useState([]);
  const [selectedNino, setSelectedNino] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (isOpen) {
      setError('');
      setSelectedNino(null);
      
      const fetchNinos = async () => {
        try {
          const { data } = await getNinos();
          const options = data.map(nino => ({ value: nino.id, label: `${nino.nombres} ${nino.apellido_paterno || ''} ${nino.apellido_materno || ''} (CI: ${nino.ci})` }));
          setNinos(options);
        } catch (err) {
          setError('No se pudo cargar la lista de niños.');
          console.error(err);
        }
      };
      fetchNinos();
    }
  }, [isOpen]);

  const handleGenerateClick = async () => {
    if (!selectedNino) {
      setError('Por favor, selecciona un niño.');
      return;
    }
    setIsLoading(true);
    setError('');
    try {
      const { data } = await generateRecomendacion(selectedNino.value);
      if (data.ok && data.recomendacion_id) {
        onGenerateSuccess(data.recomendacion_id);
      } else {
        throw new Error(data.error || 'La respuesta de la API no fue la esperada.');
      }
    } catch (err) {
      const errorMessage = err.response?.data?.error || err.message || 'Ocurrió un error desconocido.';
      setError(`Error al generar la recomendación: ${errorMessage}`);
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Generar Recomendación Automática">
      <div className="p-4">
        <p className="mb-4">Selecciona un niño para generar una dieta automática basada en sus datos (edad, peso, alergias, etc.).</p>
        <Select
          options={ninos}
          value={selectedNino}
          onChange={setSelectedNino}
          placeholder="Buscar y seleccionar un niño..."
          isClearable
          className="react-select-container"
          classNamePrefix="react-select"
        />
        {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
        <div className="flex justify-end mt-6">
          <Button color="gray" onClick={onClose} className="mr-2">Cancelar</Button>
          <Button color="blue" onClick={handleGenerateClick} disabled={isLoading || !selectedNino}>
            {isLoading ? 'Generando...' : 'Generar Dieta'}
          </Button>
        </div>
      </div>
    </Modal>
  );
};

export default GeneradorModal;