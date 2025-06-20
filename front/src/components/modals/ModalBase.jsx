import React from 'react';

// ModalBase ahora es un componente "tonto" que solo provee el marco.
export default function ModalBase({ isOpen, onClose, title, children }) {
  if (!isOpen) {
    return null;
  }

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-50 z-40 flex justify-center items-center"
      onClick={onClose}
    >
      <div 
        className="bg-white rounded-lg shadow-xl z-50 w-full max-w-md mx-auto"
        onClick={e => e.stopPropagation()}
      >
        {/* Encabezado del modal */}
        <div className="flex justify-between items-center p-4 border-b">
          <h3 className="text-lg font-semibold">{title}</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
          </button>
        </div>

        {/* El contenido (children) ahora debe incluir el cuerpo Y los botones */}
        <div className="p-6">
          {children}
        </div>
      </div>
    </div>
  );
}