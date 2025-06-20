import React, { useEffect, useState, useMemo } from 'react';
import * as usuarioApi from './usuarioService';
import UsuarioModal from './UsuarioModal';
import ModalBase from '../../components/modals/ModalBase';
import UsuarioDetail from './UsuarioDetail';
import { Button, Card, TextInput, Select } from 'flowbite-react';
import { FaPlus, FaEdit, FaTrash, FaEye, FaUsers, FaUserCheck, FaUserSlash } from 'react-icons/fa';
import { useAuth } from '../../context/AuthContext';

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

export default function UsuarioList() {
  const { hasPermission } = useAuth();
  const [allUsers, setAllUsers] = useState([]);
  const [roles, setRoles] = useState([]);
  const [filters, setFilters] = useState({ search: '', role: '', status: '' });
  const [selectedUsuario, setSelectedUsuario] = useState(null);
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);

  const loadData = async () => {
    try {
      const [usersRes, rolesRes] = await Promise.all([
        usuarioApi.getUsuarios(),
        usuarioApi.getRoles(),
      ]);
      setAllUsers(Array.isArray(usersRes.data) ? usersRes.data : (usersRes.data.results || []));
      setRoles(rolesRes.data || []);
    } catch (error) {
      console.error('Error al cargar datos:', error);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const filteredUsers = useMemo(() => {
    return allUsers.filter(user => {
      const searchLower = filters.search.toLowerCase();
      const matchesSearch = user.nombres.toLowerCase().includes(searchLower) ||
                            user.apellido_paterno.toLowerCase().includes(searchLower) ||
                            user.correo.toLowerCase().includes(searchLower);
      
      const matchesRole = filters.role ? user.rol === parseInt(filters.role) : true;
      
      const matchesStatus = filters.status ? String(user.is_active) === filters.status : true;

      return matchesSearch && matchesRole && matchesStatus;
    });
  }, [allUsers, filters]);

  const stats = useMemo(() => ({
    total: allUsers.length,
    active: allUsers.filter(u => u.is_active).length,
    inactive: allUsers.filter(u => !u.is_active).length,
  }), [allUsers]);

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
  };

  const handleOpenCreate = () => {
    setSelectedUsuario(null);
    setIsFormModalOpen(true);
  };

  const handleOpenEdit = (usuario) => {
    setSelectedUsuario(usuario);
    setIsFormModalOpen(true);
  };

  const handleOpenDelete = (usuario) => {
    setSelectedUsuario(usuario);
    setIsDeleteModalOpen(true);
  };

  const handleOpenDetails = (usuario) => {
    setSelectedUsuario(usuario);
    setIsDetailsModalOpen(true);
  };

  const handleSuccess = () => {
    setIsFormModalOpen(false);
    loadData();
  };

  const handleConfirmDelete = async () => {
    if (!selectedUsuario) return;
    try {
      await usuarioApi.deleteUsuario(selectedUsuario.id);
      loadData();
    } catch (error) {
      console.error('Error al eliminar usuario:', error);
      alert('Ocurrió un error al eliminar.');
    } finally {
      setIsDeleteModalOpen(false);
      setSelectedUsuario(null);
    }
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6">Gestión de Usuarios</h1>

      {/* --- Tarjetas de Resumen --- */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <StatCard icon={FaUsers} title="Total de Usuarios" value={stats.total} color="bg-blue-500" />
        <StatCard icon={FaUserCheck} title="Usuarios Activos" value={stats.active} color="bg-green-500" />
        <StatCard icon={FaUserSlash} title="Usuarios Inactivos" value={stats.inactive} color="bg-red-500" />
      </div>

      {/* --- Barra de Filtros y Acciones --- */}
      <div className="bg-white shadow-md rounded-lg p-4 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
          <div className="md:col-span-2">
            <label htmlFor="search" className="block text-sm font-medium text-gray-700 mb-1">Buscar Usuario</label>
            <TextInput id="search" name="search" placeholder="Nombre, apellido o correo..." value={filters.search} onChange={handleFilterChange} />
          </div>
          <div>
            <label htmlFor="role" className="block text-sm font-medium text-gray-700 mb-1">Filtrar por Rol</label>
            <Select id="role" name="role" value={filters.role} onChange={handleFilterChange}>
              <option value="">Todos los Roles</option>
              {roles.map(rol => <option key={rol.id} value={rol.id}>{rol.rol}</option>)}
            </Select>
          </div>
          <div>
            <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-1">Filtrar por Estado</label>
            <Select id="status" name="status" value={filters.status} onChange={handleFilterChange}>
              <option value="">Todos</option>
              <option value="true">Activo</option>
              <option value="false">Inactivo</option>
            </Select>
          </div>
        </div>
      </div>

      <div className="flex justify-end mb-4">
        {hasPermission('crear_usuario') && (
          <Button color="blue" onClick={handleOpenCreate}>
            <FaPlus className="mr-2" /> Crear Usuario
          </Button>
        )}
      </div>

      {/* --- Tabla de Usuarios --- */}
      <div className="bg-white shadow-md rounded my-6 overflow-x-auto">
        <table className="min-w-full table-auto">
          <thead className="bg-gray-200">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nombres</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Correo</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Rol</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Estado</th>
              <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Acciones</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredUsers.length > 0 ? filteredUsers.map(usuario => (
              <tr key={usuario.id}>
                <td className="px-6 py-4 whitespace-nowrap">{usuario.nombres} {usuario.apellido_paterno}</td>
                <td className="px-6 py-4 whitespace-nowrap">{usuario.correo}</td>
                <td className="px-6 py-4 whitespace-nowrap">{usuario.rol_nombre || 'No asignado'}</td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${usuario.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                    {usuario.is_active ? 'Activo' : 'Inactivo'}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-center">
                  <button onClick={() => handleOpenDetails(usuario)} className="text-blue-500 hover:text-blue-700 mr-2" title="Ver Detalles"><FaEye /></button>
                  {hasPermission('editar_usuario') && (
                    <button onClick={() => handleOpenEdit(usuario)} className="text-yellow-500 hover:text-yellow-700 mr-2" title="Editar"><FaEdit /></button>
                  )}
                  {hasPermission('eliminar_usuario') && (
                    <button onClick={() => handleOpenDelete(usuario)} className="text-red-500 hover:text-red-700" title="Eliminar"><FaTrash /></button>
                  )}
                </td>
              </tr>
            )) : (
              <tr><td colSpan="5" className="text-center p-4">No se encontraron usuarios con los filtros aplicados.</td></tr>
            )}
          </tbody>
        </table>
      </div>

      {/* --- Modales --- */}
      {isFormModalOpen && (
        <UsuarioModal isOpen={isFormModalOpen} onClose={() => setIsFormModalOpen(false)} onSuccess={handleSuccess} initialData={selectedUsuario} />
      )}
      {isDetailsModalOpen && selectedUsuario && (
        <ModalBase isOpen={isDetailsModalOpen} onClose={() => setIsDetailsModalOpen(false)} title="Detalles del Usuario">
          <UsuarioDetail usuario={selectedUsuario} />
        </ModalBase>
      )}
      {isDeleteModalOpen && selectedUsuario && (
        <ModalBase isOpen={isDeleteModalOpen} onClose={() => setIsDeleteModalOpen(false)} title="Confirmar Eliminación">
          <div className="p-4">
            <p>¿Estás seguro de que deseas eliminar al usuario <strong>{selectedUsuario.nombres}</strong>?</p>
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
