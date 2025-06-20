import React from 'react';

const CATEGORIAS = [
  { value: 'desayuno', label: 'Desayuno' },
  { value: 'almuerzo', label: 'Almuerzo' },
  { value: 'cena', label: 'Cena' },
];

export default function AlimentoForm({ formData, onChange }) {
  return (
    <form className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">Nombre</label>
          <input type="text" name="nombre" value={formData.nombre || ''} onChange={onChange} className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Categoría</label>
          <select name="categoria" value={formData.categoria || ''} onChange={onChange} className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500">
            <option value="" disabled>Seleccione una categoría</option>
            {CATEGORIAS.map(cat => (
              <option key={cat.value} value={cat.value}>{cat.label}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Calorías</label>
          <input type="number" name="calorias" value={formData.calorias || ''} onChange={onChange} className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Proteínas (g)</label>
          <input type="number" name="proteinas" value={formData.proteinas || ''} onChange={onChange} className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Grasas (g)</label>
          <input type="number" name="grasas" value={formData.grasas || ''} onChange={onChange} className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Carbohidratos (g)</label>
          <input type="number" name="carbohidratos" value={formData.carbohidratos || ''} onChange={onChange} className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Grupo Alimenticio</label>
          <input type="text" name="grupo_alimenticio" value={formData.grupo_alimenticio || ''} onChange={onChange} className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Alérgenos</label>
          <input type="text" name="alergenos" value={formData.alergenos || ''} onChange={onChange} className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500" placeholder="Ej: gluten, lactosa, nueces" />
          <p className="text-xs text-gray-500">Separados por comas.</p>
        </div>
      </div>
    </form>
  );
}
