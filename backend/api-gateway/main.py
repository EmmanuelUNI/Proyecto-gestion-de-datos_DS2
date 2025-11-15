from fastapi import FastAPI, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
import httpx
import logging
from typing import Optional

app = FastAPI(title="API Gateway")

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Puedes limitarlo si usas un frontend específico
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

security = HTTPBearer()
logger = logging.getLogger(__name__)

# =====================================================
# URLS DE SERVICIOS
# =====================================================
AUTH_URL = "http://auth-service:8001"
CREAR_URL = "http://crear-service:8002"
CONSULTAR_URL = "http://consultar-service:8003"
MODIFICAR_URL = "http://modificar-service:8004"
ELIMINAR_URL = "http://borrar-service:8005"
LOGS_URL = "http://log-service:8006"
RAG_URL = "http://consulta-natural-service:8007"

# =====================================================
# FUNCIONES AUXILIARES
# =====================================================
async def _forward_request(method: str, url: str, token: Optional[str] = None, json: Optional[dict] = None, params: Optional[dict] = None):
    """Encapsula las peticiones HTTP hacia otros microservicios"""
    headers = {"Authorization": f"Bearer {token}"} if token else {}
    try:
        async with httpx.AsyncClient(timeout=20) as client:
            response = await client.request(method, url, json=json, params=params, headers=headers)
            response.raise_for_status()
            return response.json()
    except httpx.RequestError as e:
        logger.error(f"Error de conexión con {url}: {e}")
        raise HTTPException(status_code=503, detail=f"Servicio no disponible: {url}")
    except httpx.HTTPStatusError as e:
        logger.warning(f"Error HTTP {e.response.status_code} desde {url}")
        return {"status": "error", "code": e.response.status_code, "detail": e.response.text}


# =====================================================
# ENDPOINTS
# =====================================================
@app.post("/auth/login")
async def login(request: dict):
    """Ruta de autenticación"""
    return await _forward_request("POST", f"{AUTH_URL}/autenticar", json=request)

@app.post("/auth/signup")
async def signup(request: dict):
    """Ruta de registro de usuario"""
    return await _forward_request("POST", f"{AUTH_URL}/signup", json=request)

@app.post("/auth/verify-email")
async def verify_email(request: dict):
    """Ruta de verificación de email"""
    return await _forward_request("POST", f"{AUTH_URL}/verify-email", json=request)


@app.post("/personas/crear")
async def crear_persona(request: dict, credentials: HTTPAuthorizationCredentials = Depends(security)):
    """Ruta para crear persona"""
    return await _forward_request("POST", f"{CREAR_URL}/crear", token=credentials.credentials, json=request)


@app.get("/personas/consultar/{nro_doc}")
async def consultar_persona(nro_doc: str, credentials: HTTPAuthorizationCredentials = Depends(security)):
    """Ruta para consultar persona"""
    return await _forward_request("GET", f"{CONSULTAR_URL}/consultar/{nro_doc}", token=credentials.credentials)


@app.put("/personas/modificar/{nro_doc}")
async def modificar_persona(nro_doc: str, request: dict, credentials: HTTPAuthorizationCredentials = Depends(security)):
    """Ruta para modificar persona"""
    return await _forward_request("PUT", f"{MODIFICAR_URL}/modificar/{nro_doc}", token=credentials.credentials, json=request)


@app.delete("/personas/eliminar/{nro_doc}")
async def eliminar_persona(nro_doc: str, credentials: HTTPAuthorizationCredentials = Depends(security)):
    """Ruta para eliminar persona"""
    return await _forward_request("DELETE", f"{ELIMINAR_URL}/eliminar/{nro_doc}", token=credentials.credentials)

@app.post("/consulta-natural")
async def consulta_natural(request: dict, credentials: HTTPAuthorizationCredentials = Depends(security)):

    return await _forward_request("POST", f"{RAG_URL}/consultar", token=credentials.credentials, json=request)


@app.post("/logs/registrar")
async def registrar_log(request: dict, credentials: HTTPAuthorizationCredentials = Depends(security)):
    """Registrar un log"""
    return await _forward_request("POST", f"{LOGS_URL}/registrar", token=credentials.credentials, json=request)



@app.get("/logs")
async def consultar_logs(
    tipo_operacion: Optional[str] = None,
    documento: Optional[str] = None,
    credentials: HTTPAuthorizationCredentials = Depends(security)
):
    """Consultar logs con filtros"""
    params = {"tipo_operacion": tipo_operacion, "documento": documento}
    return await _forward_request("GET", f"{LOGS_URL}/consultar", token=credentials.credentials, params=params)


@app.get("/logs/usuario/{usuario_email}")
async def consultar_logs_usuario(usuario_email: str, credentials: HTTPAuthorizationCredentials = Depends(security)):
    """Consultar logs por email del usuario"""
    return await _forward_request(
        "GET", f"{LOGS_URL}/consultar-por-usuario", 
        token=credentials.credentials, 
        params={"usuario_email": usuario_email}
    )


@app.get("/health")
async def health_check():
    """Health check para Docker"""
    return {"status": "ok", "service": "api-gateway"}
