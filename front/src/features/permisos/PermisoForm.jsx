import React from 'react';

export default function PermisoForm({ formData, onFormChange }) {
  return (
    <form className="space-y-4">
      <div>
        <label htmlFor="nombre" className="block text-sm font-medium text-gray-700">Nombre del Permiso</label>
        <input
          type="text"
          name="nombre"
          id="nombre"
          value={formData.nombre || ''}
          onChange={onFormChange}
          className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
          placeholder="Ej: Ver Dashboard"
        />
      </div>
      <div>
        <label htmlFor="codigo" className="block text-sm font-medium text-gray-700">Código (Codename)</label>
        <input
          type="text"
          name="codigo"
          id="codigo"
          value={formData.codigo || ''}
          onChange={onFormChange}
          className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
          placeholder="Ej: ver_dashboard"
        />
      </div>
      <div>
        <label htmlFor="descripcion" className="block text-sm font-medium text-gray-700">Descripción</label>
        <textarea
          name="descripcion"
          id="descripcion"
          value={formData.descripcion || ''}
          onChange={onFormChange}
          rows="3"
          className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
          placeholder="Describe para qué sirve este permiso."
        ></textarea>
      </div>
    </form>
  );
}
