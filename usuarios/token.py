from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from .models import Usuario

class CustomTokenObtainPairSerializer(TokenObtainPairSerializer):
    username_field = Usuario.USERNAME_FIELD  # Usa 'correo' automáticamente

    def validate(self, attrs):
        data = super().validate(attrs)
        data.update({
            "nombres": self.user.nombres,
            "correo": self.user.correo,
        })
        return data
