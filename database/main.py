from fastapi import FastAPI, HTTPException, Depends
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from pydantic import BaseModel
import httpx
import os
import jwt
from datetime import datetime, timedelta

app = FastAPI()
security = HTTPBearer()

ROBLE_DB_NAME = "diseo_de_software_ii_908c0f07a5"     # os.getenv("ROBLE_API_URL")
ROBLE_API_URL = "https://roble-api.openlab.uninorte.edu.co"        #os.getenv("ROBLE_DB_NAME")

class LoginRequest(BaseModel):
    email: str
    password: str

@app.post("/autenticar")
async def login(request: LoginRequest):
    """
    Autentica usuario contra ROBLE y devuelve directamente su token
    """
    try:
        async with httpx.AsyncClient() as client:
            response = await client.post(
                f"{ROBLE_API_URL}/auth/{ROBLE_DB_NAME}/login",
                json={
                    "email": request.email,
                    "password": request.password
                }
            )

            if response.status_code != 201:
                raise HTTPException(status_code=401, detail="Credenciales inválidas")
            
            roble_tokens = response.json()
            
            return {
                "access_token": roble_tokens.get("accessToken"),
                "token_type": "bearer"
            }

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/validar-token")
async def validar_token_roble(credentials: HTTPAuthorizationCredentials = Depends(security)):
    """
    Valida un token directamente contra la API de ROBLE.
    """
    token = credentials.credentials
    headers = {"Authorization": f"Bearer {token}"}
    try:
        async with httpx.AsyncClient() as client:
            response = await client.get(f"{ROBLE_API_URL}/auth/{ROBLE_DB_NAME}/verify-token", headers=headers)
            if response.status_code != 200:
                raise HTTPException(status_code=401, detail="Token inválido o expirado")
            
            data = response.json()
            return {"valid": True, "roble_data": data}

    except httpx.RequestError as e:
        raise HTTPException(status_code=500, detail=f"Error de conexión a ROBLE: {str(e)}")

@app.post("/logout")
async def logout_roble(credentials: HTTPAuthorizationCredentials = Depends(security)):
    """
    Cierra sesión usando el token directamente en ROBLE
    """
    token = credentials.credentials
    headers = {"Authorization": f"Bearer {token}"}

    try:
        async with httpx.AsyncClient() as client:
            response = await client.post(f"{ROBLE_API_URL}/auth/{ROBLE_DB_NAME}/logout", headers=headers)
            
            if response.status_code != 201:
                raise HTTPException(status_code=response.status_code, detail="No se pudo cerrar sesión en ROBLE")
            
        return {"message": "Sesión cerrada correctamente"}
    
    except httpx.RequestError as e:
        raise HTTPException(status_code=500, detail=f"Error de conexión a ROBLE: {str(e)}")