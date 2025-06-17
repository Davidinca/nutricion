from rest_framework import serializers
from .models import Usuario, Nino, LogActividad, HistorialClinico, Alimento, RecomendacionAlmuerzo, RecomendacionCena, RecomendacionDesayuno, Recomendacion, ParametroReferencia

class UsuarioSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True)

    class Meta:
        model = Usuario
        fields = [
            'id', 'correo', 'password',
            'nombres', 'apellido_paterno', 'apellido_materno',
            'ci', 'direccion', 'telefono', 'ciudad',
            'is_active', 'fecha_creacion', 'fecha_actualizacion'
        ]
        read_only_fields = ['id', 'fecha_creacion', 'fecha_actualizacion']

    def create(self, validated_data):
        password = validated_data.pop('password')
        usuario = Usuario(**validated_data)
        usuario.set_password(password)
        usuario.save()
        return usuario


class NinoSerializer(serializers.ModelSerializer):
    class Meta:
        model = Nino
        fields = [
            'id', 'usuario', 'nombres', 'apellido_paterno', 'apellido_materno',
            'ci', 'direccion', 'ciudad', 'fecha_nacimiento', 'activo'
        ]


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
    desayunos = RecomendacionDesayunoSerializer(many=True, required=False)
    almuerzos = RecomendacionAlmuerzoSerializer(many=True, required=False)
    cenas = RecomendacionCenaSerializer(many=True, required=False)

    class Meta:
        model = Recomendacion
        fields = [
            'id', 'nino', 'fecha', 'motivo', 'fuente', 'estado',
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