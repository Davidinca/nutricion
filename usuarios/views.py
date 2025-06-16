from django.shortcuts import render
from rest_framework.permissions import IsAuthenticated
from .token import CustomTokenObtainPairSerializer
from rest_framework import viewsets
from .models import Usuario, Nino, LogActividad
from .serializers import UsuarioSerializer, NinoSerializer
from rest_framework_simplejwt.views import TokenObtainPairView
from .token import CustomTokenObtainPairSerializer
from .serializers import LogActividadSerializer



class UsuarioViewSet(viewsets.ModelViewSet):
    queryset = Usuario.objects.all()
    serializer_class = UsuarioSerializer
    permission_classes = [IsAuthenticated]

class NinoViewSet(viewsets.ModelViewSet):
    queryset = Nino.objects.all()
    serializer_class = NinoSerializer
    permission_classes = [IsAuthenticated]

class CustomTokenObtainPairView(TokenObtainPairView):
    serializer_class = CustomTokenObtainPairSerializer


class LogActividadViewSet(viewsets.ModelViewSet):
    queryset = LogActividad.objects.all().order_by('-fecha_hora')
    serializer_class = LogActividadSerializer
    permission_classes = [IsAuthenticated]