import React from 'react';

const ACTIVIDAD_FISICA = [
  { value: 'baja', label: 'Baja' },
  { value: 'media', label: 'Media' },
  { value: 'alta', label: 'Alta' },
];

export default function HistorialForm({ formData, onChange, ninos }) {
  return (
    <form className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700">Niño</label>
        <select name="nino" value={formData.nino || ''} onChange={onChange} className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500" disabled={!!formData.id}>
          <option value="" disabled>Seleccione un niño</option>
          {ninos.map(nino => (
            <option key={nino.id} value={nino.id}>{`${nino.nombres} ${nino.apellido_paterno}`}</option>
          ))}
        </select>
        {!!formData.id && <p className="text-xs text-gray-500">El niño no puede ser modificado en un historial existente.</p>}
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">Peso (kg)</label>
          <input type="number" name="peso" value={formData.peso || ''} onChange={onChange} className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Talla (m)</label>
          <input type="number" name="talla" value={formData.talla || ''} onChange={onChange} className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Actividad Física</label>
          <select name="actividad_fisica" value={formData.actividad_fisica || ''} onChange={onChange} className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500">
            <option value="" disabled>Seleccione un nivel</option>
            {ACTIVIDAD_FISICA.map(act => (
              <option key={act.value} value={act.value}>{act.label}</option>
            ))}
          </select>
        </div>
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700">Enfermedades</label>
        <textarea name="enfermedades" value={formData.enfermedades || ''} onChange={onChange} rows="3" className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"></textarea>
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700">Alergias</label>
        <textarea name="alergias" value={formData.alergias || ''} onChange={onChange} rows="3" className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"></textarea>
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700">Observaciones</label>
        <textarea name="observaciones" value={formData.observaciones || ''} onChange={onChange} rows="3" className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"></textarea>
      </div>
    </form>
  );
}
