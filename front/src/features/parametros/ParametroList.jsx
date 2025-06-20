import React, { useState, useEffect, useMemo } from 'react';
import { getParametros, deleteParametro } from './parametroService';
import ParametroModal from './ParametroModal';
import ModalBase from '../../components/modals/ModalBase';
import { Button, Card, TextInput } from 'flowbite-react';
import { FaPlus, FaEdit, FaTrash, FaBook } from 'react-icons/fa';

const StatCard = ({ icon, title, value, color }) => (
  <Card className="flex-1 min-w-[200px]">
    <div className={`flex items-center justify-between`}>
      <div className={`rounded-full p-3 ${color}`}>
        {React.createElement(icon, { className: 'h-6 w-6 text-white' })}
      </div>
      <div>
        <h5 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white text-right">{value}</h5>
        <p className="font-normal text-gray-700 dark:text-gray-400 text-right">{title}</p>
      </div>
    </div>
  </Card>
);

export default function ParametroList() {
  const [allParametros, setAllParametros] = useState([]);
  const [filter, setFilter] = useState('');
  const [selectedParametro, setSelectedParametro] = useState(null);
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  const fetchParametros = async () => {
    try {
      const response = await getParametros();
      setAllParametros(response.data || []);
    } catch (error) {
      console.error('Error al obtener los parámetros:', error);
    }
  };

  useEffect(() => {
    fetchParametros();
  }, []);

  const filteredParametros = useMemo(() => {
    return allParametros.filter(p => 
      p.fuente.toLowerCase().includes(filter.toLowerCase())
    );
  }, [allParametros, filter]);

  const handleOpenCreate = () => {
    setSelectedParametro(null);
    setIsFormModalOpen(true);
  };

  const handleOpenEdit = (parametro) => {
    setSelectedParametro(parametro);
    setIsFormModalOpen(true);
  };

  const handleOpenDelete = (parametro) => {
    setSelectedParametro(parametro);
    setIsDeleteModalOpen(true);
  };

  const handleSuccess = () => {
    setIsFormModalOpen(false);
    fetchParametros();
  };

  const handleConfirmDelete = async () => {
    if (!selectedParametro) return;
    try {
      await deleteParametro(selectedParametro.id);
      fetchParametros();
    } catch (error) {
      console.error('Error al eliminar el parámetro:', error);
      alert('Ocurrió un error al eliminar.');
    } finally {
      setIsDeleteModalOpen(false);
      setSelectedParametro(null);
    }
  };

  const formatRangoEdad = (parametro) => {
    return `${parametro.edad_min} - ${parametro.edad_max} años`;
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6">Parámetros de Referencia</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <StatCard icon={FaBook} title="Total de Parámetros" value={allParametros.length} color="bg-cyan-500" />
      </div>

      <div className="bg-white shadow-md rounded-lg p-4 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
            <div className="md:col-span-2">
                <label htmlFor="search" className="block text-sm font-medium text-gray-700 mb-1">Buscar por Fuente</label>
                <TextInput id="search" name="search" placeholder="OMS, FAO, etc..." value={filter} onChange={(e) => setFilter(e.target.value)} />
            </div>
        </div>
      </div>

      <div className="flex justify-end mb-4">
        <Button color="blue" onClick={handleOpenCreate}>
          <FaPlus className="mr-2" /> Añadir Parámetro
        </Button>
      </div>

      <div className="bg-white shadow-md rounded my-6 overflow-x-auto">
        <table className="min-w-full table-auto">
          <thead className="bg-gray-200">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Rango de Edad</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Calorías</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Proteínas (g)</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Hierro (mg)</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Fuente</th>
              <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Acciones</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredParametros.length > 0 ? filteredParametros.map((parametro) => (
              <tr key={parametro.id}>
                <td className="px-6 py-4 whitespace-nowrap">{formatRangoEdad(parametro)}</td>
                <td className="px-6 py-4 whitespace-nowrap">{parametro.calorias}</td>
                <td className="px-6 py-4 whitespace-nowrap">{parametro.proteinas}</td>
                <td className="px-6 py-4 whitespace-nowrap">{parametro.hierro}</td>
                <td className="px-6 py-4 whitespace-nowrap">{parametro.fuente}</td>
                <td className="px-6 py-4 whitespace-nowrap text-center">
                  <button onClick={() => handleOpenEdit(parametro)} className="text-yellow-500 hover:text-yellow-700 mr-2" title="Editar"><FaEdit /></button>
                  <button onClick={() => handleOpenDelete(parametro)} className="text-red-500 hover:text-red-700" title="Eliminar"><FaTrash /></button>
                </td>
              </tr>
            )) : (
              <tr><td colSpan="6" className="text-center p-4">No se encontraron parámetros con los filtros aplicados.</td></tr>
            )}
          </tbody>
        </table>
      </div>

      {isFormModalOpen && (
        <ParametroModal
          isOpen={isFormModalOpen}
          onClose={() => setIsFormModalOpen(false)}
          initialData={selectedParametro}
          onSuccess={handleSuccess}
        />
      )}

      {isDeleteModalOpen && selectedParametro && (
        <ModalBase isOpen={isDeleteModalOpen} onClose={() => setIsDeleteModalOpen(false)} title="Confirmar Eliminación">
          <div className="p-4">
            <p>¿Estás seguro de que quieres eliminar el parámetro para <strong>{formatRangoEdad(selectedParametro)}</strong>?</p>
            <div className="flex justify-end mt-4">
              <Button color="gray" onClick={() => setIsDeleteModalOpen(false)} className="mr-2">Cancelar</Button>
              <Button color="red" onClick={handleConfirmDelete}>Eliminar</Button>
            </div>
          </div>
        </ModalBase>
      )}
    </div>
  );
}
