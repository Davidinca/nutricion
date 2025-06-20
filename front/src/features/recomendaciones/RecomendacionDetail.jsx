import React from 'react';

const MealCard = ({ title, items }) => (
  <div className="bg-gray-50 p-4 rounded-lg shadow-inner">
    <h3 className="text-lg font-semibold text-gray-800 mb-2">{title}</h3>
    {items && items.length > 0 ? (
      <ul className="space-y-2">
        {items.map(item => (
          <li key={item.id} className="p-2 bg-white rounded-md shadow-sm">
            <p className="font-medium text-gray-900">{item.alimento.nombre}</p>
            <p className="text-sm text-gray-600">
              {item.alimento.calorias} kcal, {item.alimento.proteinas}g de proteína
            </p>
          </li>
        ))}
      </ul>
    ) : (
      <p className="text-sm text-gray-500">No hay recomendaciones para esta comida.</p>
    )}
  </div>
);

// Helper component to recursively render data in a two-column row format
const RenderObject = ({ data }) => {
  // Render simple values directly
  if (typeof data !== 'object' || data === null) {
    return <span className="text-gray-600">{String(data)}</span>;
  }

  // Render arrays as a bulleted list
  if (Array.isArray(data)) {
    if (data.length === 0) {
      return <span className="text-gray-500 italic">Lista vacía</span>;
    }
    return (
      <div className="mt-2">
        {data.map((item, index) => (
          <div key={index} className="mb-2">
            <RenderObject data={item} />
          </div>
        ))}
      </div>
    );
  }

  // Render objects as a list of key-value pairs
  return (
    <div className="mt-2">
      {Object.entries(data).map(([key, value]) => (
        <div key={key} className="mb-2">
          <h6 className="font-semibold text-gray-700 mb-1">{key.replace(/_/g, ' ')}:</h6>
          <div className="text-gray-600">
            <RenderObject data={value} />
          </div>
        </div>
      ))}
    </div>
  );
};

export default function RecomendacionDetail({ recomendacion }) {
  if (!recomendacion) return <p>Cargando detalles...</p>;

  const { nino_details, fecha, motivo, estado, calorias_totales, proteinas_totales, desayunos, almuerzos, cenas, fuente } = recomendacion;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Detalles de la Recomendación</h2>
        <p className="text-md text-gray-600">
          Para: <span className="font-semibold">{nino_details?.nombres || 'N/A'} {nino_details?.apellidos || ''}</span>
        </p>
      </div>

      {/* Resumen */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
        <div className="bg-blue-100 p-3 rounded-lg"><p className="font-bold text-blue-800">{new Date(fecha).toLocaleDateString()}</p><p className="text-sm text-blue-600">Fecha</p></div>
        <div className="bg-yellow-100 p-3 rounded-lg"><p className="font-bold text-yellow-800">{estado}</p><p className="text-sm text-yellow-600">Estado</p></div>
        <div className="bg-green-100 p-3 rounded-lg"><p className="font-bold text-green-800">{calorias_totales?.toFixed(0) ?? 'N/A'}</p><p className="text-sm text-green-600">Calorías</p></div>
        <div className="bg-purple-100 p-3 rounded-lg"><p className="font-bold text-purple-800">{proteinas_totales?.toFixed(1) ?? 'N/A'}</p><p className="text-sm text-purple-600">Proteínas (g)</p></div>
      </div>
      
      <p className="text-sm text-gray-700 bg-gray-100 p-3 rounded-lg">
        <span className="font-semibold">Motivo:</span> {motivo}
      </p>

      {/* Información de Salud del Niño */}
      <div className="bg-red-50 p-4 rounded-lg shadow-inner">
        <h3 className="text-lg font-semibold text-red-800 mb-2">Información de Salud Relevante</h3>
        <div className="space-y-2 text-sm">
          <div>
            <p className="font-semibold text-gray-700">Alergias Conocidas:</p>
            <p className="text-gray-600">{nino_details?.alergias || 'No se registraron alergias.'}</p>
          </div>
          <div>
            <p className="font-semibold text-gray-700">Enfermedades Preexistentes:</p>
            <p className="text-gray-600">{nino_details?.enfermedades || 'No se registraron enfermedades.'}</p>
          </div>
        </div>
      </div>

      {/* Parámetros Utilizados */}
      {fuente && typeof fuente === 'object' && (
        <div className="bg-gray-50 p-4 rounded-lg shadow-inner">
          <h3 className="text-lg font-semibold text-gray-800 mb-2">Parámetros de Referencia Utilizados</h3>
          <div className="mt-2">
            <RenderObject data={fuente} />
          </div>
        </div>
      )}

      {/* Plan de Comidas */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <MealCard title="🍳 Desayuno" items={desayunos} />
        <MealCard title="🍲 Almuerzo" items={almuerzos} />
        <MealCard title="🥗 Cena" items={cenas} />
      </div>
    </div>
  );
}