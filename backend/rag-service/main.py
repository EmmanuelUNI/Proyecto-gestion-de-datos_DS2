from fastapi import FastAPI, HTTPException, Depends
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from pydantic import BaseModel
import logging
import jwt
import httpx
from rag import RAGManager
from roble_rag import RobleRAGClient
from config import config

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI(title="Servicio de Consulta RAG - Google Gemini")
security = HTTPBearer()

# Inicializar con manejo de errores
try:
    rag_manager = RAGManager()
    roble_client = RobleRAGClient()
    logger.info(f"✅ Usando modelo: {config.GOOGLE_MODEL}")
except Exception as e:
    logger.error(f"❌ Error inicializando: {str(e)}")
    rag_manager = None
    roble_client = None


# ========== MODELOS ==========

class ConsultaRAGRequest(BaseModel):
    """Solicitud de consulta en lenguaje natural"""
    pregunta: str


# ========== ENDPOINTS ==========

@app.post("/consultar")
async def consultar_rag(request: ConsultaRAGRequest,
                       credentials: HTTPAuthorizationCredentials = Depends(security)):
    """Responde preguntas en lenguaje natural usando RAG + Gemini"""
    try:
        logger.info(f"Pregunta RAG recibida: {request.pregunta}")
        
        # Validar que Gemini esté configurado
        if rag_manager is None:
            raise HTTPException(
                status_code=500,
                detail="Google Gemini no está configurado"
            )

        # Validar que el cliente Roble esté inicializado
        if roble_client is None:
            logger.error("RobleRAGClient no está configurado")
            raise HTTPException(
                status_code=500,
                detail="Servicio de contexto (Roble) no está disponible"
            )
        
        # Obtener datos de contexto
        personas = await roble_client.obtener_todas_personas(credentials.credentials)
        
        if not personas:
            logger.warning("No se encontraron personas para el contexto")
            return {
                "status": "success",
                "respuesta": "No hay datos disponibles en el sistema",
                "contexto_registros": 0,
                "modelo": config.GOOGLE_MODEL
            }
        
        # Generar respuesta
        respuesta = await rag_manager.responder_pregunta(
            pregunta=request.pregunta,
            contexto_datos=personas
        )
        
        # Registrar en logs
        await _registrar_log(
            tipo_operacion="CONSULTAR_RAG",
            usuario_email=_extraer_email(credentials.credentials),
            pregunta_rag=f"Pregunta: {request.pregunta}",
            respuesta_rag=respuesta,
            token=credentials.credentials          
        )
        
        logger.info(f"Consulta RAG procesada exitosamente")
        return {
            "status": "success",
            "pregunta": request.pregunta,
            "respuesta": respuesta,
            "contexto_registros": len(personas) if isinstance(personas, list) else 1,
            "modelo": config.GOOGLE_MODEL,
            "proveedor": "google"
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error procesando consulta RAG: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error: {str(e)}")


@app.get("/health")
async def health_check():
    """Health check para Docker"""
    configurado = bool(config.GOOGLE_API_KEY)
    
    return {
        "status": "healthy",
        "service": "consulta-rag",
        "modelo": config.GOOGLE_MODEL,
        "proveedor": "google",
        "google_configurado": configurado
    }


@app.get("/info")
async def info():
    """Información del servicio RAG"""
    return {
        "nombre": "Servicio de Consulta RAG - Google Gemini",
        "version": "1.0",
        "modelo": config.GOOGLE_MODEL,
        "proveedor": "google",
        "descripcion": "Responde preguntas en lenguaje natural usando Gemini + contexto"
    }


# ========== FUNCIONES AUXILIARES ==========

async def _registrar_log(tipo_operacion: str, usuario_email: str, pregunta_rag: str, respuesta_rag: str,token):
    """Registra operación en servicio de logs"""
    try:
        headers = {"Authorization": f"Bearer {token}"}
        async with httpx.AsyncClient(timeout=config.SERVICE_TIMEOUT) as client:
            await client.post(
                f"{config.LOGS_URL}/registrar",
                json={
                    "tipo_operacion": tipo_operacion,
                    "usuario_email": usuario_email,
                    "pregunta_rag": pregunta_rag,
                    "respuesta_rag": respuesta_rag
                },
                headers=headers
            )
    except Exception as e:
        logger.warning(f"No se pudo registrar en log: {str(e)}")


def _extraer_email(token: str) -> str:
    """Extrae email del token JWT"""
    try:
        payload = jwt.decode(token, options={"verify_signature": False})
        return payload.get("email", "desconocido")
    except:
        return "desconocido"