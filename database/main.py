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
JWT_SECRET ="mi_clave_super_secreta_y_larga"   #os.getenv("JWT_SECRET")

class LoginRequest(BaseModel):
    email: str
    password: str

@app.post("/autenticar")
async def login(request: LoginRequest):
    """
    Autentica usuario contra ROBLE y genera JWT
    """
    try:
        async with httpx.AsyncClient() as client:
            # Llamar a ROBLE para validar credenciales
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
            
            # Generar JWT local
            payload = {
                "email": request.email,
                "exp": int((datetime.utcnow() + timedelta(hours=24)).timestamp()),  # <-- aquí
                "roble_access_token": roble_tokens.get("accessToken")
            }
            
            jwt_token = jwt.encode(payload, JWT_SECRET, algorithm="HS256")
            
            return {
                "access_token": jwt_token,
                "token_type": "bearer",
                "roble_token": roble_tokens.get("accessToken")
            }
            
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/validar-token")
async def validate_token(credentials: HTTPAuthorizationCredentials = Depends(security)):
    """
    Valida que el token JWT sea válido
    """
    try:
        payload = jwt.decode(credentials.credentials, JWT_SECRET, algorithms=["HS256"])
        return {"valid": True, "email": payload.get("email")}
    except jwt.InvalidTokenError:
        raise HTTPException(status_code=401, detail="Token inválido")

@app.post("/logout")
async def logout(credentials: HTTPAuthorizationCredentials = Depends(security)):
    """
    Cierra sesión
    """
    try:
        payload = jwt.decode(credentials.credentials, JWT_SECRET, algorithms=["HS256"])
        roble_token = payload.get("roble_access_token")
        
        async with httpx.AsyncClient() as client:
            await client.post(
                f"{ROBLE_API_URL}/auth/{ROBLE_DB_NAME}/logout",
                headers={"Authorization": f"Bearer {roble_token}"}
            )
        
        return {"message": "Sesión cerrada"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))