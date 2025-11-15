import httpx
import logging
from config import config

logger = logging.getLogger(__name__)


class RobleRAGClient:
    """Cliente de ROBLE específico para RAG"""
    
    def __init__(self):
        self.base_url = config.ROBLE_DATABASE_URL
        self.timeout = config.ROBLE_TIMEOUT
        logger.info(f"RobleRAGClient inicializado")
    
    async def obtener_todas_personas(self, token: str) -> list:
        """Obtiene todas las personas para el contexto de RAG"""
        try:
            logger.debug("Obteniendo todas las personas")
            
            async with httpx.AsyncClient(timeout=self.timeout) as client:
                response = await client.get(
                    f"{self.base_url}/read",
                    params={"tableName": config.TABLA_PERSONAS},
                    headers={"Authorization": f"Bearer {token}"}
                )
                
                if response.status_code not in [200, 201]:
                    logger.warning(f"No se encontraron personas: {response.status_code}")
                    return []
                
                datos = response.json()
                logger.info(f"Se obtuvieron {len(datos) if isinstance(datos, list) else 1} personas")
                
                return datos if isinstance(datos, list) else [datos]
                
        except httpx.RequestError as e:
            logger.error(f"Error conectando a ROBLE: {str(e)}")
            raise Exception(f"Error conectando a ROBLE: {str(e)}")

