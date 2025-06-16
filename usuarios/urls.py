from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import UsuarioViewSet, NinoViewSet, LogActividadViewSet

router = DefaultRouter()
router.register(r'usuarios', UsuarioViewSet)
router.register(r'ninos', NinoViewSet)
router.register(r'logs', LogActividadViewSet)

urlpatterns = [
    path('usuarios/', include(router.urls)),
]
