from django.db import models
from django.contrib.auth.models import AbstractBaseUser, BaseUserManager, PermissionsMixin

# Gestor personalizado de usuarios
class UsuarioManager(BaseUserManager):
    def create_user(self, correo, password=None, **extra_fields):
        if not correo:
            raise ValueError('El correo es obligatorio')
        correo = self.normalize_email(correo)
        user = self.model(correo=correo, **extra_fields)
        if password:
            user.set_password(password)
        else:
            user.set_unusable_password()
        user.save(using=self._db)
        return user

# Modelo de usuario personalizado
class Usuario(AbstractBaseUser, PermissionsMixin):
    correo = models.EmailField(unique=True)
    nombres = models.CharField(max_length=100)
    apellido_paterno = models.CharField(max_length=100)
    apellido_materno = models.CharField(max_length=100)
    ci = models.CharField(max_length=20, unique=True)
    direccion = models.CharField(max_length=255, blank=True)
    telefono = models.CharField(max_length=20, blank=True)
    ciudad = models.CharField(max_length=100, blank=True)
    is_active = models.BooleanField(default=True)
    is_staff = models.BooleanField(default=False)
    fecha_creacion = models.DateTimeField(auto_now_add=True)
    fecha_actualizacion = models.DateTimeField(auto_now=True)

    groups = models.ManyToManyField(
        'auth.Group',
        related_name='usuario_set',
        related_query_name='usuario',
        blank=True,
        verbose_name='groups',
        help_text='The groups this user belongs to. A user will get all permissions granted to each of their groups.',
    )

    user_permissions = models.ManyToManyField(
        'auth.Permission',
        related_name='usuario_set',
        related_query_name='usuario',
        blank=True,
        verbose_name='user permissions',
        help_text='Specific permissions for this user.',
    )

    USERNAME_FIELD = 'correo'
    REQUIRED_FIELDS = ['nombres', 'apellido_paterno', 'apellido_materno', 'ci']

    objects = UsuarioManager()

    def __str__(self):
        return f"{self.nombres} {self.apellido_paterno} ({self.correo})"


# Modelo de niño relacionado a un usuario
class Nino(models.Model):
    usuario = models.ForeignKey(Usuario, on_delete=models.CASCADE, related_name='ninos')
    nombres = models.CharField(max_length=100)
    apellido_paterno = models.CharField(max_length=100)
    apellido_materno = models.CharField(max_length=100)
    ci = models.CharField(max_length=20, unique=True)
    direccion = models.CharField(max_length=255, blank=True)
    ciudad = models.CharField(max_length=100, blank=True)
    fecha_nacimiento = models.DateField()
    activo = models.BooleanField(default=True)  # Para "eliminar" lógicamente

    def __str__(self):
        return f"{self.nombres} {self.apellido_paterno}"

# Modelo Logs# usuarios/models.py

from django.db import models

class LogActividad(models.Model):
    usuario = models.ForeignKey('Usuario', on_delete=models.CASCADE, related_name='logs')
    rol = models.CharField(max_length=50)
    accion = models.CharField(max_length=100)
    modulo = models.CharField(max_length=100)
    descripcion = models.TextField()
    fecha_hora = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.accion} por {self.usuario} el {self.fecha_hora}"
