from fastapi import FastAPI, HTTPException, Depends
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from pydantic import BaseModel
from typing import Optional
import httpx, logging, jwt
import sys
import os
sys.path.append(os.path.join(os.path.dirname(__file__), '..'))

from comun.roble_db import RobleDB
from comun.config import config

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)
app = FastAPI(title="Servicio Crear Persona")
security = HTTPBearer()
roble = RobleDB()

class CrearPersonaRequest(BaseModel):
    primer_nombre: str
    segundo_nombre: Optional[str] = None
    apellidos: str
    fecha_nacimiento: str
    genero: str
    correo: str
    celular: str
    nro_doc: str
    tipo_doc: str
    foto: str

@app.post("/crear")
async def crear_persona(request: CrearPersonaRequest, credentials: HTTPAuthorizationCredentials = Depends(security)):
    try:
        existente = await roble.obtener_persona(request.nro_doc, credentials.credentials)
        if existente:
            raise HTTPException(status_code=409, detail="Documento ya registrado")

        persona_data = request.dict()
        resultado = await roble.insertar_persona(persona_data, credentials.credentials)

        await _registrar_log("CREAR", _extraer_email(credentials.credentials), request.nro_doc,
                             f"Creada persona {request.primer_nombre} {request.apellidos}",
                             credentials.credentials)
        return {"status": "success", "data": resultado}
    except Exception as e:
        logger.error(f"Error: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/health")
async def health(): return {"status": "healthy", "service": "crear_persona"}

async def _registrar_log(tipo, email, doc, desc, token):
    try:
        headers = {"Authorization": f"Bearer {token}"}
        async with httpx.AsyncClient(timeout=config.SERVICE_TIMEOUT) as client:
            await client.post(
                f"{config.LOGS_SERVICE_URL}/registrar",
                json={
                    "tipo_operacion": tipo,
                    "usuario_email": email,
                    "documento_afectado": doc,
                },
                headers=headers
            )
    except Exception as e:
        logger.warning(f"No se registró log: {str(e)}")

def _extraer_email(token):
    try: return jwt.decode(token, options={"verify_signature": False}).get("email", "desconocido")
    except: return "desconocido"
