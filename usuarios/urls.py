from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import UsuarioViewSet, NinoViewSet, LogActividadViewSet,HistorialClinicoViewSet, AlimentoViewSet,RecomendacionViewSet,RecomendacionDesayunoViewSet,RecomendacionAlmuerzoViewSet,RecomendacionCenaViewSet, ParametroReferenciaViewSet, generar_recomendacion, PermisoViewSet, RolPermisoViewSet, RolPersonalizadoViewSet

router = DefaultRouter()
router.register(r'usuarios', UsuarioViewSet)
router.register(r'ninos', NinoViewSet)
router.register(r'logs', LogActividadViewSet)
router.register(r'historiales', HistorialClinicoViewSet)
router.register(r'alimentos', AlimentoViewSet)
router.register(r'recomendaciones', RecomendacionViewSet)
router.register(r'recomendacion-desayuno', RecomendacionDesayunoViewSet)
router.register(r'recomendacion-almuerzo', RecomendacionAlmuerzoViewSet)
router.register(r'recomendacion-cena', RecomendacionCenaViewSet)
router.register(r'parametros-referencia', ParametroReferenciaViewSet)
router.register(r'permisos', PermisoViewSet)
router.register(r'roles', RolPersonalizadoViewSet)
router.register(r'rol-permisos', RolPermisoViewSet)





urlpatterns = [
    path('usuarios/', include(router.urls)),
    path('recomendacion/<int:nino_id>/crear/', generar_recomendacion),
]
