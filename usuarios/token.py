from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from .models import Permiso

class CustomTokenObtainPairSerializer(TokenObtainPairSerializer):
    def validate(self, attrs):
        # Llama al método original para obtener la respuesta base (tokens)
        data = super().validate(attrs)

        # self.user es el objeto de usuario autenticado en este punto
        roles = self.user.roles_personalizados.all()
        
        # Extraer los nombres de los roles en una lista
        role_names = list(roles.values_list('rol', flat=True).distinct())
        
        # Obtener todos los permisos asociados a esos roles
        permisos_codigos = list(Permiso.objects.filter(roles__in=roles).values_list('codigo', flat=True).distinct())

        # Añadir los datos del usuario, sus roles y permisos a la respuesta
        data['user'] = {
            'id': self.user.id,
            'correo': self.user.correo,
            'nombres': self.user.nombres,
            'is_superuser': self.user.is_superuser,
            'roles': role_names,
            'permisos': permisos_codigos
        }

        return data
