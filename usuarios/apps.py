from django.apps import AppConfig


class UsuariosConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'usuarios'

    def ready(self):
        print("⚡ UsuariosConfig listo, importando signals")
        import usuarios.signals