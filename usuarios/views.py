from django.shortcuts import render
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from .token import CustomTokenObtainPairSerializer
from rest_framework import viewsets
from .models import Usuario, Nino, LogActividad,HistorialClinico, Alimento, RecomendacionDesayuno, RecomendacionCena, RecomendacionAlmuerzo, Recomendacion, ParametroReferencia, Permiso, RolPersonalizado,RolPermiso
from .serializers import UsuarioSerializer, NinoSerializer, HistorialClinicoSerializer, AlimentoSerializer, RecomendacionAlmuerzoSerializer,RecomendacionCenaSerializer, RecomendacionDesayunoSerializer, RecomendacionSerializer, ParametroReferenciaSerializer, PermisoSerializer, RolPermisoSerializer, RolPersonalizadoSerializer
from rest_framework_simplejwt.views import TokenObtainPairView
from .serializers import LogActividadSerializer
from django.http import JsonResponse
from .recomendador import generar_recomendacion_automatica_mejorada
from .permissions import CustomDjangoModelPermission





class UsuarioViewSet(viewsets.ModelViewSet):
    queryset = Usuario.objects.all()
    serializer_class = UsuarioSerializer
    permission_classes = [IsAuthenticated, CustomDjangoModelPermission]

class NinoViewSet(viewsets.ModelViewSet):
    queryset = Nino.objects.all()
    serializer_class = NinoSerializer
    permission_classes = [IsAuthenticated, CustomDjangoModelPermission]

class CustomTokenObtainPairView(TokenObtainPairView):
    serializer_class = CustomTokenObtainPairSerializer


class LogActividadViewSet(viewsets.ModelViewSet):
    queryset = LogActividad.objects.all().order_by('-fecha_hora')
    serializer_class = LogActividadSerializer
    permission_classes = [IsAuthenticated, CustomDjangoModelPermission]

class HistorialClinicoViewSet(viewsets.ModelViewSet):
    queryset = HistorialClinico.objects.all().order_by('-fecha_actualizacion')
    serializer_class = HistorialClinicoSerializer
    permission_classes = [IsAuthenticated, CustomDjangoModelPermission]    

class AlimentoViewSet(viewsets.ModelViewSet):
    queryset = Alimento.objects.all()
    serializer_class = AlimentoSerializer
    permission_classes = [IsAuthenticated, CustomDjangoModelPermission]

class RecomendacionViewSet(viewsets.ModelViewSet):
    queryset = Recomendacion.objects.all()
    serializer_class = RecomendacionSerializer
    permission_classes = [IsAuthenticated, CustomDjangoModelPermission]

class RecomendacionDesayunoViewSet(viewsets.ModelViewSet):
    queryset = RecomendacionDesayuno.objects.all()
    serializer_class = RecomendacionDesayunoSerializer
    permission_classes = [IsAuthenticated, CustomDjangoModelPermission]

class RecomendacionAlmuerzoViewSet(viewsets.ModelViewSet):
    queryset = RecomendacionAlmuerzo.objects.all()
    serializer_class = RecomendacionAlmuerzoSerializer
    permission_classes = [IsAuthenticated, CustomDjangoModelPermission]

class RecomendacionCenaViewSet(viewsets.ModelViewSet):
    queryset = RecomendacionCena.objects.all()
    serializer_class = RecomendacionCenaSerializer
    permission_classes = [IsAuthenticated, CustomDjangoModelPermission]

class ParametroReferenciaViewSet(viewsets.ModelViewSet):
    queryset = ParametroReferencia.objects.all()
    serializer_class = ParametroReferenciaSerializer
    permission_classes = [IsAuthenticated, CustomDjangoModelPermission]





def generar_recomendacion(request, nino_id):
    try:
        rec = generar_recomendacion_automatica_mejorada(nino_id)
        return JsonResponse({"ok": True, "recomendacion_id": rec.id})
    except Exception as e:
        return JsonResponse({"ok": False, "error": str(e)}, status=400)    
    
class PermisoViewSet(viewsets.ModelViewSet):
    queryset = Permiso.objects.all()
    serializer_class = PermisoSerializer
    permission_classes = [IsAuthenticated, CustomDjangoModelPermission]


class RolPersonalizadoViewSet(viewsets.ModelViewSet):
    queryset = RolPersonalizado.objects.all()
    serializer_class = RolPersonalizadoSerializer
    permission_classes = [IsAuthenticated, CustomDjangoModelPermission]

    def retrieve(self, request, *args, **kwargs):
        instance = self.get_object()
        serializer = self.get_serializer(instance)
        
        # Obtener todos los permisos disponibles
        all_permissions = Permiso.objects.all()
        all_permissions_serializer = PermisoSerializer(all_permissions, many=True)
        
        # Añadirlos a la respuesta
        data = serializer.data
        data['all_permissions'] = all_permissions_serializer.data
        
        return Response(data)

    def retrieve(self, request, *args, **kwargs):
        instance = self.get_object()
        serializer = self.get_serializer(instance)
        
        # Obtener todos los permisos disponibles
        all_permissions = Permiso.objects.all()
        all_permissions_serializer = PermisoSerializer(all_permissions, many=True)
        
        # Añadirlos a la respuesta
        data = serializer.data
        data['all_permissions'] = all_permissions_serializer.data
        
        return Response(data)


class RolPermisoViewSet(viewsets.ModelViewSet):
    queryset = RolPermiso.objects.all()
    serializer_class = RolPermisoSerializer
    permission_classes = [IsAuthenticated, CustomDjangoModelPermission]