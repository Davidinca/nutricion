from django.shortcuts import render
from rest_framework.permissions import IsAuthenticated
from .token import CustomTokenObtainPairSerializer
from rest_framework import viewsets
from .models import Usuario, Nino, LogActividad,HistorialClinico, Alimento, RecomendacionDesayuno, RecomendacionCena, RecomendacionAlmuerzo, Recomendacion, ParametroReferencia
from .serializers import UsuarioSerializer, NinoSerializer, HistorialClinicoSerializer, AlimentoSerializer, RecomendacionAlmuerzoSerializer,RecomendacionCenaSerializer, RecomendacionDesayunoSerializer, RecomendacionSerializer, ParametroReferenciaSerializer
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

class HistorialClinicoViewSet(viewsets.ModelViewSet):
    queryset = HistorialClinico.objects.all().order_by('-fecha_actualizacion')
    serializer_class = HistorialClinicoSerializer
    permission_classes = [IsAuthenticated]    

class AlimentoViewSet(viewsets.ModelViewSet):
    queryset = Alimento.objects.all()
    serializer_class = AlimentoSerializer
    permission_classes = [IsAuthenticated]

class RecomendacionViewSet(viewsets.ModelViewSet):
    queryset = Recomendacion.objects.all()
    serializer_class = RecomendacionSerializer
    permission_classes = [IsAuthenticated]

class RecomendacionDesayunoViewSet(viewsets.ModelViewSet):
    queryset = RecomendacionDesayuno.objects.all()
    serializer_class = RecomendacionDesayunoSerializer
    permission_classes = [IsAuthenticated]

class RecomendacionAlmuerzoViewSet(viewsets.ModelViewSet):
    queryset = RecomendacionAlmuerzo.objects.all()
    serializer_class = RecomendacionAlmuerzoSerializer
    permission_classes = [IsAuthenticated]

class RecomendacionCenaViewSet(viewsets.ModelViewSet):
    queryset = RecomendacionCena.objects.all()
    serializer_class = RecomendacionCenaSerializer
    permission_classes = [IsAuthenticated]

class ParametroReferenciaViewSet(viewsets.ModelViewSet):
    queryset = ParametroReferencia.objects.all()
    serializer_class = ParametroReferenciaSerializer
    permission_classes = [IsAuthenticated]