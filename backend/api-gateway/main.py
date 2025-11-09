from fastapi import FastAPI, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import HTTPBearer, HTTPAuthCredentials
import httpx

app = FastAPI()

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

security = HTTPBearer()

AUTH_URL = "http://servicio-autenticacion:8001"
PERSONAS_URL = "http://servicio-personas:8002"
RAG_URL = "http://servicio-consulta-rag:8003"
LOGS_URL = "http://servicio-logs:8004"

@app.post("/auth/login")
async def login(request: dict):
    """Ruta de autenticación"""
    async with httpx.AsyncClient() as client:
        response = await client.post(f"{AUTH_URL}/autenticar", json=request)
    return response.json()

@app.post("/personas/crear")
async def crear_persona(request: dict, credentials: HTTPAuthCredentials = Depends(security)):
    """Ruta para crear persona"""
    async with httpx.AsyncClient() as client:
        response = await client.post(
            f"{PERSONAS_URL}/crear",
            json=request,
            headers={"Authorization": f"Bearer {credentials.credentials}"}
        )
    return response.json()

@app.get("/personas/consultar/{nro_doc}")
async def consultar_persona(nro_doc: str, credentials: HTTPAuthCredentials = Depends(security)):
    """Ruta para consultar persona"""
    async with httpx.AsyncClient() as client:
        response = await client.get(
            f"{PERSONAS_URL}/consultar/{nro_doc}",
            headers={"Authorization": f"Bearer {credentials.credentials}"}
        )
    return response.json()

@app.put("/personas/modificar/{nro_doc}")
async def modificar_persona(nro_doc: str, request: dict, credentials: HTTPAuthCredentials = Depends(security)):
    """Ruta para modificar persona"""
    async with httpx.AsyncClient() as client:
        response = await client.put(
            f"{PERSONAS_URL}/modificar/{nro_doc}",
            json=request,
            headers={"Authorization": f"Bearer {credentials.credentials}"}
        )
    return response.json()

@app.delete("/personas/eliminar/{nro_doc}")
async def eliminar_persona(nro_doc: str, credentials: HTTPAuthCredentials = Depends(security)):
    """Ruta para eliminar persona"""
    async with httpx.AsyncClient() as client:
        response = await client.delete(
            f"{PERSONAS_URL}/eliminar/{nro_doc}",
            headers={"Authorization": f"Bearer {credentials.credentials}"}
        )
    return response.json()

@app.post("/consulta-natural")
async def consulta_natural(request: dict, credentials: HTTPAuthCredentials = Depends(security)):
    """Ruta para consulta en lenguaje natural"""
    async with httpx.AsyncClient() as client:
        response = await client.post(
            f"{RAG_URL}/consultar",
            json=request,
            headers={"Authorization": f"Bearer {credentials.credentials}"}
        )
    return response.json()

@app.get("/logs")
async def get_logs(tipo: str = None, documento: str = None, fecha: str = None, 
                   credentials: HTTPAuthCredentials = Depends(security)):
    """Ruta para consultar logs"""
    async with httpx.AsyncClient() as client:
        response = await client.get(
            f"{LOGS_URL}/consultar",
            params={"tipo": tipo, "documento": documento, "fecha": fecha},
            headers={"Authorization": f"Bearer {credentials.credentials}"}
        )
    return response.json()