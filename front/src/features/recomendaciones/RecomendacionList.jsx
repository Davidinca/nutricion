import React, { useState, useEffect } from 'react';
import { getRecomendaciones, deleteRecomendacion, getRecomendacion } from './recomendacionService';
import RecomendacionForm from './RecomendacionForm';
import RecomendacionDetail from './RecomendacionDetail';
import GeneradorModal from './GeneradorModal';
import Modal from '../../components/modals/ModalBase';
import { Button } from 'flowbite-react';
import { FaPlus, FaEye, FaEdit, FaTrash, FaRobot } from 'react-icons/fa';

const RecomendacionList = () => {
  const [recomendaciones, setRecomendaciones] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isGeneratorModalOpen, setIsGeneratorModalOpen] = useState(false);

  const [selectedRecomendacion, setSelectedRecomendacion] = useState(null);
  const [recomendacionParaBorrar, setRecomendacionParaBorrar] = useState(null);
  const [recomendacionParaVer, setRecomendacionParaVer] = useState(null);

  const fetchRecomendaciones = async () => {
    setIsLoading(true);
    try {
      const { data } = await getRecomendaciones();
      setRecomendaciones(data);
    } catch (error) {
      console.error("Error al obtener las recomendaciones", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchRecomendaciones();
  }, []);

  const handleOpenCreate = () => {
    setSelectedRecomendacion(null);
    setIsFormModalOpen(true);
  };

  const handleOpenEdit = (recomendacion) => {
    setSelectedRecomendacion(recomendacion);
    setIsFormModalOpen(true);
  };

  const handleFormSuccess = () => {
    setIsFormModalOpen(false);
    fetchRecomendaciones();
  };

  const handleOpenDelete = (recomendacion) => {
    setRecomendacionParaBorrar(recomendacion);
    setIsDeleteModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!recomendacionParaBorrar) return;
    try {
      await deleteRecomendacion(recomendacionParaBorrar.id);
      fetchRecomendaciones();
    } catch (error) {
      console.error("Error al eliminar la recomendación", error);
    } finally {
      setIsDeleteModalOpen(false);
      setRecomendacionParaBorrar(null);
    }
  };

  const handleViewDetails = async (id) => {
    try {
        const { data } = await getRecomendacion(id);
        setRecomendacionParaVer(data);
        setIsDetailModalOpen(true);
    } catch (error) {
        console.error("Error al obtener los detalles de la recomendación", error);
        alert("No se pudieron cargar los detalles.");
    }
  };

  const handleGenerateSuccess = async (newRecomendacionId) => {
    setIsGeneratorModalOpen(false);
    await handleViewDetails(newRecomendacionId);
    fetchRecomendaciones(); // Actualiza la lista en segundo plano
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Gestión de Recomendaciones</h1>
      <div className="flex justify-between mb-4">
        <Button color="light" onClick={handleOpenCreate}><FaPlus className="mr-2" /> Crear Recomendación Manual</Button>
        <Button color="blue" onClick={() => setIsGeneratorModalOpen(true)}><FaRobot className="mr-2" /> Generar Dieta Automática</Button>
      </div>

      <div className="bg-white shadow-md rounded my-6">
        <table className="min-w-full table-auto">
          <thead className="bg-gray-200">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Niño</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Fecha</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Motivo</th>
              <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Acciones</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {isLoading ? (
              <tr><td colSpan="4" className="text-center p-4">Cargando...</td></tr>
            ) : recomendaciones.map((rec) => (
              <tr key={rec.id}>
                <td className="px-6 py-4 whitespace-nowrap">{rec.nino_details?.nombres || 'N/A'} {rec.nino_details?.apellidos || ''}</td>
                <td className="px-6 py-4 whitespace-nowrap">{new Date(rec.fecha).toLocaleDateString()}</td>
                <td className="px-6 py-4 whitespace-nowrap">{rec.motivo}</td>
                <td className="px-6 py-4 whitespace-nowrap text-center">
                  <button onClick={() => handleViewDetails(rec.id)} className="text-blue-500 hover:text-blue-700 mr-2" title="Ver Detalles"><FaEye /></button>
                  <button onClick={() => handleOpenEdit(rec)} className="text-yellow-500 hover:text-yellow-700 mr-2" title="Editar"><FaEdit /></button>
                  <button onClick={() => handleOpenDelete(rec)} className="text-red-500 hover:text-red-700" title="Eliminar"><FaTrash /></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {isFormModalOpen && (
        <RecomendacionForm
          isOpen={isFormModalOpen}
          onClose={() => setIsFormModalOpen(false)}
          onSuccess={handleFormSuccess}
          recomendacion={selectedRecomendacion}
        />
      )}

      <GeneradorModal 
        isOpen={isGeneratorModalOpen}
        onClose={() => setIsGeneratorModalOpen(false)}
        onGenerateSuccess={handleGenerateSuccess} 
      />

      {isDetailModalOpen && recomendacionParaVer && (
        <RecomendacionDetail 
          isOpen={isDetailModalOpen}
          onClose={() => setIsDetailModalOpen(false)}
          recomendacion={recomendacionParaVer}
        />
      )}

      {isDeleteModalOpen && (
        <Modal
          isOpen={isDeleteModalOpen}
          onClose={() => setIsDeleteModalOpen(false)}
          title="Confirmar Eliminación"
        >
          <div className="p-4">
            <p>¿Estás seguro de que deseas eliminar la recomendación para <strong>{recomendacionParaBorrar?.nino_details?.nombres || 'este niño'}</strong>?</p>
            <div className="flex justify-end mt-4">
              <Button color="gray" onClick={() => setIsDeleteModalOpen(false)} className="mr-2">Cancelar</Button>
              <Button color="red" onClick={handleConfirmDelete}>Eliminar</Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};

export default RecomendacionList;