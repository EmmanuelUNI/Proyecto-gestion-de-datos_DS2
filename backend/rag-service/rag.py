import logging
from typing import List, Dict
from google import genai
from config import config  # Tu configuración personalizada

logger = logging.getLogger(__name__)

class RAGManager:
    """Gestor de RAG con Google Gemini"""

    def __init__(self):
        """Inicializa el cliente Gemini"""
        try:
            # Validar clave
            if not config.GOOGLE_API_KEY:
                raise ValueError("❌ GOOGLE_API_KEY no está configurada")

            # Validar modelo
            if not config.GOOGLE_MODEL:
                raise ValueError("❌ GOOGLE_MODEL no está configurada")

            # Inicializar cliente con clave explícita
            self.client = genai.Client(api_key=config.GOOGLE_API_KEY)
            logger.info(f"✅ Cliente Gemini ({config.GOOGLE_MODEL}) inicializado correctamente")

        except Exception as e:
            logger.error(f"❌ Error inicializando Gemini: {str(e)}")
            raise

    async def responder_pregunta(self, pregunta: str, contexto_datos: List[Dict]) -> str:
        try:
            logger.debug(f"Procesando pregunta: {pregunta}")
            contexto_formateado = self._formatear_contexto(contexto_datos)

            prompt_sistema = """Eres un asistente inteligente que responde preguntas sobre 
empleados y datos personales de una empresa. 
Responde de forma clara, precisa y amable basándote en los datos proporcionados.
Si no tienes información para responder, dilo claramente."""

            prompt_completo = f"""{prompt_sistema}

Contexto - Datos disponibles:
{contexto_formateado}

Pregunta del usuario: {pregunta}

Responde basándote SOLO en los datos proporcionados arriba. (respuesta breve y concisa)"""
            if not config.GOOGLE_MODEL:
                raise ValueError("❌ GOOGLE_MODEL no está configurada")
            
            response = self.client.models.generate_content(
                model=config.GOOGLE_MODEL,
                contents=prompt_completo
            )

            respuesta_texto = getattr(response, "text", None) or ""
            logger.info("✅ Respuesta generada exitosamente")
            return respuesta_texto

        except Exception as e:
            logger.error(f"❌ Error generando respuesta: {str(e)}")
            raise Exception(f"Error en RAG: {str(e)}")

    def _formatear_contexto(self, datos: List[Dict]) -> str:
        """Formatea los datos para que sean legibles por Gemini"""
        if not datos:
            return "No hay datos disponibles"

        lineas = [f"Total de registros: {len(datos)}\n"]

        for i, persona in enumerate(datos, 1):
            if isinstance(persona, list):
                persona = persona[0] if persona else {}

            linea = f"{i}. "
            if isinstance(persona, dict):
                linea += f"{persona.get('primer_nombre', 'N/A')} {persona.get('apellidos', 'N/A')}"
                linea += f" (Documento: {persona.get('nro_doc', 'N/A')})"
                linea += f" - Edad: {persona.get('fecha_nacimiento', 'N/A')}"
                linea += f" - Género: {persona.get('genero', 'N/A')}"
                linea += f" - Email: {persona.get('correo', 'N/A')}"
            else:
                linea += str(persona)

            lineas.append(linea)

        return "\n".join(lineas)

    async def obtener_embedding(self, texto: str) -> List[float]:
        """
        Obtiene el embedding de un texto usando Google

        Args:
            texto: Texto a convertir a embedding

        Returns:
            Vector de embedding
        """
        try:
            logger.debug(f"Obteniendo embedding para: {texto[:50]}...")

            # Si decides usar embeddings reales:
            # embedding_model = self.client.models.get_model("embedding-001")
            # embedding = embedding_model.embed_content(texto).embedding
            # return embedding

            logger.debug("Embedding no necesario para Gemini (usa attention internamente)")
            return []

        except Exception as e:
            logger.error(f"❌ Error obteniendo embedding: {str(e)}")
            raise Exception(f"Error en embedding: {str(e)}")