import React, { useState, useEffect, useMemo } from 'react';
import { getLogs } from './registroService';
import { getUsuarios } from '../usuarios/usuarioService'; // Asumiendo que existe un servicio para obtener usuarios
import { Card, TextInput, Select, Datepicker, Pagination, Badge } from 'flowbite-react';
import { FaCalendarAlt, FaHistory, FaUserClock, FaPlus, FaPen, FaTrash, FaSignInAlt, FaSignOutAlt, FaKey } from 'react-icons/fa';

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

const getActionStyle = (action) => {
  const styleMap = {
    'CREAR': { icon: FaPlus, color: 'success', label: 'Crear' },
    'ACTUALIZAR': { icon: FaPen, color: 'info', label: 'Actualizar' },
    'ELIMINAR': { icon: FaTrash, color: 'failure', label: 'Eliminar' },
    'LOGIN_EXITOSO': { icon: FaSignInAlt, color: 'success', label: 'Login' },
    'LOGIN_FALLIDO': { icon: FaSignInAlt, color: 'warning', label: 'Login Fallido' },
    'LOGOUT': { icon: FaSignOutAlt, color: 'dark', label: 'Logout' },
    'ASIGNAR_ROL': { icon: FaKey, color: 'purple', label: 'Asignar Rol' },
  };
  return styleMap[action] || { icon: FaHistory, color: 'gray', label: action };
};

export default function RegistroList() {
  const [allLogs, setAllLogs] = useState([]);
  const [users, setUsers] = useState([]);
  const [filters, setFilters] = useState({ search: '', userId: '', action: '', startDate: null, endDate: null });
  const [currentPage, setCurrentPage] = useState(1);
  const logsPerPage = 15;

  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        const [logsResponse, usersResponse] = await Promise.all([getLogs(), getUsuarios()]);
        setAllLogs(logsResponse.data || []);
        setUsers(usersResponse.data || []);
      } catch (error) {
        console.error('Error al obtener datos iniciales:', error);
      }
    };
    fetchInitialData();
  }, []);

  const { filteredLogs, uniqueActions } = useMemo(() => {
    const actions = new Set();
    const filtered = allLogs.filter(log => {
      actions.add(log.accion);
      const logDate = new Date(log.fecha_hora);
      const startDate = filters.startDate ? new Date(filters.startDate) : null;
      const endDate = filters.endDate ? new Date(filters.endDate) : null;

      if (startDate) startDate.setHours(0, 0, 0, 0);
      if (endDate) endDate.setHours(23, 59, 59, 999);

      return (
        (filters.search === '' || log.descripcion.toLowerCase().includes(filters.search.toLowerCase())) &&
        (filters.userId === '' || log.usuario == filters.userId) &&
        (filters.action === '' || log.accion === filters.action) &&
        (!startDate || logDate >= startDate) &&
        (!endDate || logDate <= endDate)
      );
    });
    return { filteredLogs: filtered, uniqueActions: [...actions] };
  }, [allLogs, filters]);

  const stats = useMemo(() => {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const startOfWeek = new Date(today);
    startOfWeek.setDate(today.getDate() - today.getDay());

    const logsToday = allLogs.filter(log => new Date(log.fecha_hora) >= today).length;
    const logsThisWeek = allLogs.filter(log => new Date(log.fecha_hora) >= startOfWeek).length;
    return { total: allLogs.length, today: logsToday, week: logsThisWeek };
  }, [allLogs]);

  const paginatedLogs = useMemo(() => {
    const startIndex = (currentPage - 1) * logsPerPage;
    return filteredLogs.slice(startIndex, startIndex + logsPerPage);
  }, [filteredLogs, currentPage]);

  const handleFilterChange = (e) => setFilters(prev => ({ ...prev, [e.target.name]: e.target.value }));
  const handleDateChange = (name, date) => setFilters(prev => ({ ...prev, [name]: date }));

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6">Logs de Actividad del Sistema</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <StatCard icon={FaHistory} title="Total de Registros" value={stats.total} color="bg-blue-500" />
        <StatCard icon={FaCalendarAlt} title="Registros de Hoy" value={stats.today} color="bg-green-500" />
        <StatCard icon={FaUserClock} title="Registros (Últ. 7 días)" value={stats.week} color="bg-yellow-500" />
      </div>

      <div className="bg-white shadow-md rounded-lg p-4 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 items-end">
          <TextInput name="search" placeholder="Buscar en descripción..." value={filters.search} onChange={handleFilterChange} />
          <Select name="userId" value={filters.userId} onChange={handleFilterChange}>
            <option value="">Todos los Usuarios</option>
            {users.map(u => <option key={u.id} value={u.id}>{u.correo}</option>)}
          </Select>
          <Select name="action" value={filters.action} onChange={handleFilterChange}>
            <option value="">Todas las Acciones</option>
            {uniqueActions.map(a => <option key={a} value={a}>{getActionStyle(a).label}</option>)}
          </Select>
          <div className="grid grid-cols-2 gap-2">
            <Datepicker name="startDate" placeholder="Fecha de inicio" onSelectedDateChanged={date => handleDateChange('startDate', date)} />
            <Datepicker name="endDate" placeholder="Fecha de fin" onSelectedDateChanged={date => handleDateChange('endDate', date)} />
          </div>
        </div>
      </div>

      <div className="bg-white shadow-md rounded my-6 overflow-x-auto">
        <table className="min-w-full table-auto">
          <thead className="bg-gray-200">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Fecha y Hora</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Usuario</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Acción</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Módulo</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Descripción</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {paginatedLogs.length > 0 ? paginatedLogs.map((log) => {
              const actionStyle = getActionStyle(log.accion);
              return (
                <tr key={log.id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{new Date(log.fecha_hora).toLocaleString()}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{log.usuario_details?.correo || 'N/A'}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <Badge color={actionStyle.color} icon={actionStyle.icon}>{actionStyle.label}</Badge>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{log.modulo}</td>
                  <td className="px-6 py-4 whitespace-normal text-sm text-gray-500">{log.descripcion}</td>
                </tr>
              );
            }) : (
              <tr><td colSpan="5" className="text-center p-4">No hay registros que coincidan con los filtros.</td></tr>
            )}
          </tbody>
        </table>
      </div>

      {filteredLogs.length > logsPerPage && (
        <div className="flex justify-center mt-4">
          <Pagination
            currentPage={currentPage}
            totalPages={Math.ceil(filteredLogs.length / logsPerPage)}
            onPageChange={setCurrentPage}
          />
        </div>
      )}
    </div>
  );
}
