import httpx
import logging
from comun.config import config

logger = logging.getLogger(__name__)

class RobleDB:
    """Cliente para comunicarse con ROBLE API"""
    
    def __init__(self):
        self.base_url = config.ROBLE_DATABASE_URL
        self.timeout = config.ROBLE_TIMEOUT
        logger.info(f"RobleDB inicializado con URL: {self.base_url}")
    
    async def insertar_persona(self, persona_data, token):
        """Inserta una nueva persona"""
        try:
            logger.debug(f"Insertando persona con documento: {persona_data.get('nro_doc')}")
            
            async with httpx.AsyncClient(timeout=self.timeout) as client:
                response = await client.post(
                    f"{self.base_url}/insert",
                    json={
                        "tableName": config.TABLA_PERSONAS,
                        "records": [persona_data]
                    },
                    headers={"Authorization": f"Bearer {token}"}
                )
                
                if response.status_code not in [200, 201]:
                    raise Exception(f"Error en ROBLE: {response.text}")
                
                logger.info(f"Persona insertada: {persona_data.get('nro_doc')}")
                return response.json()
                
        except httpx.RequestError as e:
            logger.error(f"Error de conexión insertando persona: {str(e)}")
            raise Exception(f"Error conectando a ROBLE: {str(e)}")
   
    async def obtener_persona(self, nro_doc, token):
        """Obtiene una persona por número de documento"""
        try:
            logger.debug(f"Obteniendo persona: {nro_doc}")
            
            async with httpx.AsyncClient(timeout=self.timeout) as client:
                response = await client.get(
                    f"{self.base_url}/read",
                    params={
                        "tableName": config.TABLA_PERSONAS,
                        "nro_doc": nro_doc
                    },
                    headers={"Authorization": f"Bearer {token}"}
                )
                
                if response.status_code not in [200, 201]:
                    return None
                
                data = response.json()
                
                if isinstance(data, list):
                    return data if len(data) > 0 else None
                
                return data
                
        except httpx.RequestError as e:
            logger.error(f"Error de conexión obteniendo persona: {str(e)}")
            raise Exception(f"Error conectando a ROBLE: {str(e)}")
        
    async def obtener_todas_persona(self, token):
        
        """Obtiene todas las personas"""
        try:
            
            async with httpx.AsyncClient(timeout=self.timeout) as client:
                response = await client.get(
                    f"{self.base_url}/read",
                    params={
                        "tableName": config.TABLA_PERSONAS,
                    },
                    headers={"Authorization": f"Bearer {token}"}
                )
                
                if response.status_code not in [200, 201]:
                    return None
                
                data = response.json()
                
                if isinstance(data, list):
                    return data if len(data) > 0 else None
                
                return data
                
        except httpx.RequestError as e:
            logger.error(f"Error de conexión obteniendo persona: {str(e)}")
            raise Exception(f"Error conectando a ROBLE: {str(e)}")
    async def actualizar_persona(self, nro_doc, updates, token):
        """Actualiza una persona existente"""
        try:
            logger.debug(f"Actualizando persona {nro_doc} con campos: {list(updates.keys())}")
            
            async with httpx.AsyncClient(timeout=self.timeout) as client:
                response = await client.put(
                    f"{self.base_url}/update",
                    json={
                        "tableName": config.TABLA_PERSONAS,
                        "idColumn": config.PERSONA_ID_COLUMN,
                        "idValue": nro_doc,
                        "updates": updates
                    },
                    headers={"Authorization": f"Bearer {token}"}
                )
                
                if response.status_code not in [200, 201]:
                    raise Exception(f"Error en ROBLE: {response.text}")
                
                logger.info(f"Persona actualizada: {nro_doc}")
                return response.json()
                
        except httpx.RequestError as e:
            logger.error(f"Error de conexión actualizando persona: {str(e)}")
            raise Exception(f"Error conectando a ROBLE: {str(e)}")
    
    async def eliminar_persona(self, nro_doc, token):
        """Elimina una persona"""
        try:
            logger.debug(f"Eliminando persona: {nro_doc}")
            
            async with httpx.AsyncClient(timeout=self.timeout) as client:
                response = await client.request(
                    "DELETE",
                    f"{self.base_url}/delete",
                    json={
                        "tableName": config.TABLA_PERSONAS,
                        "idColumn": config.PERSONA_ID_COLUMN,
                        "idValue": nro_doc
                    },
                    headers={"Authorization": f"Bearer {token}"}
                )
                
                if response.status_code not in [200, 201]:
                    raise Exception(f"Error en ROBLE: {response.text}")
                
                logger.info(f"Persona eliminada: {nro_doc}")
                return response.json()
                
        except httpx.RequestError as e:
            logger.error(f"Error de conexión eliminando persona: {str(e)}")
            raise Exception(f"Error conectando a ROBLE: {str(e)}")
