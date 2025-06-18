from datetime import date
from django.db import transaction
from django.utils.timezone import now
from django.db.models import Q
import json
import logging
from typing import List, Dict, Tuple, Optional
from dataclasses import dataclass
from collections import defaultdict
from .models import Alimento, ParametroReferencia, HistorialClinico, Recomendacion, RecomendacionAlmuerzo, RecomendacionCena, RecomendacionDesayuno, Nino

# Configurar logging
logger = logging.getLogger(__name__)

@dataclass
class RequisitoNutricional:
    """Clase para manejar requerimientos nutricionales calculados"""
    calorias_totales: float
    proteinas_totales: float
    grasas_totales: float
    carbohidratos_totales: float
    hierro_total: float
    
    # Distribución por comidas
    desayuno_calorias: float
    almuerzo_calorias: float
    cena_calorias: float
    
    desayuno_proteinas: float
    almuerzo_proteinas: float
    cena_proteinas: float

@dataclass 
class AlimentoConPuntuacion:
    """Alimento con puntuación calculada para optimización"""
    alimento: 'Alimento'
    puntuacion_nutricional: float
    puntuacion_palatabilidad: float
    puntuacion_total: float
    porcion_sugerida: float

class CalculadoraNutricional:
    """Clase para cálculos nutricionales avanzados"""
    
    # Factores de actividad física más precisos
    FACTORES_ACTIVIDAD = {
        'baja': 1.2,
        'media': 1.5,
        'alta': 1.8
    }
    
    # Distribución mejorada de macronutrientes por comida
    DISTRIBUCION_CALORIAS = {
        'desayuno': 0.25,
        'almuerzo': 0.40,
        'cena': 0.35
    }
    
    DISTRIBUCION_PROTEINAS = {
        'desayuno': 0.20,
        'almuerzo': 0.45,
        'cena': 0.35
    }

    @staticmethod
    def calcular_tmb_pediatrica(peso: float, talla: float, edad: int, sexo: str = 'mixto') -> float:
        """
        Calcula Tasa Metabólica Basal usando ecuación de Schofield para niños
        """
        if edad < 3:
            return 59.5 * peso - 30.4  # Para < 3 años
        elif edad < 10:
            if sexo == 'masculino':
                return 22.7 * peso + 495
            elif sexo == 'femenino':
                return 22.5 * peso + 499
            else:  # mixto
                return 22.6 * peso + 497
        else:  # 10-18 años
            if sexo == 'masculino':
                return 17.5 * peso + 651
            elif sexo == 'femenino':
                return 12.2 * peso + 746
            else:  # mixto
                return 14.85 * peso + 698.5

    @classmethod
    def calcular_requerimientos(cls, nino, historial: 'HistorialClinico', parametro: 'ParametroReferencia') -> RequisitoNutricional:
        """Calcula requerimientos nutricionales personalizados"""
        
        # Calcular edad
        hoy = date.today()
        edad = hoy.year - nino.fecha_nacimiento.year - (
            (hoy.month, hoy.day) < (nino.fecha_nacimiento.month, nino.fecha_nacimiento.day)
        )
        
        # TMB base
        tmb = cls.calcular_tmb_pediatrica(historial.peso, historial.talla, edad)
        
        # Ajustar por actividad física
        factor_actividad = cls.FACTORES_ACTIVIDAD.get(historial.actividad_fisica, 1.4)
        calorias_totales = tmb * factor_actividad
        
        # Ajustar por condiciones especiales
        if 'desnutricion' in historial.enfermedades.lower():
            calorias_totales *= 1.2  # 20% extra para recuperación
        if 'diabetes' in historial.enfermedades.lower():
            calorias_totales *= 0.95  # Ligera reducción
            
        # Calcular macronutrientes
        # Proteínas: 1.2-2.0g/kg según edad y condición
        proteinas_por_kg = 1.5 if edad < 6 else 1.2
        if 'desnutricion' in historial.enfermedades.lower():
            proteinas_por_kg *= 1.3
            
        proteinas_totales = historial.peso * proteinas_por_kg
        
        # Grasas: 30-35% de calorías totales
        grasas_totales = (calorias_totales * 0.32) / 9  # 9 kcal/g
        
        # Carbohidratos: el resto
        carbohidratos_totales = (calorias_totales - (proteinas_totales * 4) - (grasas_totales * 9)) / 4
        
        # Distribución por comidas
        return RequisitoNutricional(
            calorias_totales=calorias_totales,
            proteinas_totales=proteinas_totales,
            grasas_totales=grasas_totales,
            carbohidratos_totales=carbohidratos_totales,
            hierro_total=parametro.hierro,
            
            desayuno_calorias=calorias_totales * cls.DISTRIBUCION_CALORIAS['desayuno'],
            almuerzo_calorias=calorias_totales * cls.DISTRIBUCION_CALORIAS['almuerzo'],
            cena_calorias=calorias_totales * cls.DISTRIBUCION_CALORIAS['cena'],
            
            desayuno_proteinas=proteinas_totales * cls.DISTRIBUCION_PROTEINAS['desayuno'],
            almuerzo_proteinas=proteinas_totales * cls.DISTRIBUCION_PROTEINAS['almuerzo'],
            cena_proteinas=proteinas_totales * cls.DISTRIBUCION_PROTEINAS['cena'],
        )

