from django.db.models.signals import post_save
from django.dispatch import receiver
from usuarios.models import (
    Nino, HistorialClinico, Alimento,
    Recomendacion, RecomendacionDesayuno, RecomendacionAlmuerzo, RecomendacionCena,
    ParametroReferencia, Permiso, RolPersonalizado, RolPermiso,
    LogActividad, Usuario
)

# Función para obtener el usuario sistema cuando se necesite
def get_usuario_sistema():
    return Usuario.objects.filter(correo="sistema@tusitio.com").first()

def obtener_rol(usuario):
    if usuario and usuario.roles_personalizados.exists():
        return usuario.roles_personalizados.first().rol
    return "sin_rol"

# Nino
@receiver(post_save, sender=Nino)
def log_nino(sender, instance, created, **kwargs):
    usuario = instance.usuario
    rol = obtener_rol(usuario)
    accion = "crear" if created else "editar"
    descripcion = f"{accion.capitalize()} niño {instance.nombres} {instance.apellido_paterno}"
    LogActividad.objects.create(
        usuario=usuario,
        rol=rol,
        accion=accion,
        modulo="nino",
        descripcion=descripcion
    )

# HistorialClinico
@receiver(post_save, sender=HistorialClinico)
def log_historial(sender, instance, created, **kwargs):
    usuario = instance.nino.usuario
    rol = obtener_rol(usuario)
    accion = "crear" if created else "editar"
    descripcion = f"{accion.capitalize()} historial clínico de {instance.nino.nombres} {instance.nino.apellido_paterno}"
    LogActividad.objects.create(
        usuario=usuario,
        rol=rol,
        accion=accion,
        modulo="historial_clinico",
        descripcion=descripcion
    )

# Alimento
@receiver(post_save, sender=Alimento)
def log_alimento(sender, instance, created, **kwargs):
    usuario = get_usuario_sistema()
    if not usuario:
        return
    rol = "sistema"
    accion = "crear" if created else "editar"
    descripcion = f"{accion.capitalize()} alimento {instance.nombre}"
    LogActividad.objects.create(
        usuario=usuario,
        rol=rol,
        accion=accion,
        modulo="alimento",
        descripcion=descripcion
    )

# Recomendacion
@receiver(post_save, sender=Recomendacion)
def log_recomendacion(sender, instance, created, **kwargs):
    usuario = instance.nino.usuario
    rol = obtener_rol(usuario)
    accion = "crear" if created else "editar"
    descripcion = f"{accion.capitalize()} recomendación para {instance.nino.nombres} {instance.nino.apellido_paterno}"
    LogActividad.objects.create(
        usuario=usuario,
        rol=rol,
        accion=accion,
        modulo="recomendacion",
        descripcion=descripcion
    )

# RecomendacionDesayuno
@receiver(post_save, sender=RecomendacionDesayuno)
def log_recomendacion_desayuno(sender, instance, created, **kwargs):
    usuario = instance.recomendacion.nino.usuario
    rol = obtener_rol(usuario)
    accion = "crear" if created else "editar"
    descripcion = f"{accion.capitalize()} desayuno {instance.alimento.nombre} para recomendación {instance.recomendacion.id}"
    LogActividad.objects.create(
        usuario=usuario,
        rol=rol,
        accion=accion,
        modulo="recomendacion_desayuno",
        descripcion=descripcion
    )

# RecomendacionAlmuerzo
@receiver(post_save, sender=RecomendacionAlmuerzo)
def log_recomendacion_almuerzo(sender, instance, created, **kwargs):
    usuario = instance.recomendacion.nino.usuario
    rol = obtener_rol(usuario)
    accion = "crear" if created else "editar"
    descripcion = f"{accion.capitalize()} almuerzo {instance.alimento.nombre} para recomendación {instance.recomendacion.id}"
    LogActividad.objects.create(
        usuario=usuario,
        rol=rol,
        accion=accion,
        modulo="recomendacion_almuerzo",
        descripcion=descripcion
    )

# RecomendacionCena
@receiver(post_save, sender=RecomendacionCena)
def log_recomendacion_cena(sender, instance, created, **kwargs):
    usuario = instance.recomendacion.nino.usuario
    rol = obtener_rol(usuario)
    accion = "crear" if created else "editar"
    descripcion = f"{accion.capitalize()} cena {instance.alimento.nombre} para recomendación {instance.recomendacion.id}"
    LogActividad.objects.create(
        usuario=usuario,
        rol=rol,
        accion=accion,
        modulo="recomendacion_cena",
        descripcion=descripcion
    )

# ParametroReferencia
@receiver(post_save, sender=ParametroReferencia)
def log_parametro_referencia(sender, instance, created, **kwargs):
    usuario = get_usuario_sistema()
    if not usuario:
        print("No hay usuario sistema")
        return
    rol = "sistema"
    accion = "crear" if created else "editar"
    descripcion = f"{accion.capitalize()} parámetro referencia {instance}"
    try:
        LogActividad.objects.create(
            usuario=usuario,
            rol=rol,
            accion=accion,
            modulo="parametro_referencia",
            descripcion=descripcion
        )
        print("LogActividad creado correctamente")
    except Exception as e:
        print(f"Error al crear LogActividad: {e}")

# Permiso
@receiver(post_save, sender=Permiso)
def log_permiso(sender, instance, created, **kwargs):
    usuario = get_usuario_sistema()
    if not usuario:
        return
    rol = "sistema"
    accion = "crear" if created else "editar"
    descripcion = f"{accion.capitalize()} permiso {instance.nombre}"
    LogActividad.objects.create(
        usuario=usuario,
        rol=rol,
        accion=accion,
        modulo="permiso",
        descripcion=descripcion
    )

# RolPersonalizado
@receiver(post_save, sender=RolPersonalizado)
def log_rol_personalizado(sender, instance, created, **kwargs):
    usuario = instance.usuario
    rol = obtener_rol(usuario)
    accion = "crear" if created else "editar"
    descripcion = f"{accion.capitalize()} rol personalizado {instance.rol} para usuario {usuario}"
    LogActividad.objects.create(
        usuario=usuario,
        rol=rol,
        accion=accion,
        modulo="rol_personalizado",
        descripcion=descripcion
    )

# RolPermiso
@receiver(post_save, sender=RolPermiso)
def log_rol_permiso(sender, instance, created, **kwargs):
    usuario = instance.rol.usuario
    rol = obtener_rol(usuario)
    accion = "crear" if created else "editar"
    descripcion = f"{accion.capitalize()} permiso {instance.permiso.nombre} asignado al rol {instance.rol.rol}"
    LogActividad.objects.create(
        usuario=usuario,
        rol=rol,
        accion=accion,
        modulo="rol_permiso",
        descripcion=descripcion
    )
