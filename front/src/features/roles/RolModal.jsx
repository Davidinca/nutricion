import React, { useState, useEffect } from 'react';
import * as apiService from '../usuarios/usuarioService';

const RolModal = ({ isOpen, onClose, onSuccess, initialData, userId }) => {
  const [formData, setFormData] = useState({});
  const [groupedPermissions, setGroupedPermissions] = useState({});
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const loadData = async () => {
      if (isOpen) {
        setIsLoading(true);
        try {
          const permissionsRes = await apiService.getPermisos();
          const permissions = permissionsRes.data || [];

          // Agrupar permisos por modelo
          const grouped = permissions.reduce((acc, permiso) => {
            const modelName = (permiso.codigo.split('_')[1] || 'general').replace('personalizado', '');
            const capitalizedModelName = modelName.charAt(0).toUpperCase() + modelName.slice(1);

            if (!acc[capitalizedModelName]) {
              acc[capitalizedModelName] = [];
            }
            acc[capitalizedModelName].push(permiso);
            return acc;
          }, {});
          setGroupedPermissions(grouped);

          if (initialData) {
            setFormData({
              id: initialData.id,
              rol: initialData.rol,
              permiso_ids: initialData.permisos?.map(p => p.id) || [],
              usuario: initialData.usuario,
            });
          } else {
            setFormData({
              rol: '',
              permiso_ids: [],
              usuario: userId,
            });
          }
        } catch (error) {
          console.error("Error al cargar datos para el modal:", error);
          alert("No se pudieron cargar los permisos.");
        } finally {
          setIsLoading(false);
        }
      }
    };
    loadData();
  }, [initialData, isOpen, userId]);

  const handleChange = (e) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handlePermissionsChange = (permissionId) => {
    setFormData(prev => {
      const newPermissionIds = prev.permiso_ids.includes(permissionId)
        ? prev.permiso_ids.filter(id => id !== permissionId)
        : [...prev.permiso_ids, permissionId];
      return { ...prev, permiso_ids: newPermissionIds };
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    if (!formData.rol) {
      alert("Por favor, ingrese el nombre del rol.");
      setIsLoading(false);
      return;
    }

    const dataToSubmit = {
      rol: formData.rol,
      permiso_ids: formData.permiso_ids,
    };

    try {
      if (formData.id) {
        dataToSubmit.usuario = formData.usuario;
        await apiService.updateRol(formData.id, dataToSubmit);
        alert('Rol actualizado con éxito');
      } else {
        if (!formData.usuario) {
          alert("Error: No se ha especificado un usuario para el nuevo rol.");
          setIsLoading(false);
          return;
        }
        dataToSubmit.usuario = formData.usuario;
        await apiService.createRol(dataToSubmit);
        alert('Rol creado con éxito');
      }
      onSuccess();
    } catch (error) {
      console.error('Error al guardar el rol:', error.response?.data || error.message);
      const errorMsg = JSON.stringify(error.response?.data) || 'Ocurrió un error.';
      alert(`Error al guardar: ${errorMsg}`);
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  const title = formData.id ? 'Editar Rol' : 'Crear Rol';

  return (
    <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000 }}>
      <div style={{ background: 'white', padding: '20px', borderRadius: '8px', width: '800px', maxHeight: '90vh', overflowY: 'auto' }}>
        <h2>{title}</h2>
        {isLoading && <p>Cargando...</p>}
        {!isLoading && (
          <form onSubmit={handleSubmit}>
            <div style={{ marginBottom: '15px' }}>
              <label htmlFor="rol">Nombre del Rol</label>
              <input
                type="text"
                id="rol"
                name="rol"
                value={formData.rol || ''}
                onChange={handleChange}
                required
                style={{ width: '100%', padding: '8px', border: '1px solid #ccc', borderRadius: '4px' }}
              />
            </div>
            
            <div style={{ marginBottom: '15px' }}>
              <label>Permisos</label>
              <div style={{ border: '1px solid #ccc', borderRadius: '4px', padding: '10px', maxHeight: '400px', overflowY: 'auto' }}>
                {Object.keys(groupedPermissions).sort().map(groupName => (
                  <div key={groupName} style={{ marginBottom: '15px' }}>
                    <h4 style={{ borderBottom: '1px solid #eee', paddingBottom: '5px', marginBottom: '10px', fontWeight: 'bold' }}>
                      Permisos de {groupName}
                    </h4>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px 20px' }}>
                      {groupedPermissions[groupName].map(permiso => (
                        <div key={permiso.id} style={{ flex: '1 1 220px', display: 'flex', alignItems: 'center' }}>
                          <input
                            type="checkbox"
                            id={`permiso-${permiso.id}`}
                            checked={formData.permiso_ids?.includes(permiso.id) || false}
                            onChange={() => handlePermissionsChange(permiso.id)}
                          />
                          <label htmlFor={`permiso-${permiso.id}`} style={{ marginLeft: '8px', cursor: 'pointer' }}>
                            {permiso.nombre}
                          </label>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '20px' }}>
              <button type="button" onClick={onClose} disabled={isLoading}>Cancelar</button>
              <button type="submit" disabled={isLoading}>
                {isLoading ? 'Guardando...' : 'Guardar'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default RolModal;