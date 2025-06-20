import React, { useState, useEffect, useMemo } from 'react';
import { getNinos, deleteNino } from './ninoService';
import NinoModal from './NinoModal';
import ModalBase from '../../components/modals/ModalBase';
import { Button, Card, TextInput, Select, Pagination, Tooltip } from 'flowbite-react';
import { FaPlus, FaEdit, FaTrash, FaEye, FaUsers, FaBirthdayCake, FaCity } from 'react-icons/fa';

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

const calculateAge = (birthDate) => {
  if (!birthDate) return null;
  const today = new Date();
  const birth = new Date(birthDate);
  let age = today.getFullYear() - birth.getFullYear();
  const monthDifference = today.getMonth() - birth.getMonth();
  if (monthDifference < 0 || (monthDifference === 0 && today.getDate() < birth.getDate())) {
    age--;
  }
  return age;
};

export default function NinoList() {
  const [allNinos, setAllNinos] = useState([]);
  const [selectedNino, setSelectedNino] = useState(null);
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [filters, setFilters] = useState({ search: '', city: '' });
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const fetchNinos = async () => {
    try {
      const response = await getNinos();
      setAllNinos(response.data || []);
    } catch (error) {
      console.error('Error al obtener la lista de niños:', error);
    }
  };

  useEffect(() => {
    fetchNinos();
  }, []);

  const { filteredNinos, uniqueCities, stats } = useMemo(() => {
    const cities = new Set();
    let totalAge = 0;
    let countWithAge = 0;

    const filtered = allNinos.filter(nino => {
      if (nino.ciudad) cities.add(nino.ciudad);
      const age = calculateAge(nino.fecha_nacimiento);
      if (age !== null) {
        totalAge += age;
        countWithAge++;
      }
      const fullName = `${nino.nombres} ${nino.apellido_paterno} ${nino.apellido_materno}`.toLowerCase();
      const search = filters.search.toLowerCase();
      return (
        (filters.city === '' || nino.ciudad === filters.city) &&
        (search === '' || fullName.includes(search) || nino.ci?.includes(search))
      );
    });

    const avgAge = countWithAge > 0 ? (totalAge / countWithAge).toFixed(1) : 'N/A';
    
    return {
      filteredNinos: filtered,
      uniqueCities: [...cities],
      stats: {
        total: allNinos.length,
        avgAge,
        citiesCount: cities.size
      }
    };
  }, [allNinos, filters]);

  const paginatedNinos = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredNinos.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredNinos, currentPage]);

  const handleFilterChange = (e) => setFilters(prev => ({ ...prev, [e.target.name]: e.target.value }));
  const handleOpenCreate = () => { setSelectedNino(null); setIsFormModalOpen(true); };
  const handleOpenEdit = (nino) => { setSelectedNino(nino); setIsFormModalOpen(true); };
  const handleOpenDelete = (nino) => { setSelectedNino(nino); setIsDeleteModalOpen(true); };
  const handleOpenDetails = (nino) => { setSelectedNino(nino); setIsDetailsModalOpen(true); };
  const handleSuccess = () => { setIsFormModalOpen(false); fetchNinos(); };

  const handleConfirmDelete = async () => {
    if (!selectedNino) return;
    try {
      await deleteNino(selectedNino.id);
      fetchNinos();
    } catch (error) {
      console.error('Error al eliminar el niño:', error);
      alert('Ocurrió un error al eliminar.');
    } finally {
      setIsDeleteModalOpen(false);
      setSelectedNino(null);
    }
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6">Gestión de Niños</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <StatCard icon={FaUsers} title="Total de Niños" value={stats.total} color="bg-blue-500" />
        <StatCard icon={FaBirthdayCake} title="Promedio de Edad" value={stats.avgAge} color="bg-green-500" />
        <StatCard icon={FaCity} title="Total de Ciudades" value={stats.citiesCount} color="bg-yellow-500" />
      </div>

      <div className="bg-white shadow-md rounded-lg p-4 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
          <TextInput name="search" placeholder="Buscar por nombre o CI..." value={filters.search} onChange={handleFilterChange} className="md:col-span-2" />
          <Select name="city" value={filters.city} onChange={handleFilterChange}>
            <option value="">Todas las Ciudades</option>
            {uniqueCities.map(c => <option key={c} value={c}>{c}</option>)}
          </Select>
        </div>
      </div>

      <div className="flex justify-end mb-4">
        <Button color="primary" onClick={handleOpenCreate}>
          <FaPlus className="mr-2" /> Añadir Niño
        </Button>
      </div>

      <div className="bg-white shadow-md rounded my-6 overflow-x-auto">
        <table className="min-w-full table-auto">
          <thead className="bg-gray-200">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nombre Completo</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">CI</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Edad</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ciudad</th>
              <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Acciones</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {paginatedNinos.length > 0 ? paginatedNinos.map((nino) => (
              <tr key={nino.id}>
                <td className="px-6 py-4 whitespace-nowrap">{`${nino.nombres} ${nino.apellido_paterno}`}</td>
                <td className="px-6 py-4 whitespace-nowrap">{nino.ci}</td>
                <td className="px-6 py-4 whitespace-nowrap">{calculateAge(nino.fecha_nacimiento)} años</td>
                <td className="px-6 py-4 whitespace-nowrap">{nino.ciudad}</td>
                <td className="px-6 py-4 whitespace-nowrap text-center space-x-2">
                  <Tooltip content="Ver Detalles"><Button size="xs" color="info" pill onClick={() => handleOpenDetails(nino)}><FaEye /></Button></Tooltip>
                  <Tooltip content="Editar"><Button size="xs" color="warning" pill onClick={() => handleOpenEdit(nino)}><FaEdit /></Button></Tooltip>
                  <Tooltip content="Eliminar"><Button size="xs" color="failure" pill onClick={() => handleOpenDelete(nino)}><FaTrash /></Button></Tooltip>
                </td>
              </tr>
            )) : (
              <tr><td colSpan="5" className="text-center p-4">No hay niños que coincidan con los filtros.</td></tr>
            )}
          </tbody>
        </table>
      </div>

      {filteredNinos.length > itemsPerPage && (
        <div className="flex justify-center mt-4">
          <Pagination currentPage={currentPage} totalPages={Math.ceil(filteredNinos.length / itemsPerPage)} onPageChange={setCurrentPage} />
        </div>
      )}

      {isFormModalOpen && <NinoModal isOpen={isFormModalOpen} onClose={() => setIsFormModalOpen(false)} initialData={selectedNino} onSuccess={handleSuccess} />}

      {isDetailsModalOpen && selectedNino && (
        <ModalBase isOpen={isDetailsModalOpen} onClose={() => setIsDetailsModalOpen(false)} title="Detalles del Niño">
          <div className="p-4 grid grid-cols-1 md:grid-cols-2 gap-4">
            <p><strong>Nombre:</strong> {`${selectedNino.nombres} ${selectedNino.apellido_paterno} ${selectedNino.apellido_materno}`}</p>
            <p><strong>CI:</strong> {selectedNino.ci}</p>
            <p><strong>Fecha de Nacimiento:</strong> {selectedNino.fecha_nacimiento} ({calculateAge(selectedNino.fecha_nacimiento)} años)</p>
            <p><strong>Dirección:</strong> {selectedNino.direccion}</p>
            <p><strong>Ciudad:</strong> {selectedNino.ciudad}</p>
            <p><strong>Usuario (ID):</strong> {selectedNino.usuario}</p>
          </div>
          <div className="flex justify-end p-4 border-t"><Button color="gray" onClick={() => setIsDetailsModalOpen(false)}>Cerrar</Button></div>
        </ModalBase>
      )}

      {isDeleteModalOpen && selectedNino && (
        <ModalBase isOpen={isDeleteModalOpen} onClose={() => setIsDeleteModalOpen(false)} title="Confirmar Eliminación">
          <div className="p-4">
            <p>¿Estás seguro de que quieres eliminar a <strong>{`${selectedNino.nombres} ${selectedNino.apellido_paterno}`}</strong>?</p>
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
