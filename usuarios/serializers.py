from rest_framework import serializers
from .models import Usuario, Nino, LogActividad, HistorialClinico, Alimento, RecomendacionAlmuerzo, RecomendacionCena, RecomendacionDesayuno, Recomendacion, ParametroReferencia, Permiso, RolPermiso, RolPersonalizado

class UsuarioSerializer(serializers.ModelSerializer):
    # Hacemos que la contraseña y el rol sean opcionales para las actualizaciones
    password = serializers.CharField(write_only=True, required=False, allow_blank=True)
    rol = serializers.CharField(write_only=True, required=False, allow_blank=True)

    class Meta:
        model = Usuario
        fields = [
            'id', 'correo', 'password',
            'nombres', 'apellido_paterno', 'apellido_materno',
            'ci', 'direccion', 'telefono', 'ciudad',
            'is_active', 'fecha_creacion', 'fecha_actualizacion',
            'rol',
        ]
        read_only_fields = ['id', 'fecha_creacion', 'fecha_actualizacion']

    def create(self, validated_data):
        password = validated_data.pop('password')
        rol_nombre = validated_data.pop('rol', None)

        usuario = Usuario(**validated_data)
        usuario.set_password(password)
        usuario.save()

        if rol_nombre:
            RolPersonalizado.objects.create(usuario=usuario, rol=rol_nombre)

        return usuario

    def update(self, instance, validated_data):
        # Si se proporciona una nueva contraseña, la hasheamos antes de guardarla.
        password = validated_data.pop('password', None)
        if password:
            instance.set_password(password)

        # Si se proporciona un nuevo rol, lo actualizamos.
        rol_nombre = validated_data.pop('rol', None)
        if rol_nombre:
            # Asumimos que un usuario tiene un solo RolPersonalizado.
            # Si existe, lo actualizamos. Si no, lo creamos.
            RolPersonalizado.objects.update_or_create(
                usuario=instance,
                defaults={'rol': rol_nombre}
            )

        # Actualizamos el resto de los campos normalmente.
        instance = super().update(instance, validated_data)
        return instance


class NinoSerializer(serializers.ModelSerializer):
    apellidos = serializers.SerializerMethodField()
    alergias = serializers.SerializerMethodField()
    enfermedades = serializers.SerializerMethodField()

    class Meta:
        model = Nino
        fields = [
            'id', 'usuario', 'nombres', 'apellido_paterno', 'apellido_materno', 'apellidos',
            'ci', 'direccion', 'ciudad', 'fecha_nacimiento', 'activo',
            'alergias', 'enfermedades'
        ]

    def get_apellidos(self, obj):
        parts = [obj.apellido_paterno, obj.apellido_materno]
        return " ".join(filter(None, parts))

    def get_historial_reciente(self, obj):
        return obj.historiales.order_by('-fecha_actualizacion').first()

    def get_alergias(self, obj):
        historial = self.get_historial_reciente(obj)
        return historial.alergias if historial else 'No registradas'

    def get_enfermedades(self, obj):
        historial = self.get_historial_reciente(obj)
        return historial.enfermedades if historial else 'No registradas'


# usuarios/serializers.py

class LogActividadSerializer(serializers.ModelSerializer):
    class Meta:
        model = LogActividad
        fields = '__all__'

# usuarios/serializers.py


class HistorialClinicoSerializer(serializers.ModelSerializer):
    class Meta:
        model = HistorialClinico
        fields = '__all__'

class AlimentoSerializer(serializers.ModelSerializer):
    class Meta:
        model = Alimento
        fields = '__all__'

class RecomendacionDesayunoSerializer(serializers.ModelSerializer):
    alimento = AlimentoSerializer(read_only=True)
    alimento_id = serializers.PrimaryKeyRelatedField(queryset=Alimento.objects.all(), source='alimento', write_only=True)

    class Meta:
        model = RecomendacionDesayuno
        fields = ['id', 'recomendacion', 'alimento', 'alimento_id']

class RecomendacionAlmuerzoSerializer(serializers.ModelSerializer):
    alimento = AlimentoSerializer(read_only=True)
    alimento_id = serializers.PrimaryKeyRelatedField(queryset=Alimento.objects.all(), source='alimento', write_only=True)

    class Meta:
        model = RecomendacionAlmuerzo
        fields = ['id', 'recomendacion', 'alimento', 'alimento_id']

