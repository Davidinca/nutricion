from django.contrib import admin
from django.urls import path, include
from rest_framework_simplejwt.views import TokenRefreshView
from usuarios.views import CustomTokenObtainPairView  # Importamos nuestra vista personalizada

urlpatterns = [
    # ... tus otras rutas ...
    # Apuntamos la ruta del token a nuestra vista personalizada
    path('api/token/', CustomTokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('api/token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('admin/', admin.site.urls),
    path('api/', include('usuarios.urls')),
]
