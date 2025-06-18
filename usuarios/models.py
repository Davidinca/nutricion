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
    

    def tiene_permiso(self, codigo_permiso):
        # Obtener todos los permisos a través de los roles personalizados del usuario
        permisos = Permiso.objects.filter(
            roles__usuario=self,
            codigo=codigo_permiso
        ).distinct()
        return permisos.exists()


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

class LogActividad(models.Model):
    usuario = models.ForeignKey('Usuario', on_delete=models.CASCADE, related_name='logs')
    rol = models.CharField(max_length=50)
    accion = models.CharField(max_length=100)
    modulo = models.CharField(max_length=100)
    descripcion = models.TextField()
    fecha_hora = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.accion} por {self.usuario} el {self.fecha_hora}"

#Moedlo Historial

class HistorialClinico(models.Model):
    nino = models.ForeignKey(Nino, on_delete=models.CASCADE, related_name='historiales')
    peso = models.FloatField(help_text="Peso en kilogramos")
    talla = models.FloatField(help_text="Talla en metros")
    actividad_fisica = models.CharField(max_length=20, choices=[
        ('baja', 'Baja'),
        ('media', 'Media'),
        ('alta', 'Alta')
    ])
    enfermedades = models.TextField(blank=True)
    alergias = models.TextField(blank=True)
    observaciones = models.TextField(blank=True)
    activo = models.BooleanField(default=True)
    fecha_actualizacion = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"Historial de {self.nino.nombres} {self.nino.apellido_paterno} - {self.fecha_actualizacion.strftime('%Y-%m-%d')}"

#Modelo Alimento

class Alimento(models.Model):
    CATEGORIAS = [
        ('desayuno', 'Desayuno'),
        ('almuerzo', 'Almuerzo'),
        ('cena', 'Cena'),
    ]

    nombre = models.CharField(max_length=100)
    categoria = models.CharField(max_length=20, choices=CATEGORIAS)
    calorias = models.FloatField()
    proteinas = models.FloatField()
    grasas = models.FloatField()
    carbohidratos = models.FloatField()
    grupo_alimenticio = models.CharField(max_length=50)
    alergenos = models.JSONField()

    def __str__(self):
        return self.nombre


# Modelo Recomendacionesclass Recomendacion(models.Model):
class Recomendacion(models.Model):
    nino = models.ForeignKey(Nino, on_delete=models.CASCADE, related_name='recomendaciones')
    fecha = models.DateField()
    motivo = models.CharField(max_length=255)
    fuente = models.JSONField()
    estado = models.CharField(max_length=20, default='vigente')
    calorias_totales = models.FloatField(null=True, blank=True)
    proteinas_totales = models.FloatField(null=True, blank=True)
    alergenos_evitados = models.JSONField(null=True, blank=True)
    notas = models.TextField(blank=True)

    def __str__(self):
        return f"Recomendacion para {self.nino.nombres} {self.nino.apellido_paterno} - {self.fecha} ({self.estado})"


class RecomendacionDesayuno(models.Model):
    recomendacion = models.ForeignKey(Recomendacion, on_delete=models.CASCADE, related_name='desayunos')
    alimento = models.ForeignKey(Alimento, on_delete=models.CASCADE, related_name='desayunos')

    def __str__(self):
        return f"Desayuno: {self.alimento.nombre} para recomendacion {self.recomendacion.id}"


class RecomendacionAlmuerzo(models.Model):
    recomendacion = models.ForeignKey(Recomendacion, on_delete=models.CASCADE, related_name='almuerzos')
    alimento = models.ForeignKey(Alimento, on_delete=models.CASCADE, related_name='almuerzos')

    def __str__(self):
        return f"Almuerzo: {self.alimento.nombre} para recomendacion {self.recomendacion.id}"


class RecomendacionCena(models.Model):
    recomendacion = models.ForeignKey(Recomendacion, on_delete=models.CASCADE, related_name='cenas')
    alimento = models.ForeignKey(Alimento, on_delete=models.CASCADE, related_name='cenas')

    def __str__(self):
        return f"Cena: {self.alimento.nombre} para recomendacion {self.recomendacion.id}"


# Modelo Parametros

class ParametroReferencia(models.Model):
    edad_min = models.IntegerField(help_text="Edad mínima en años")
    edad_max = models.IntegerField(help_text="Edad máxima en años")
    calorias = models.IntegerField()
    proteinas = models.FloatField(help_text="Proteínas en gramos")
    hierro = models.FloatField(help_text="Hierro en miligramos")
    fuente = models.CharField(max_length=255)

    def __str__(self):
        return f"{self.edad_min}-{self.edad_max} años"



class Permiso(models.Model):
    nombre = models.CharField(max_length=100)
    descripcion = models.TextField(blank=True)
    codigo = models.CharField(max_length=50, unique=True)  # ej: "crear_recomendacion"

    def __str__(self):
        return self.nombre

class RolPersonalizado(models.Model):
    usuario = models.ForeignKey(Usuario, on_delete=models.CASCADE, related_name='roles_personalizados')
    rol = models.CharField(max_length=50)  # ej: admin, medico, nutricionista, padre
    permisos = models.ManyToManyField(Permiso, through='RolPermiso', related_name='roles')

    def __str__(self):
        return f"{self.rol} - {self.usuario.correo}"

class RolPermiso(models.Model):
    rol = models.ForeignKey(RolPersonalizado, on_delete=models.CASCADE)
    permiso = models.ForeignKey(Permiso, on_delete=models.CASCADE)

    class Meta:
        unique_together = ('rol', 'permiso')

    def __str__(self):
        return f"{self.rol} -> {self.permiso}"
