# utils.py o helpers.py dentro de tu app (usuarios por ejemplo)
from usuarios.models import LogActividad

def registrar_log(usuario, rol, accion, modulo, descripcion):
    LogActividad.objects.create(
        usuario=usuario,
        rol=rol,
        accion=accion,
        modulo=modulo,
        descripcion=descripcion
    )
