from rest_framework import serializers
from .models import Usuario, Nino, LogActividad

class UsuarioSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True)

    class Meta:
        model = Usuario
        fields = [
            'id', 'correo', 'password',
            'nombres', 'apellido_paterno', 'apellido_materno',
            'ci', 'direccion', 'telefono', 'ciudad',
            'is_active', 'fecha_creacion', 'fecha_actualizacion'
        ]
        read_only_fields = ['id', 'fecha_creacion', 'fecha_actualizacion']

    def create(self, validated_data):
        password = validated_data.pop('password')
        usuario = Usuario(**validated_data)
        usuario.set_password(password)
        usuario.save()
        return usuario


class NinoSerializer(serializers.ModelSerializer):
    class Meta:
        model = Nino
        fields = [
            'id', 'usuario', 'nombres', 'apellido_paterno', 'apellido_materno',
            'ci', 'direccion', 'ciudad', 'fecha_nacimiento', 'activo'
        ]


# usuarios/serializers.py

class LogActividadSerializer(serializers.ModelSerializer):
    class Meta:
        model = LogActividad
        fields = '__all__'