class ProcesadorAlergias:
    """Maneja el procesamiento y normalización de alergias"""
    
    # Mapeo de alergias comunes a términos estandarizados
    MAPEO_ALERGIAS = {
        'leche': ['lactosa', 'caseina', 'lacteo'],
        'huevo': ['clara', 'yema'],
        'trigo': ['gluten', 'harina'],
        'soja': ['soya'],
        'frutos_secos': ['nuez', 'almendra', 'avellana', 'pistacho'],
        'mariscos': ['camaron', 'langosta', 'cangrejo'],
        'pescado': ['atun', 'salmon', 'merluza'],
    }
    
    @classmethod
    def procesar_alergias(cls, texto_alergias: str) -> List[str]:
        """Convierte texto de alergias a lista estandarizada"""
        if not texto_alergias:
            return []
            
        alergias_raw = [a.strip().lower() for a in texto_alergias.split(',')]
        alergias_normalizadas = set()
        
        for alergia in alergias_raw:
            # Buscar en mapeo
            encontrada = False
            for clave, sinonimos in cls.MAPEO_ALERGIAS.items():
                if alergia in sinonimos or alergia == clave:
                    alergias_normalizadas.add(clave)
                    encontrada = True
                    break
            
            if not encontrada:
                alergias_normalizadas.add(alergia)
                
        return list(alergias_normalizadas)

