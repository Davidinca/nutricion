import { Routes, Route } from 'react-router-dom';
import Layout from './layout/Layout';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import UsuarioList from './features/usuarios/UsuarioList';
import NinoList from './features/ninos/NinoList';
import AlimentoList from './features/alimentos/AlimentoList';
import HistorialList from './features/historiales/HistorialList';
import ParametroList from './features/parametros/ParametroList';
import RecomendacionList from './features/recomendaciones/RecomendacionList';
import RegistroList from './features/registros/RegistroList';
import PermisoList from './features/permisos/PermisoList';
import RolList from './features/roles/RolList';
import AdminPanel from './features/admin/AdminPanel';
import UsuarioForm from './features/usuarios/UsuarioForm';
import ProtectedRoute from './components/common/ProtectedRoute'; // Importamos nuestro guardián

function App() {
  return (
    <Routes>
      {/* Ruta pública para el login */}
      <Route path="/login" element={<Login />} />

      {/* Un único guardián para todas las rutas protegidas */}
      <Route element={<ProtectedRoute />}>
        {/* El Layout envuelve todas las páginas autenticadas, asegurando la Navbar */}
        <Route path="/" element={<Layout />}>
          {/* El Dashboard es la página de inicio para usuarios autenticados */}
          <Route index element={<Dashboard />} />
          
          {/* Rutas que requieren permisos específicos */}
          <Route path="usuarios" element={<UsuarioList />} />
          <Route path="usuarios/crear" element={<UsuarioForm />} />
          <Route path="usuarios/editar/:id" element={<UsuarioForm />} />
          
          <Route path="ninos" element={<NinoList />} />
          <Route path="alimentos" element={<AlimentoList />} />
          <Route path="historiales" element={<HistorialList />} />
          <Route path="recomendaciones" element={<RecomendacionList />} />
          <Route path="parametros-referenciales" element={<ParametroList />} />

          {/* Rutas de administración */}
          <Route path="registros" element={<RegistroList />} />
          <Route path="permisos" element={<PermisoList />} />
          <Route path="roles" element={<RolList />} />
          <Route path="admin" element={<AdminPanel />} />
        </Route>
      </Route>
    </Routes>
  );
}

export default App;
