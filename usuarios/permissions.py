from rest_framework.permissions import BasePermission

class CustomDjangoModelPermission(BasePermission):
    """
    Permiso que valida contra los permisos almacenados en DB,
    basándose en el método HTTP y el modelo que se está accediendo.
    """

    def has_permission(self, request, view):
        # Obtener el usuario
        usuario = request.user
        
        # Obtener el modelo desde el viewset (view.queryset.model)
        modelo = getattr(view.queryset.model, '_meta', None)
        if modelo is None:
            return False
        
        # Mapear métodos HTTP a permisos
        method_perm_map = {
            'GET': 'ver',
            'POST': 'crear',
            'PUT': 'editar',
            'PATCH': 'editar',
            'DELETE': 'eliminar',
        }
        
        accion = method_perm_map.get(request.method)
        if not accion:
            return False
        
        # Nombre del modelo en minúsculas
        modelo_nombre = modelo.model_name
        
        # Construir código permiso esperado, ejemplo: 'ver_usuario'
        codigo_permiso = f"{accion}_{modelo_nombre}"
        
        # Verificar si el usuario tiene el permiso con ese código
        return usuario.tiene_permiso(codigo_permiso)