class OptimizadorAlimentos:
    """Optimiza la selección de alimentos usando algoritmos avanzados"""
    
    @staticmethod
    def calcular_puntuacion_nutricional(alimento: 'Alimento', objetivo_calorias: float, objetivo_proteinas: float) -> float:
        """Calcula puntuación nutricional del alimento"""
        
        # Densidad nutricional (nutrientes por caloría)
        if alimento.calorias == 0:
            return 0
            
        densidad_proteina = alimento.proteinas / alimento.calorias
        
        # Puntuación base por densidad nutricional
        puntuacion = densidad_proteina * 100
        
        # Bonus por grupos alimenticios importantes
        grupos_importantes = ['vegetales', 'frutas', 'proteinas', 'lacteos', 'cereales_integrales']
        if alimento.grupo_alimenticio.lower() in grupos_importantes:
            puntuacion += 20
            
        # Penalización por exceso de grasas saturadas o azúcares
        if alimento.grasas > alimento.calorias * 0.4 / 9:  # >40% de calorías de grasa
            puntuacion -= 15
            
        return max(0, puntuacion)
    
    @staticmethod
    def calcular_puntuacion_palatabilidad(alimento: 'Alimento', edad: int) -> float:
        """Calcula puntuación de palatabilidad según edad"""
        
        # Alimentos generalmente aceptados por niños
        alimentos_infantiles = [
            'pollo', 'pasta', 'arroz', 'platano', 'manzana', 
            'yogur', 'queso', 'pan', 'leche'
        ]
        
        puntuacion = 50  # Base
        
        nombre_lower = alimento.nombre.lower()
        for alimento_popular in alimentos_infantiles:
            if alimento_popular in nombre_lower:
                puntuacion += 25
                break
                
        # Ajustar por edad
        if edad < 5:
            # Preferencia por texturas suaves
            if any(word in nombre_lower for word in ['pure', 'suave', 'cremoso']):
                puntuacion += 15
        elif edad > 10:
            # Mayor variedad aceptada
            puntuacion += 10
            
        return puntuacion
    
    @classmethod
    def seleccionar_alimentos_optimizados(
        cls, 
        categoria: str, 
        alimentos_disponibles: List['Alimento'],
        objetivo_calorias: float,
        objetivo_proteinas: float,
        edad: int,
        max_alimentos: int = 5
    ) -> List[AlimentoConPuntuacion]:
        """Selecciona óptimamente alimentos para una categoría"""
        
        # Calcular puntuaciones para todos los alimentos
        alimentos_puntuados = []
        
        for alimento in alimentos_disponibles:
            punt_nutricional = cls.calcular_puntuacion_nutricional(alimento, objetivo_calorias, objetivo_proteinas)
            punt_palatabilidad = cls.calcular_puntuacion_palatabilidad(alimento, edad)
            punt_total = punt_nutricional * 0.7 + punt_palatabilidad * 0.3
            
            # Calcular porción sugerida
            porcion = min(objetivo_calorias / alimento.calorias if alimento.calorias > 0 else 1, 2.0)
            
            alimentos_puntuados.append(AlimentoConPuntuacion(
                alimento=alimento,
                puntuacion_nutricional=punt_nutricional,
                puntuacion_palatabilidad=punt_palatabilidad,
                puntuacion_total=punt_total,
                porcion_sugerida=porcion
            ))
        
        # Ordenar por puntuación total
        alimentos_puntuados.sort(key=lambda x: x.puntuacion_total, reverse=True)
        
        # Selección con algoritmo greedy mejorado
        seleccionados = []
        calorias_acum = 0
        proteinas_acum = 0
        grupos_usados = set()
        
        for alimento_puntuado in alimentos_puntuados:
            if len(seleccionados) >= max_alimentos:
                break
                
            alimento = alimento_puntuado.alimento
            
            # Evitar repetir grupos alimenticios (diversidad)
            if alimento.grupo_alimenticio in grupos_usados and len(seleccionados) > 0:
                continue
                
            # Verificar si ayuda a alcanzar objetivos
            calorias_aporte = alimento.calorias * alimento_puntuado.porcion_sugerida
            proteinas_aporte = alimento.proteinas * alimento_puntuado.porcion_sugerida
            
            if (calorias_acum + calorias_aporte <= objetivo_calorias * 1.2 and 
                proteinas_acum + proteinas_aporte <= objetivo_proteinas * 1.3):
                
                seleccionados.append(alimento_puntuado)
                calorias_acum += calorias_aporte
                proteinas_acum += proteinas_aporte
                grupos_usados.add(alimento.grupo_alimenticio)
                
                # Si ya cubrimos objetivos básicos, parar
                if calorias_acum >= objetivo_calorias * 0.8 and proteinas_acum >= objetivo_proteinas * 0.8:
                    break
        
        return seleccionados

class ValidadorRecomendaciones:
    """Valida que las recomendaciones cumplan criterios mínimos"""
    
    @staticmethod
    def validar_recomendacion(
        alimentos_desayuno: List[AlimentoConPuntuacion],
        alimentos_almuerzo: List[AlimentoConPuntuacion], 
        alimentos_cena: List[AlimentoConPuntuacion],
        requisitos: RequisitoNutricional
    ) -> Tuple[bool, List[str]]:
        """Valida una recomendación completa"""
        
        errores = []
        
        # Calcular totales
        calorias_total = 0
        proteinas_total = 0
        
        for categoria_alimentos in [alimentos_desayuno, alimentos_almuerzo, alimentos_cena]:
            for alimento_puntuado in categoria_alimentos:
                calorias_total += alimento_puntuado.alimento.calorias * alimento_puntuado.porcion_sugerida
                proteinas_total += alimento_puntuado.alimento.proteinas * alimento_puntuado.porcion_sugerida
        
        # Validaciones
        if calorias_total < requisitos.calorias_totales * 0.7:
            errores.append(f"Calorías insuficientes: {calorias_total:.0f} < {requisitos.calorias_totales * 0.7:.0f}")
            
        if calorias_total > requisitos.calorias_totales * 1.3:
            errores.append(f"Exceso de calorías: {calorias_total:.0f} > {requisitos.calorias_totales * 1.3:.0f}")
            
        if proteinas_total < requisitos.proteinas_totales * 0.8:
            errores.append(f"Proteínas insuficientes: {proteinas_total:.1f} < {requisitos.proteinas_totales * 0.8:.1f}")
        
        # Validar que cada comida tenga al menos un alimento
        if not alimentos_desayuno:
            errores.append("No hay alimentos para desayuno")
        if not alimentos_almuerzo:
            errores.append("No hay alimentos para almuerzo")
        if not alimentos_cena:
            errores.append("No hay alimentos para cena")
            
        return len(errores) == 0, errores

