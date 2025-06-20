import React, { useState, useEffect, useMemo } from 'react';
import { useAuth } from '../../context/AuthContext';
import { getRoles, deleteRol } from './rolService';
import RolModal from './RolModal';
import ModalBase from '../../components/modals/ModalBase';
import { Button, Card, TextInput, Pagination, Tooltip } from 'flowbite-react';
import { FaPlus, FaEdit, FaTrash, FaUserShield, FaKey } from 'react-icons/fa';

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

export default function RolList() {
  const { hasPermission } = useAuth();
  const [allRoles, setAllRoles] = useState([]);
  const [filter, setFilter] = useState('');
  const [selectedRol, setSelectedRol] = useState(null);
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  useEffect(() => {
    fetchRoles();
  }, []);

  const fetchRoles = async () => {
    try {
      const response = await getRoles();
      setAllRoles(response.data || []);
    } catch (error) {
      console.error('Error al obtener los roles:', error);
    }
  };

  const { filteredRoles, stats } = useMemo(() => {
    const filtered = allRoles.filter(rol =>
      rol.rol.toLowerCase().includes(filter.toLowerCase())
    );

    const totalPermissions = allRoles.reduce((acc, rol) => acc + (rol.permisos?.length || 0), 0);
    const avgPermissions = allRoles.length > 0 ? (totalPermissions / allRoles.length).toFixed(1) : 'N/A';

    return {
      filteredRoles: filtered,
      stats: {
        total: allRoles.length,
        avgPermissions
      }
    };
  }, [allRoles, filter]);

  const paginatedRoles = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredRoles.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredRoles, currentPage]);

  const handleFilterChange = (e) => {
    setCurrentPage(1);
    setFilter(e.target.value);
  };

  const handleOpenCreate = () => { setSelectedRol(null); setIsFormModalOpen(true); };
  const handleOpenEdit = (rol) => { setSelectedRol(rol); setIsFormModalOpen(true); };
  const handleOpenDelete = (rol) => { setSelectedRol(rol); setIsDeleteModalOpen(true); };
  const handleSuccess = () => { setIsFormModalOpen(false); fetchRoles(); };

  const handleConfirmDelete = async () => {
    if (!selectedRol) return;
    try {
      await deleteRol(selectedRol.id);
      fetchRoles();
    } catch (error) {
      console.error('Error al eliminar el rol:', error);
      alert('Ocurrió un error al eliminar.');
    } finally {
      setIsDeleteModalOpen(false);
      setSelectedRol(null);
    }
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6">Gestión de Roles</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <StatCard icon={FaUserShield} title="Total de Roles" value={stats.total} color="bg-purple-500" />
        <StatCard icon={FaKey} title="Permisos (Promedio)" value={stats.avgPermissions} color="bg-cyan-500" />
      </div>

      <div className="bg-white shadow-md rounded-lg p-4 mb-6">
          <TextInput id="search" name="search" placeholder="Buscar por nombre de rol..." value={filter} onChange={handleFilterChange} />
      </div>

      <div className="flex justify-end mb-4">
        {hasPermission('crear_rolpersonalizado') && (
          <Button color="primary" onClick={handleOpenCreate}>
            <FaPlus className="mr-2" /> Añadir Rol
          </Button>
        )}
      </div>

      <div className="bg-white shadow-md rounded my-6 overflow-x-auto">
        <table className="min-w-full table-auto">
          <thead className="bg-gray-200">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nombre del Rol</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"># de Permisos</th>
              <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Acciones</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {paginatedRoles.length > 0 ? paginatedRoles.map((rol) => (
              <tr key={rol.id}>
                <td className="px-6 py-4 whitespace-nowrap font-medium text-gray-900">{rol.rol}</td>
                <td className="px-6 py-4 whitespace-nowrap">{rol.permisos?.length || 0}</td>
                <td className="px-6 py-4 whitespace-nowrap text-center space-x-2">
                  {hasPermission('editar_rolpersonalizado') && (
                    <Tooltip content="Editar"><Button size="xs" color="warning" pill onClick={() => handleOpenEdit(rol)}><FaEdit /></Button></Tooltip>
                  )}
                  {hasPermission('eliminar_rolpersonalizado') && (
                    <Tooltip content="Eliminar"><Button size="xs" color="failure" pill onClick={() => handleOpenDelete(rol)}><FaTrash /></Button></Tooltip>
                  )}
                </td>
              </tr>
            )) : (
              <tr><td colSpan="3" className="text-center p-4">No se encontraron roles con los filtros aplicados.</td></tr>
            )}
          </tbody>
        </table>
      </div>

      {filteredRoles.length > itemsPerPage && (
        <div className="flex justify-center mt-4">
          <Pagination currentPage={currentPage} totalPages={Math.ceil(filteredRoles.length / itemsPerPage)} onPageChange={setCurrentPage} />
        </div>
      )}

      {isFormModalOpen && <RolModal isOpen={isFormModalOpen} onClose={() => setIsFormModalOpen(false)} initialData={selectedRol} onSuccess={handleSuccess} />}

      {isDeleteModalOpen && selectedRol && (
        <ModalBase isOpen={isDeleteModalOpen} onClose={() => setIsDeleteModalOpen(false)} title="Confirmar Eliminación">
          <div className="p-4">
            <p>¿Estás seguro de que quieres eliminar el rol <strong>{selectedRol.rol}</strong>?</p>
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

