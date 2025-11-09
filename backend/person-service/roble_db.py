import httpx
import os


class RobleDB:
    def __init__(self):
        self.base_url = f"https://roble-api.openlab.uninorte.edu.co/database/diseo_de_software_ii_908c0f07a5"
    
    async def insertar_persona(self, persona_data, token):
        """Inserta una nueva persona"""
        async with httpx.AsyncClient() as client:
            response = await client.post(
                f"{self.base_url}/insert",
                json={
                    "tableName": "persona",
                    "records": [persona_data]
                },
                headers={"Authorization": f"Bearer {token}"}
            )
            return response.json()
    
    async def obtener_persona(self, nro_doc, token):
        """Obtiene una persona por número de documento"""
        async with httpx.AsyncClient() as client:
            response = await client.get(
                f"{self.base_url}/read",
                params={
                    "tableName": "persona",
                    "nro_doc": nro_doc
                },
                headers={"Authorization": f"Bearer {token}"}
            )
            return response.json()
    
    async def actualizar_persona(self, nro_doc, updates, token):
        """Actualiza una persona existente"""
        async with httpx.AsyncClient() as client:
            response = await client.put(
                f"{self.base_url}/update",
                json={
                    "tableName": "persona",
                    "idColumn": "nro_doc",
                    "idValue": nro_doc,
                    "updates": updates
                },
                headers={"Authorization": f"Bearer {token}"}
            )
            return response.json()
    
    async def eliminar_persona(self, nro_doc, token):
        """Elimina una persona"""
        async with httpx.AsyncClient() as client:
            response = await client.request(
                "DELETE",
                f"{self.base_url}/delete",
                json={
                    "tableName": "persona",
                    "idColumn": "nro_doc",
                    "idValue": nro_doc
                },
                headers={"Authorization": f"Bearer {token}"}
            )
            return response.json()