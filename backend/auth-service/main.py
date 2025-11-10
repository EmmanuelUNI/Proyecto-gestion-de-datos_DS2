from fastapi import FastAPI, HTTPException, Depends
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from pydantic import BaseModel, EmailStr
from typing import Optional, Dict, Any
import logging
from roble_client import RobleAuthClient

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI(title="Servicio de Autenticación")
security = HTTPBearer()


roble_client = RobleAuthClient()



class LoginRequest(BaseModel):
    """Solicitud de login"""
    email: str
    password: str
    
    class Config:
        json_schema_extra = {
            "example": {
                "email": "usuario@correo.com",
                "password": "12345678"
            }
        }


class LoginResponse(BaseModel):
    """Respuesta de login"""
    access_token: str
    token_type: str = "bearer"


class ValidateTokenResponse(BaseModel):
    """Respuesta de validación"""
    valid: bool
    roble_data: Optional[Dict[str, Any]] = None
    
    class Config:
        json_schema_extra = {"example": {"valid": True, "roble_data": {}}}


# Endpoints

@app.post("/autenticar", response_model=LoginResponse)
async def login(request: LoginRequest):
    try:
        logger.info(f"Intento de login para: {request.email}")
        
        roble_response = await roble_client.login(
            email=request.email,
            password=request.password
        )
        
        access_token = roble_response.get("accessToken")
        
        if not access_token:
            logger.warning(f"ROBLE no retornó token para: {request.email}")
            raise HTTPException(
                status_code=401,
                detail="No se recibió token de ROBLE"
            )
        
        logger.info(f"Login exitoso para: {request.email}")
        
        return LoginResponse(
            access_token=access_token,
            token_type="bearer"
        )
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error en login: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail=f"Error de autenticación: {str(e)}"
        )


@app.get("/validar-token", response_model=ValidateTokenResponse)
async def validar_token_roble(
    credentials: HTTPAuthorizationCredentials = Depends(security)
):

    token = credentials.credentials
    
    try:
        print("hola")
        logger.info("Validando token...")
        
        roble_data = await roble_client.verify_token(token)
        
        logger.info("Token válido")
        
        return ValidateTokenResponse(
            valid=True,
            roble_data=roble_data
        )
        
    except Exception as e:
        logger.error(f"Error validando token: {str(e)}")
        raise HTTPException(
            status_code=401,
            detail="Token inválido o expirado"
        )


@app.post("/logout")
async def logout_roble(
    credentials: HTTPAuthorizationCredentials = Depends(security)
):
    token = credentials.credentials
    
    try:
        logger.info("Cerrando sesión...")
        success = await roble_client.logout(token)
        
        if not success:
            raise Exception("Logout en ROBLE falló")
        
        logger.info("Sesión cerrada correctamente")
        
        return {"message": "Sesión cerrada correctamente"}
        
    except Exception as e:
        logger.error(f"Error en logout: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail=f"Error cerrando sesión: {str(e)}"
        )


@app.get("/health")
async def health_check():
    return {
        "status": "healthy",
        "service": "autenticacion"
    }