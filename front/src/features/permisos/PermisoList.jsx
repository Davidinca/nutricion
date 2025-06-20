import React, { useState, useEffect, useMemo } from 'react';
import { useAuth } from '../../context/AuthContext';
import * as permisoApi from './permisoService';
import PermisoModal from './PermisoModal';
import ModalBase from '../../components/modals/ModalBase';
import { Button, Card, TextInput } from 'flowbite-react';
import { FaPlus, FaEdit, FaTrash, FaKey } from 'react-icons/fa';

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

export default function PermisoList() {
  const { hasPermission } = useAuth();
  const [allPermisos, setAllPermisos] = useState([]);
  const [filter, setFilter] = useState('');
  const [selectedPermiso, setSelectedPermiso] = useState(null);
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  const fetchPermisos = async () => {
    try {
      const response = await permisoApi.getPermisos();
      setAllPermisos(response.data || []);
    } catch (error) {
      console.error('Error al obtener los permisos:', error);
    }
  };

  useEffect(() => {
    fetchPermisos();
  }, []);

  const filteredPermisos = useMemo(() => {
    const filterLower = filter.toLowerCase();
    return allPermisos.filter(p => 
      p.nombre.toLowerCase().includes(filterLower) || 
      p.codigo.toLowerCase().includes(filterLower)
    );
  }, [allPermisos, filter]);

  const handleOpenCreate = () => {
    setSelectedPermiso(null);
    setIsFormModalOpen(true);
  };

  const handleOpenEdit = (permiso) => {
    setSelectedPermiso(permiso);
    setIsFormModalOpen(true);
  };

  const handleOpenDelete = (permiso) => {
    setSelectedPermiso(permiso);
    setIsDeleteModalOpen(true);
  };

  const handleSuccess = () => {
    setIsFormModalOpen(false);
    fetchPermisos();
  };

  const handleConfirmDelete = async () => {
    if (!selectedPermiso) return;
    try {
      await permisoApi.deletePermiso(selectedPermiso.id);
      fetchPermisos();
    } catch (error) {
      console.error('Error al eliminar el permiso:', error);
      alert('Ocurrió un error al eliminar.');
    } finally {
      setIsDeleteModalOpen(false);
      setSelectedPermiso(null);
    }
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6">Gestión de Permisos</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <StatCard icon={FaKey} title="Total de Permisos" value={allPermisos.length} color="bg-yellow-500" />
      </div>

      <div className="bg-white shadow-md rounded-lg p-4 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
          <div className="md:col-span-3">
            <label htmlFor="search" className="block text-sm font-medium text-gray-700 mb-1">Buscar Permiso</label>
            <TextInput id="search" name="search" placeholder="Nombre o código del permiso..." value={filter} onChange={(e) => setFilter(e.target.value)} />
          </div>
        </div>
      </div>

      <div className="flex justify-end mb-4">
        {hasPermission('crear_permiso') && (
          <Button color="blue" onClick={handleOpenCreate}>
            <FaPlus className="mr-2" /> Añadir Permiso
          </Button>
        )}
      </div>

      <div className="bg-white shadow-md rounded my-6 overflow-x-auto">
        <table className="min-w-full table-auto">
          <thead className="bg-gray-200">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nombre</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Código</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Descripción</th>
              <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Acciones</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredPermisos.length > 0 ? filteredPermisos.map((permiso) => (
              <tr key={permiso.id}>
                <td className="px-6 py-4 whitespace-nowrap">{permiso.nombre}</td>
                <td className="px-6 py-4 whitespace-nowrap">{permiso.codigo}</td>
                <td className="px-6 py-4 whitespace-nowrap max-w-sm truncate">{permiso.descripcion}</td>
                <td className="px-6 py-4 whitespace-nowrap text-center">
                  {hasPermission('editar_permiso') && (
                    <button onClick={() => handleOpenEdit(permiso)} className="text-yellow-500 hover:text-yellow-700 mr-2" title="Editar"><FaEdit /></button>
                  )}
                  {hasPermission('eliminar_permiso') && (
                    <button onClick={() => handleOpenDelete(permiso)} className="text-red-500 hover:text-red-700" title="Eliminar"><FaTrash /></button>
                  )}
                </td>
              </tr>
            )) : (
              <tr><td colSpan="4" className="text-center p-4">No se encontraron permisos con los filtros aplicados.</td></tr>
            )}
          </tbody>
        </table>
      </div>

      {isFormModalOpen && (
        <PermisoModal
          isOpen={isFormModalOpen}
          onClose={() => setIsFormModalOpen(false)}
          initialData={selectedPermiso}
          onSuccess={handleSuccess}
        />
      )}

      {isDeleteModalOpen && selectedPermiso && (
        <ModalBase isOpen={isDeleteModalOpen} onClose={() => setIsDeleteModalOpen(false)} title="Confirmar Eliminación">
          <div className="p-4">
            <p>¿Estás seguro de que quieres eliminar el permiso <strong>{selectedPermiso.nombre}</strong>?</p>
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