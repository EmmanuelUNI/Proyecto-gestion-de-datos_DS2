import json
import httpx
import logging
from datetime import datetime
from config import config

logger = logging.getLogger(__name__)


class LogManager:
    """Gestor de logs en ROBLE"""
    
    def __init__(self):
        self.base_url = config.ROBLE_DATABASE_URL
        self.timeout = config.ROBLE_TIMEOUT
        logger.info(f"LogManager inicializado con URL: {self.base_url}")
    
    async def registrar_log(self, log_data, token):

        try:
            logger.debug(f"Registrando log: {log_data.get('tipo_operacion')}")

            for field in ["datos_nuevos", "datos_anteriores"]:
                if field in log_data and log_data[field] is not None:
                    try:
     
                        if isinstance(log_data[field], list):
                            log_data[field] = log_data[field][0]
         
                        if not isinstance(log_data[field], dict):
                            log_data[field] = json.loads(json.dumps(log_data[field]))
                    except Exception as e:
                        logger.warning(f"⚠️ No se pudo normalizar {field}: {e}")
                        log_data[field] = None
                        
            async with httpx.AsyncClient(timeout=self.timeout) as client:
                response = await client.post(
                    f"{self.base_url}/insert",
                    json={
                        "tableName": config.TABLA_LOGS,
                        "records": [log_data]
                    },
                    headers={"Authorization": f"Bearer {token}"}
                )

                if response.status_code not in [200, 201]:
                    raise Exception(f"Error en ROBLE: {response.text}")
                
                logger.info(f"Log registrado: {log_data.get('tipo_operacion')}")
                logger.info(log_data)
                return response.json()
                
        except httpx.RequestError as e:
            logger.error(f"Error de conexión registrando log: {str(e)}")
            raise Exception(f"Error conectando a ROBLE: {str(e)}")
    
    async def obtener_logs(self, filtros, token):
        """
        Obtiene logs con filtros opcionales
        
        Args:
            filtros: Dict con filtros (tipo_operacion, documento_afectado, fecha_transaccion)
            token: Token de autenticación de ROBLE
            
        Returns:
            Lista de logs
            
        Raises:
            Exception si falla la consulta
        """
        try:
            logger.debug(f"Obteniendo logs con filtros: {filtros}")
            
            # Construir parámetros de query
            params = {"tableName": config.TABLA_LOGS}
            params.update(filtros)
            
            async with httpx.AsyncClient(timeout=self.timeout) as client:
                response = await client.get(
                    f"{self.base_url}/read",
                    params=params,
                    headers={"Authorization": f"Bearer {token}"}
                )
                
                if response.status_code not in [200, 201]:
                    logger.warning(f"No se encontraron logs con los filtros: {filtros}")
                    return []
                
                data = response.json()
                logger.debug(f"Se encontraron {len(data) if isinstance(data, list) else 1} logs")
                
                if isinstance(data, list):
                    return data
                else:
                    return [data] if data else []
                
        except httpx.RequestError as e:
            logger.error(f"Error de conexión obteniendo logs: {str(e)}")
            raise Exception(f"Error conectando a ROBLE: {str(e)}")
        
    def preparar_log(self, tipo_operacion, usuario_email, documento,
                    descripcion=None, datos_nuevos=None, datos_anteriores=None,
                    pregunta_rag=None, respuesta_rag=None, fecha_transaccion=None):

        log_entry = {
            "tipo_operacion": tipo_operacion,
            "usuario_email": usuario_email,
            "documento_afectado": documento,
            "datos_nuevos": datos_nuevos,
            "datos_anteriores": datos_anteriores,
            "pregunta_rag": pregunta_rag,
            "respuesta_rag": respuesta_rag,
            "fecha_transaccion": (fecha_transaccion or datetime.utcnow()).isoformat()
        }

        logger.debug(f"Log preparado: {log_entry}")
        return log_entry
