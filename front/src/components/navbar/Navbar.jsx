import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

export default function Navbar() {
  const { hasPermission } = useAuth();

  const activeStyle = {
    color: '#60a5fa',
    fontWeight: 'bold',
  };

  // Componente para un elemento de navegación, adaptable a dropdowns
  const NavItem = ({ to, permission, children, isDropdownItem = false }) => {
    if (!hasPermission(permission)) {
      return null;
    }
    
    const classes = isDropdownItem
      ? 'block px-4 py-2 text-sm text-gray-200 hover:bg-gray-700 hover:text-white w-full text-left'
      : 'text-white hover:text-gray-300';

    return (
      <NavLink
        to={to}
        className={classes}
        style={({ isActive }) => (isActive && !isDropdownItem ? activeStyle : undefined)}
      >
        {children}
      </NavLink>
    );
  };

  // Componente para el menú desplegable
  const Dropdown = ({ title, children }) => {
    const validChildren = React.Children.toArray(children).filter(child => child !== null);
    if (validChildren.length === 0) {
      return null;
    }

    return (
      <div className="relative group">
        <button className="text-white hover:text-gray-300 focus:outline-none flex items-center">
          {title}
          <svg className="w-2.5 h-2.5 ms-2.5" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 10 6">
            <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="m1 1 4 4 4-4"/>
          </svg>
        </button>
        <div className="absolute hidden group-hover:block bg-gray-800 rounded-md shadow-lg py-1 z-10 min-w-[200px]">
          {validChildren}
        </div>
      </div>
    );
  };

  return (
    <nav className="bg-gray-900 border-gray-700">
      <div className="max-w-screen-xl flex flex-wrap items-center justify-between mx-auto p-4">
        <NavLink to="/" className="flex items-center space-x-3 rtl:space-x-reverse">
          <img src="https://flowbite.com/docs/images/logo.svg" className="h-8" alt="Logo" />
          <span className="self-center text-2xl font-semibold whitespace-nowrap text-white">NutriApp</span>
        </NavLink>

        <div className="hidden md:flex items-center space-x-6">
          <NavLink to="/" className="text-white hover:text-gray-300" style={({ isActive }) => (isActive ? activeStyle : undefined)}>
            Dashboard
          </NavLink>

          <NavItem to="/usuarios" permission="ver_usuario">Usuarios</NavItem>

          <Dropdown title="Gestión Nutricional">
            <NavItem to="/ninos" permission="ver_nino" isDropdownItem>Niños</NavItem>
            <NavItem to="/historiales" permission="ver_historialclinico" isDropdownItem>Historial Clínico</NavItem>
            <NavItem to="/recomendaciones" permission="ver_recomendacion" isDropdownItem>Recomendaciones</NavItem>
          </Dropdown>

          <Dropdown title="Administración">
            <NavItem to="/roles" permission="ver_rolpersonalizado" isDropdownItem>Roles</NavItem>
            <NavItem to="/permisos" permission="ver_permiso" isDropdownItem>Permisos</NavItem>
            <NavItem to="/registros" permission="ver_logactividad" isDropdownItem>Logs de Actividad</NavItem>
          </Dropdown>
          
          <Dropdown title="Datos Maestros">
            <NavItem to="/alimentos" permission="ver_alimento" isDropdownItem>Alimentos</NavItem>
            <NavItem to="/parametros-referenciales" permission="ver_parametroreferencia" isDropdownItem>Parámetros Referenciales</NavItem>
          </Dropdown>

        </div>
      </div>
    </nav>
  );
}
