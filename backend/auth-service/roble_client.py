import httpx
from typing import Dict, Optional
from config import config


class RobleAuthClient:
    def __init__(self):
        self.timeout = config.HTTP_TIMEOUT
    
    async def login(self, email: str, password: str) -> Dict:

        try:
            async with httpx.AsyncClient(timeout=self.timeout) as client:
                response = await client.post(
                    config.ROBLE_AUTH_LOGIN,
                    json={
                        "email": email,
                        "password": password
                    }
                )
                
                if response.status_code not in [200, 201]:
                    raise Exception(
                        f"ROBLE retornó {response.status_code}: {response.text}"
                    )
                
                return response.json()
                
        except httpx.RequestError as e:
            raise Exception(f"Error conectando a ROBLE: {str(e)}")
    
    async def verify_token(self, token: str) -> Dict:
        try:
            headers = {"Authorization": f"Bearer {token}"}
            
            async with httpx.AsyncClient(timeout=self.timeout) as client:
                response = await client.get(
                    config.ROBLE_AUTH_VERIFY,
                    headers=headers
                )
                
                if response.status_code not in [200,201]:
                    raise Exception(f"Token inválido: {response.status_code}")
                print(response.json())
                return response.json()
                
        except httpx.RequestError as e:
            raise Exception(f"Error verificando token: {str(e)}")
    
    async def logout(self, token: str) -> bool:
        try:
            headers = {"Authorization": f"Bearer {token}"}
            
            async with httpx.AsyncClient(timeout=self.timeout) as client:
                response = await client.post(
                    config.ROBLE_AUTH_LOGOUT,
                    headers=headers
                )
                
                if response.status_code not in [200, 201]:
                    raise Exception(f"Error en logout: {response.status_code}")
                
                return True
                
        except httpx.RequestError as e:
            raise Exception(f"Error en logout: {str(e)}")