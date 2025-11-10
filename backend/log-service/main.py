from fastapi import FastAPI, HTTPException, Depends
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from pydantic import BaseModel
from typing import Optional, Any
import logging
from datetime import datetime
import jwt
from log_manager import LogManager

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI(title="Servicio de Logs")
security = HTTPBearer()
log_manager = LogManager()


# ========== MODELOS ==========

class RegistrarLogRequest(BaseModel):
    """Solicitud para registrar un log completo"""
    tipo_operacion: str                      # CREAR, CONSULTAR, MODIFICAR, ELIMINAR
    usuario_email: str
    documento_afectado: str
    datos_nuevos: Optional[Any] = None
    datos_anteriores: Optional[Any] = None
    pregunta_rag: Optional[str] = None
    respuesta_rag: Optional[int] = None
    fecha_transaccion: Optional[datetime] = None


class ConsultarLogsRequest(BaseModel):
    """Solicitud para consultar logs"""
    tipo_operacion: Optional[str] = None
    documento: Optional[str] = None
    fecha_desde: Optional[str] = None
    fecha_hasta: Optional[str] = None


# ========== ENDPOINTS ==========

@app.post("/registrar")
async def registrar_log(
    request: RegistrarLogRequest,
    credentials: HTTPAuthorizationCredentials = Depends(security)
):
    """
    Registra una operación en el sistema de logs
    """
    try:
        logger.info(f"Registrando log: {request.tipo_operacion} para documento {request.documento_afectado}")

        # Si no envían fecha, se usa la actual
        fecha = request.fecha_transaccion or datetime.utcnow()

        # Preparar log completo
        log_data = log_manager.preparar_log(
            tipo_operacion=request.tipo_operacion,
            usuario_email=request.usuario_email,
            documento=request.documento_afectado,
            datos_nuevos=request.datos_nuevos,
            datos_anteriores=request.datos_anteriores,
            pregunta_rag=request.pregunta_rag,
            respuesta_rag=request.respuesta_rag,
            fecha_transaccion=fecha
        )

        # Insertar en ROBLE
        resultado = await log_manager.registrar_log(log_data, credentials.credentials)

        logger.info(f"✅ Log registrado exitosamente: {request.tipo_operacion}")
        return {
            "status": "success",
            "message": "Log registrado",
            "data": resultado
        }

    except Exception as e:
        logger.error(f"Error registrando log: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error: {str(e)}")


@app.get("/consultar")
async def consultar_logs(
    tipo_operacion: Optional[str] = None,
    documento: Optional[str] = None,
    credentials: HTTPAuthorizationCredentials = Depends(security)
):
    """Consulta logs con filtros opcionales"""
    try:
        logger.info(f"Consultando logs con filtros: tipo={tipo_operacion}, doc={documento}")

        filtros = {}
        if tipo_operacion:
            filtros["tipo_operacion"] = tipo_operacion
        if documento:
            filtros["documento_afectado"] = documento

        resultado = await log_manager.obtener_logs(filtros, credentials.credentials)

        if not resultado:
            return {"status": "success", "message": "Sin resultados", "data": []}

        return {
            "status": "success",
            "message": f"Se encontraron {len(resultado)} registros",
            "data": resultado
        }

    except Exception as e:
        logger.error(f"Error consultando logs: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error: {str(e)}")


@app.get("/consultar-por-usuario")
async def consultar_logs_por_usuario(
    usuario_email: str,
    credentials: HTTPAuthorizationCredentials = Depends(security)
):
    """Consulta logs por email del usuario"""
    try:
        logger.info(f"Consultando logs del usuario: {usuario_email}")
        filtros = {"usuario_email": usuario_email}

        resultado = await log_manager.obtener_logs(filtros, credentials.credentials)

        if not resultado:
            return {"status": "success", "message": f"Sin registros para {usuario_email}", "data": []}

        return {
            "status": "success",
            "message": f"Se encontraron {len(resultado)} registros",
            "data": resultado
        }

    except Exception as e:
        logger.error(f"Error consultando logs por usuario: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error: {str(e)}")


@app.get("/health")
async def health_check():
    """Health check para Docker"""
    return {"status": "healthy", "service": "logs"}
