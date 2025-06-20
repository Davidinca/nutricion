import React, { useState, useEffect, useMemo } from 'react';
import { getHistoriales, deleteHistorial } from './historialService';
import { getNinos } from '../ninos/ninoService';
import HistorialModal from './HistorialModal';
import ModalBase from '../../components/modals/ModalBase';
import { Button, Card, Select, Datepicker, Pagination, Badge, Tooltip } from 'flowbite-react';
import { FaPlus, FaEdit, FaTrash, FaFileMedical, FaWeight, FaCalendarCheck } from 'react-icons/fa';

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

const calculateIMC = (peso, talla) => {
  if (!peso || !talla || talla === 0) return null;
  return (peso / (talla * talla)).toFixed(2);
};

const getIMCStyle = (imc) => {
  if (imc === null) return { color: 'gray', label: 'N/A' };
  if (imc < 18.5) return { color: 'warning', label: 'Bajo Peso' };
  if (imc >= 18.5 && imc <= 24.9) return { color: 'success', label: 'Normal' };
  if (imc >= 25 && imc <= 29.9) return { color: 'warning', label: 'Sobrepeso' };
  if (imc >= 30) return { color: 'failure', label: 'Obesidad' };
  return { color: 'gray', label: 'N/A' };
};

export default function HistorialList() {
  const [allHistoriales, setAllHistoriales] = useState([]);
  const [ninos, setNinos] = useState([]);
  const [selectedHistorial, setSelectedHistorial] = useState(null);
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [filters, setFilters] = useState({ ninoId: '', startDate: null, endDate: null, diagnostico: '' });
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        const [historialesRes, ninosRes] = await Promise.all([getHistoriales(), getNinos()]);
        setAllHistoriales(historialesRes.data || []);
        setNinos(ninosRes.data || []);
      } catch (error) {
        console.error('Error al obtener datos iniciales:', error);
      }
    };
    fetchInitialData();
  }, []);

  const { filteredHistoriales, uniqueDiagnosticos, stats } = useMemo(() => {
    const diagnosticos = new Set();
    let totalIMC = 0;
    let countWithIMC = 0;
    let lastUpdate = null;

    const filtered = allHistoriales.filter(h => {
      if (h.diagnostico_nutricional) diagnosticos.add(h.diagnostico_nutricional);
      const imc = calculateIMC(h.peso, h.talla);
      if (imc !== null) {
        totalIMC += parseFloat(imc);
        countWithIMC++;
      }
      const logDate = new Date(h.fecha_actualizacion);
      if (!lastUpdate || logDate > lastUpdate) lastUpdate = logDate;

      const startDate = filters.startDate ? new Date(filters.startDate) : null;
      const endDate = filters.endDate ? new Date(filters.endDate) : null;
      if (startDate) startDate.setHours(0, 0, 0, 0);
      if (endDate) endDate.setHours(23, 59, 59, 999);

      return (
        (filters.ninoId === '' || h.nino == filters.ninoId) &&
        (filters.diagnostico === '' || h.diagnostico_nutricional === filters.diagnostico) &&
        (!startDate || logDate >= startDate) &&
        (!endDate || logDate <= endDate)
      );
    });

    const avgIMC = countWithIMC > 0 ? (totalIMC / countWithIMC).toFixed(2) : 'N/A';

    return {
      filteredHistoriales: filtered,
      uniqueDiagnosticos: [...diagnosticos],
      stats: {
        total: allHistoriales.length,
        avgIMC,
        lastUpdate: lastUpdate ? lastUpdate.toLocaleDateString() : 'N/A'
      }
    };
  }, [allHistoriales, filters]);

  const paginatedHistoriales = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredHistoriales.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredHistoriales, currentPage]);

  const handleFilterChange = (e) => setFilters(prev => ({ ...prev, [e.target.name]: e.target.value }));
  const handleDateChange = (name, date) => setFilters(prev => ({ ...prev, [name]: date }));
  const handleOpenCreate = () => { setSelectedHistorial(null); setIsFormModalOpen(true); };
  const handleOpenEdit = (historial) => { setSelectedHistorial(historial); setIsFormModalOpen(true); };
  const handleOpenDelete = (historial) => { setSelectedHistorial(historial); setIsDeleteModalOpen(true); };
  const handleSuccess = () => { setIsFormModalOpen(false); fetchInitialData(); };

  const fetchInitialData = async () => {
    try {
      const [historialesRes, ninosRes] = await Promise.all([getHistoriales(), getNinos()]);
      setAllHistoriales(historialesRes.data || []);
      setNinos(ninosRes.data || []);
    } catch (error) {
      console.error('Error al obtener datos iniciales:', error);
    }
  };

  const handleConfirmDelete = async () => {
    if (!selectedHistorial) return;
    try {
      await deleteHistorial(selectedHistorial.id);
      fetchInitialData();
    } catch (error) {
      console.error('Error al eliminar el historial:', error);
      alert('Ocurrió un error al eliminar.');
    } finally {
      setIsDeleteModalOpen(false);
      setSelectedHistorial(null);
    }
  };

  const formatNinoName = (historial) => {
    const nino = ninos.find(n => n.id === historial.nino);
    return nino ? `${nino.nombres} ${nino.apellido_paterno}` : `ID: ${historial.nino}`;
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6">Gestión de Historiales Clínicos</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <StatCard icon={FaFileMedical} title="Total de Registros" value={stats.total} color="bg-blue-500" />
        <StatCard icon={FaWeight} title="Promedio de IMC" value={stats.avgIMC} color="bg-green-500" />
        <StatCard icon={FaCalendarCheck} title="Última Actualización" value={stats.lastUpdate} color="bg-yellow-500" />
      </div>

      <div className="bg-white shadow-md rounded-lg p-4 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 items-end">
          <Select name="ninoId" value={filters.ninoId} onChange={handleFilterChange}>
            <option value="">Todos los Niños</option>
            {ninos.map(n => <option key={n.id} value={n.id}>{`${n.nombres} ${n.apellido_paterno}`}</option>)}
          </Select>
          <Select name="diagnostico" value={filters.diagnostico} onChange={handleFilterChange}>
            <option value="">Todos los Diagnósticos</option>
            {uniqueDiagnosticos.map(d => <option key={d} value={d}>{d}</option>)}
          </Select>
          <Datepicker name="startDate" placeholder="Fecha de inicio" onSelectedDateChanged={date => handleDateChange('startDate', date)} />
          <Datepicker name="endDate" placeholder="Fecha de fin" onSelectedDateChanged={date => handleDateChange('endDate', date)} />
        </div>
      </div>

      <div className="flex justify-end mb-4">
        <Button color="primary" onClick={handleOpenCreate}>
          <FaPlus className="mr-2" /> Crear Historial
        </Button>
      </div>

      <div className="bg-white shadow-md rounded my-6 overflow-x-auto">
        <table className="min-w-full table-auto">
          <thead className="bg-gray-200">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Niño</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Fecha</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">IMC</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Diagnóstico Nutricional</th>
              <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Acciones</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {paginatedHistoriales.length > 0 ? paginatedHistoriales.map((historial) => {
              const imc = calculateIMC(historial.peso, historial.talla);
              const imcStyle = getIMCStyle(imc);
              return (
                <tr key={historial.id}>
                  <td className="px-6 py-4 whitespace-nowrap">{formatNinoName(historial)}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{new Date(historial.fecha_actualizacion).toLocaleDateString()}</td>
                  <td className="px-6 py-4 whitespace-nowrap"><Badge color={imcStyle.color}>{imc} ({imcStyle.label})</Badge></td>
                  <td className="px-6 py-4 whitespace-nowrap">{historial.diagnostico_nutricional || 'N/A'}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-center space-x-2">
                    <Tooltip content="Editar"><Button size="xs" color="warning" pill onClick={() => handleOpenEdit(historial)}><FaEdit /></Button></Tooltip>
                    <Tooltip content="Eliminar"><Button size="xs" color="failure" pill onClick={() => handleOpenDelete(historial)}><FaTrash /></Button></Tooltip>
                  </td>
                </tr>
              );
            }) : (
              <tr><td colSpan="5" className="text-center p-4">No hay historiales que coincidan con los filtros.</td></tr>
            )}
          </tbody>
        </table>
      </div>

      {filteredHistoriales.length > itemsPerPage && (
        <div className="flex justify-center mt-4">
          <Pagination currentPage={currentPage} totalPages={Math.ceil(filteredHistoriales.length / itemsPerPage)} onPageChange={setCurrentPage} />
        </div>
      )}

      {isFormModalOpen && <HistorialModal isOpen={isFormModalOpen} onClose={() => setIsFormModalOpen(false)} initialData={selectedHistorial} onSuccess={handleSuccess} />}

      {isDeleteModalOpen && (
        <ModalBase isOpen={isDeleteModalOpen} onClose={() => setIsDeleteModalOpen(false)} title="Confirmar Eliminación">
          <div className="p-4">
            <p>¿Estás seguro de que deseas eliminar el historial de <strong>{selectedHistorial ? formatNinoName(selectedHistorial) : ''}</strong> del {selectedHistorial ? new Date(selectedHistorial.fecha_actualizacion).toLocaleDateString() : ''}?</p>
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
