import React from 'react';
import { Link } from 'react-router-dom';
import { FaUsers, FaUserTag, FaKey, FaClipboardList } from 'react-icons/fa';

const AdminCard = ({ to, title, description, icon }) => (
  <Link to={to} className="block p-6 bg-white border border-gray-200 rounded-lg shadow-md hover:bg-gray-100 dark:bg-gray-800 dark:border-gray-700 dark:hover:bg-gray-700 transition-transform transform hover:scale-105">
    <div className="flex items-center mb-3">
      <div className="text-3xl text-gray-500">{icon}</div>
      <h5 className="ml-3 text-2xl font-bold tracking-tight text-gray-900 dark:text-white">{title}</h5>
    </div>
    <p className="font-normal text-gray-700 dark:text-gray-400">{description}</p>
  </Link>
);

export default function AdminPanel() {
  const adminSections = [
    {
      to: '/usuarios',
      title: 'Usuarios',
      description: 'Gestionar cuentas de usuario, roles y datos personales.',
      icon: <FaUsers />
    },
    {
      to: '/roles',
      title: 'Roles',
      description: 'Crear y editar roles, y asignarles permisos específicos.',
      icon: <FaUserTag />
    },
    {
      to: '/permisos',
      title: 'Permisos',
      description: 'Consultar todos los permisos disponibles en el sistema.',
      icon: <FaKey />
    },
    {
      to: '/registros',
      title: 'Registros',
      description: 'Ver el historial de actividades y eventos del sistema.',
      icon: <FaClipboardList />
    }
  ];

  return (
    <div className="p-4 md:p-8">
      <h1 className="text-3xl font-bold mb-2 text-gray-800 dark:text-white">Panel de Administración</h1>
      <p className="text-lg text-gray-600 dark:text-gray-400 mb-8">Control central para la gestión de la aplicación.</p>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6">
        {adminSections.map(section => (
          <AdminCard key={section.to} {...section} />
        ))}
      </div>
    </div>
  );
}
