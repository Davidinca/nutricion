import React, { useState, useEffect, useMemo } from 'react';
import { getAlimentos, deleteAlimento } from './alimentoService';
import AlimentoModal from './AlimentoModal';
import ModalBase from '../../components/modals/ModalBase';
import { Button, Card, TextInput, Select, Pagination, Tooltip } from 'flowbite-react';
import { FaPlus, FaEdit, FaTrash, FaAppleAlt, FaFire, FaDrumstickBite, FaTags } from 'react-icons/fa';

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

export default function AlimentoList() {
  const [allAlimentos, setAllAlimentos] = useState([]);
  const [filters, setFilters] = useState({ search: '', category: '' });
  const [selectedAlimento, setSelectedAlimento] = useState(null);
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  useEffect(() => {
    fetchAlimentos();
  }, []);

  const fetchAlimentos = async () => {
    try {
      const response = await getAlimentos();
      setAllAlimentos(response.data || []);
    } catch (error) {
      console.error('Error al obtener la lista de alimentos:', error);
    }
  };

  const { filteredAlimentos, uniqueCategories, stats } = useMemo(() => {
    const categories = new Set();
    let totalCalories = 0;
    let totalProteins = 0;

    const filtered = allAlimentos.filter(alimento => {
      categories.add(alimento.categoria);
      totalCalories += parseFloat(alimento.calorias) || 0;
      totalProteins += parseFloat(alimento.proteinas) || 0;

      const searchLower = filters.search.toLowerCase();
      const matchesSearch = alimento.nombre.toLowerCase().includes(searchLower);
      const matchesCategory = filters.category ? alimento.categoria === filters.category : true;
      return matchesSearch && matchesCategory;
    });

    const avgCalories = allAlimentos.length > 0 ? (totalCalories / allAlimentos.length).toFixed(0) : 'N/A';
    const avgProteins = allAlimentos.length > 0 ? (totalProteins / allAlimentos.length).toFixed(1) : 'N/A';

    return {
      filteredAlimentos: filtered,
      uniqueCategories: [...new Set(allAlimentos.map(a => a.categoria))],
      stats: {
        total: allAlimentos.length,
        numCategories: [...categories].length,
        avgCalories,
        avgProteins
      }
    };
  }, [allAlimentos, filters]);

  const paginatedAlimentos = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredAlimentos.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredAlimentos, currentPage]);

  const handleFilterChange = (e) => {
    setCurrentPage(1);
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
  };

  const handleOpenCreate = () => { setSelectedAlimento(null); setIsFormModalOpen(true); };
  const handleOpenEdit = (alimento) => { setSelectedAlimento(alimento); setIsFormModalOpen(true); };
  const handleOpenDelete = (alimento) => { setSelectedAlimento(alimento); setIsDeleteModalOpen(true); };
  const handleSuccess = () => { setIsFormModalOpen(false); fetchAlimentos(); };

  const handleConfirmDelete = async () => {
    if (!selectedAlimento) return;
    try {
      await deleteAlimento(selectedAlimento.id);
      fetchAlimentos();
    } catch (error) {
      console.error('Error al eliminar el alimento:', error);
      alert('Ocurrió un error al eliminar.');
    } finally {
      setIsDeleteModalOpen(false);
      setSelectedAlimento(null);
    }
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6">Gestión de Alimentos</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard icon={FaAppleAlt} title="Total de Alimentos" value={stats.total} color="bg-green-500" />
        <StatCard icon={FaTags} title="Categorías" value={stats.numCategories} color="bg-blue-500" />
        <StatCard icon={FaFire} title="Calorías (Promedio)" value={stats.avgCalories} color="bg-orange-500" />
        <StatCard icon={FaDrumstickBite} title="Proteínas (Promedio)" value={`${stats.avgProteins}g`} color="bg-red-500" />
      </div>

      <div className="bg-white shadow-md rounded-lg p-4 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-end">
            <TextInput id="search" name="search" placeholder="Buscar por nombre..." value={filters.search} onChange={handleFilterChange} />
            <Select id="category" name="category" value={filters.category} onChange={handleFilterChange}>
              <option value="">Todas las Categorías</option>
              {uniqueCategories.map(cat => <option key={cat} value={cat}>{cat}</option>)} 
            </Select>
        </div>
      </div>

      <div className="flex justify-end mb-4">
        <Button color="primary" onClick={handleOpenCreate}>
          <FaPlus className="mr-2" /> Crear Alimento
        </Button>
      </div>

      <div className="bg-white shadow-md rounded my-6 overflow-x-auto">
        <table className="min-w-full table-auto">
          <thead className="bg-gray-200">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nombre</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Categoría</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Calorías</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Proteínas (g)</th>
              <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Acciones</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {paginatedAlimentos.length > 0 ? paginatedAlimentos.map((alimento) => (
              <tr key={alimento.id}>
                <td className="px-6 py-4 whitespace-nowrap font-medium text-gray-900">{alimento.nombre}</td>
                <td className="px-6 py-4 whitespace-nowrap">{alimento.categoria}</td>
                <td className="px-6 py-4 whitespace-nowrap">{alimento.calorias}</td>
                <td className="px-6 py-4 whitespace-nowrap">{alimento.proteinas}</td>
                <td className="px-6 py-4 whitespace-nowrap text-center space-x-2">
                  <Tooltip content="Editar"><Button size="xs" color="warning" pill onClick={() => handleOpenEdit(alimento)}><FaEdit /></Button></Tooltip>
                  <Tooltip content="Eliminar"><Button size="xs" color="failure" pill onClick={() => handleOpenDelete(alimento)}><FaTrash /></Button></Tooltip>
                </td>
              </tr>
            )) : (
              <tr><td colSpan="5" className="text-center p-4">No se encontraron alimentos con los filtros aplicados.</td></tr>
            )}
          </tbody>
        </table>
      </div>

      {filteredAlimentos.length > itemsPerPage && (
        <div className="flex justify-center mt-4">
          <Pagination currentPage={currentPage} totalPages={Math.ceil(filteredAlimentos.length / itemsPerPage)} onPageChange={setCurrentPage} />
        </div>
      )}

      {isFormModalOpen && <AlimentoModal isOpen={isFormModalOpen} onClose={() => setIsFormModalOpen(false)} initialData={selectedAlimento} onSuccess={handleSuccess} />}

      {isDeleteModalOpen && (
        <ModalBase isOpen={isDeleteModalOpen} onClose={() => setIsDeleteModalOpen(false)} title="Confirmar Eliminación">
          <div className="p-4">
            <p>¿Estás seguro de que deseas eliminar el alimento <strong>{selectedAlimento?.nombre}</strong>?</p>
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