def generar_recomendacion_automatica_mejorada(
    nino_id: int, 
    motivo: str = "Recomendación automática generada",
    preferencias_usuario: Optional[Dict] = None
) -> 'Recomendacion':
    """
    Genera recomendación nutricional automatizada con algoritmos mejorados
    """
    
    try:
        # Obtener datos base
        nino = Nino.objects.get(id=nino_id)
        
        # Calcular edad
        hoy = date.today()
        edad = hoy.year - nino.fecha_nacimiento.year - (
            (hoy.month, hoy.day) < (nino.fecha_nacimiento.month, nino.fecha_nacimiento.day)
        )
        
        # Obtener historial clínico más reciente
        historial = HistorialClinico.objects.filter(
            nino=nino, 
            activo=True
        ).order_by('-fecha_actualizacion').first()
        
        if not historial:
            raise ValueError("No hay historial clínico activo para este niño.")
        
        # Obtener parámetros de referencia
        parametro = ParametroReferencia.objects.filter(
            edad_min__lte=edad, 
            edad_max__gte=edad
        ).first()
        
        if not parametro:
            raise ValueError(f"No hay parámetros de referencia para la edad {edad} años.")
        
        # Calcular requerimientos nutricionales personalizados
        requisitos = CalculadoraNutricional.calcular_requerimientos(nino, historial, parametro)
        
        # Procesar alergias
        alergias_normalizadas = ProcesadorAlergias.procesar_alergias(historial.alergias)
        
        # Filtrar alimentos seguros por categoría
        def obtener_alimentos_seguros(categoria: str) -> List['Alimento']:
            query = Alimento.objects.filter(categoria=categoria)
            
            # Filtrar alérgenos
            if alergias_normalizadas:
                for alergia in alergias_normalizadas:
                    query = query.exclude(alergenos__icontains=alergia)
            
            return list(query)
        
        # Obtener alimentos disponibles por categoría
        alimentos_desayuno_disponibles = obtener_alimentos_seguros('desayuno')
        alimentos_almuerzo_disponibles = obtener_alimentos_seguros('almuerzo')
        alimentos_cena_disponibles = obtener_alimentos_seguros('cena')
        
        # Verificar disponibilidad mínima
        if not alimentos_desayuno_disponibles:
            raise ValueError("No hay alimentos de desayuno disponibles con las restricciones actuales")
        if not alimentos_almuerzo_disponibles:
            raise ValueError("No hay alimentos de almuerzo disponibles con las restricciones actuales")
        if not alimentos_cena_disponibles:
            raise ValueError("No hay alimentos de cena disponibles con las restricciones actuales")
        
        # Optimizar selección de alimentos
        optimizador = OptimizadorAlimentos()
        
        alimentos_desayuno = optimizador.seleccionar_alimentos_optimizados(
            'desayuno', alimentos_desayuno_disponibles, 
            requisitos.desayuno_calorias, requisitos.desayuno_proteinas, edad
        )
        
        alimentos_almuerzo = optimizador.seleccionar_alimentos_optimizados(
            'almuerzo', alimentos_almuerzo_disponibles,
            requisitos.almuerzo_calorias, requisitos.almuerzo_proteinas, edad
        )
        
        alimentos_cena = optimizador.seleccionar_alimentos_optimizados(
            'cena', alimentos_cena_disponibles,
            requisitos.cena_calorias, requisitos.cena_proteinas, edad
        )
        
        # Validar recomendación
        validador = ValidadorRecomendaciones()
        es_valida, errores = validador.validar_recomendacion(
            alimentos_desayuno, alimentos_almuerzo, alimentos_cena, requisitos
        )
        
        if not es_valida:
            logger.warning(f"Recomendación para niño {nino_id} tiene advertencias: {errores}")
        
        # Calcular totales reales
        calorias_reales = sum([
            sum(a.alimento.calorias * a.porcion_sugerida for a in categoria)
            for categoria in [alimentos_desayuno, alimentos_almuerzo, alimentos_cena]
        ])
        
        proteinas_reales = sum([
            sum(a.alimento.proteinas * a.porcion_sugerida for a in categoria)
            for categoria in [alimentos_desayuno, alimentos_almuerzo, alimentos_cena]
        ])
        
        # Guardar en base de datos
        with transaction.atomic():
            recomendacion = Recomendacion.objects.create(
                nino=nino,
                fecha=now().date(),
                motivo=motivo,
                fuente={
                    "version": "2.0_mejorada",
                    "edad": edad,
                    "datos_fisicos": {
                        "peso": historial.peso,
                        "talla": historial.talla,
                        "actividad_fisica": historial.actividad_fisica,
                    },
                    "condiciones_medicas": {
                        "enfermedades": historial.enfermedades,
                        "alergias": alergias_normalizadas,
                    },
                    "parametros_referencia": {
                        "calorias_objetivo": parametro.calorias,
                        "proteinas_objetivo": parametro.proteinas,
                        "hierro_objetivo": parametro.hierro,
                    },
                    "calculos_personalizados": {
                        "tmb_calculada": CalculadoraNutricional.calcular_tmb_pediatrica(historial.peso, historial.talla, edad),
                        "factor_actividad": CalculadoraNutricional.FACTORES_ACTIVIDAD.get(historial.actividad_fisica, 1.4),
                        "calorias_personalizadas": requisitos.calorias_totales,
                        "proteinas_personalizadas": requisitos.proteinas_totales,
                    },
                    "validacion": {
                        "es_valida": es_valida,
                        "errores": errores if errores else None,
                    }
                },
                estado='vigente',
                calorias_totales=calorias_reales,
                proteinas_totales=proteinas_reales,
                alergenos_evitados=alergias_normalizadas,
                notas=f"Generado automáticamente por sistema mejorado v2.0. " + 
                      (f"Advertencias: {'; '.join(errores)}" if errores else "Recomendación validada correctamente.")
            )
            
            # Guardar alimentos con información de porciones
            for alimento_puntuado in alimentos_desayuno:
                RecomendacionDesayuno.objects.create(
                    recomendacion=recomendacion, 
                    alimento=alimento_puntuado.alimento
                )
                
            for alimento_puntuado in alimentos_almuerzo:
                RecomendacionAlmuerzo.objects.create(
                    recomendacion=recomendacion, 
                    alimento=alimento_puntuado.alimento
                )
                
            for alimento_puntuado in alimentos_cena:
                RecomendacionCena.objects.create(
                    recomendacion=recomendacion, 
                    alimento=alimento_puntuado.alimento
                )
        
        logger.info(f"Recomendación generada exitosamente para niño {nino_id}")
        return recomendacion
        
    except Exception as e:
        logger.error(f"Error generando recomendación para niño {nino_id}: {str(e)}")
        raise

# Función auxiliar para generar múltiples opciones
def generar_opciones_recomendacion(nino_id: int, num_opciones: int = 3) -> List['Recomendacion']:
    """Genera múltiples opciones de recomendación para que el usuario elija"""
    opciones = []
    
    for i in range(num_opciones):
        try:
            recomendacion = generar_recomendacion_automatica_mejorada(
                nino_id, 
                motivo=f"Opción {i+1} de recomendación automática"
            )
            opciones.append(recomendacion)
        except Exception as e:
            logger.warning(f"No se pudo generar opción {i+1}: {str(e)}")
            continue
    
    return opciones