class RecomendacionCenaSerializer(serializers.ModelSerializer):
    alimento = AlimentoSerializer(read_only=True)
    alimento_id = serializers.PrimaryKeyRelatedField(queryset=Alimento.objects.all(), source='alimento', write_only=True)

    class Meta:
        model = RecomendacionCena
        fields = ['id', 'recomendacion', 'alimento', 'alimento_id']

class RecomendacionSerializer(serializers.ModelSerializer):
    nino_details = NinoSerializer(source='nino', read_only=True)
    desayunos = RecomendacionDesayunoSerializer(many=True, required=False)
    almuerzos = RecomendacionAlmuerzoSerializer(many=True, required=False)
    cenas = RecomendacionCenaSerializer(many=True, required=False)

    class Meta:
        model = Recomendacion
        fields = [
            'id', 'nino', 'nino_details', 'fecha', 'motivo', 'fuente', 'estado',
            'calorias_totales', 'proteinas_totales', 'alergenos_evitados', 'notas',
            'desayunos', 'almuerzos', 'cenas'
        ]

    def create(self, validated_data):
        desayunos_data = validated_data.pop('desayunos', [])
        almuerzos_data = validated_data.pop('almuerzos', [])
        cenas_data = validated_data.pop('cenas', [])

        recomendacion = Recomendacion.objects.create(**validated_data)

        alimentos_totales = []
        alergenos_set = set()

        for desayuno_data in desayunos_data:
            item = RecomendacionDesayuno.objects.create(recomendacion=recomendacion, **desayuno_data)
            alimentos_totales.append(item.alimento)
        for almuerzo_data in almuerzos_data:
            item = RecomendacionAlmuerzo.objects.create(recomendacion=recomendacion, **almuerzo_data)
            alimentos_totales.append(item.alimento)
        for cena_data in cenas_data:
            item = RecomendacionCena.objects.create(recomendacion=recomendacion, **cena_data)
            alimentos_totales.append(item.alimento)

        calorias = sum(a.calorias for a in alimentos_totales)
        proteinas = sum(a.proteinas for a in alimentos_totales)

        for a in alimentos_totales:
            alergenos_set.update(a.alergenos or [])

        recomendacion.calorias_totales = calorias
        recomendacion.proteinas_totales = proteinas
        recomendacion.alergenos_evitados = ', '.join(sorted(alergenos_set))
        recomendacion.save()

        return recomendacion

    
class ParametroReferenciaSerializer(serializers.ModelSerializer):
    class Meta:
        model = ParametroReferencia
        fields = '__all__'


class PermisoSerializer(serializers.ModelSerializer):
    class Meta:
        model = Permiso
        fields = ['id', 'nombre', 'descripcion', 'codigo']


class RolPermisoSerializer(serializers.ModelSerializer):
    permiso = PermisoSerializer(read_only=True)
    permiso_id = serializers.PrimaryKeyRelatedField(
        queryset=Permiso.objects.all(), source='permiso', write_only=True
    )

    class Meta:
        model = RolPermiso
        fields = ['id', 'rol', 'permiso', 'permiso_id']


class RolPersonalizadoSerializer(serializers.ModelSerializer):
    permisos = PermisoSerializer(many=True, read_only=True)
    permiso_ids = serializers.PrimaryKeyRelatedField(
        queryset=Permiso.objects.all(), many=True, write_only=True, source='permisos'
    )

    class Meta:
        model = RolPersonalizado
        fields = ['id', 'usuario', 'rol', 'permisos', 'permiso_ids']

        def create(self, validated_data):
            # Usamos 'permisos', que es el nombre que el serializador usa internamente
            # gracias a source='permisos'. Hacemos pop con un valor por defecto ([])
            # para evitar errores si el campo no se envía.
            permisos_data = validated_data.pop('permisos', [])
            rol = RolPersonalizado.objects.create(**validated_data)
            rol.permisos.set(permisos_data)
            return rol

    def update(self, instance, validated_data):
            # Hacemos lo mismo para la actualización.
            permisos_data = validated_data.pop('permisos', None)
            
            # Actualizamos los campos del modelo principal
            instance.rol = validated_data.get('rol', instance.rol)
            # El usuario no debería cambiar, pero lo mantenemos por si acaso.
            instance.usuario = validated_data.get('usuario', instance.usuario)
            instance.save()

            # Si se proporcionaron permisos, los actualizamos.
            if permisos_data is not None:
                instance.permisos.set(permisos_data)
                
            return instance