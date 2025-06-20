import React from 'react';

export default function RecomendacionForm({ formData, onChange, onMealChange, ninos, alimentos }) {
  const renderMealSection = (mealType, mealLabel) => (
    <div>
      <label className="block text-sm font-medium text-gray-700">{mealLabel}</label>
      <select
        multiple
        name={mealType}
        value={formData[mealType] || []}
        onChange={onMealChange}
        className="mt-1 block w-full h-32 px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
      >
        {alimentos.filter(a => a.categoria === mealType || a.categoria === 'general').map(alimento => (
          <option key={alimento.id} value={alimento.id}>
            {alimento.nombre}
          </option>
        ))}
      </select>
      <p className="text-xs text-gray-500">Mantén presionado Ctrl (o Cmd en Mac) para seleccionar varios.</p>
    </div>
  );

  return (
    <form className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">Niño</label>
          <select name="nino" value={formData.nino || ''} onChange={onChange} className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500" disabled={!!formData.id}>
            <option value="" disabled>Seleccione un niño</option>
            {ninos.map(nino => (
              <option key={nino.id} value={nino.id}>{`${nino.nombres} ${nino.apellido_paterno}`}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Fecha</label>
          <input type="date" name="fecha" value={formData.fecha || ''} onChange={onChange} className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500" />
        </div>
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700">Motivo</label>
        <input type="text" name="motivo" value={formData.motivo || ''} onChange={onChange} className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 border-t">
        {renderMealSection('desayuno', 'Desayuno')}
        {renderMealSection('almuerzo', 'Almuerzo')}
        {renderMealSection('cena', 'Cena')}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">Notas Adicionales</label>
        <textarea name="notas" value={formData.notas || ''} onChange={onChange} rows="3" className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"></textarea>
      </div>
    </form>
  );
}
