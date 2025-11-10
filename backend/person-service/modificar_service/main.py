from fastapi import FastAPI, HTTPException, Depends
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from pydantic import BaseModel
from typing import Optional
import httpx, logging, jwt
from comun.roble_db import RobleDB
from comun.config import config

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)
app = FastAPI(title="Servicio Modificar Persona")
security = HTTPBearer()
roble = RobleDB()

class ModificarPersonaRequest(BaseModel):
    primer_nombre: Optional[str] = None
    segundo_nombre: Optional[str] = None
    apellidos: Optional[str] = None
    correo: Optional[str] = None
    celular: Optional[str] = None
    genero: Optional[str] = None

@app.put("/modificar/{nro_doc}")
async def modificar_persona(nro_doc: str, request: ModificarPersonaRequest,
                            credentials: HTTPAuthorizationCredentials = Depends(security)):
    try:
        existente = await roble.obtener_persona(nro_doc, credentials.credentials)
        if not existente:
            raise HTTPException(status_code=404, detail="Persona no encontrada")

        updates = {k: v for k, v in request.dict().items() if v is not None}
        if not updates:
            raise HTTPException(status_code=400, detail="No hay campos para actualizar")

        resultado = await roble.actualizar_persona(nro_doc, updates, credentials.credentials)
        await _registrar_log("MODIFICAR", _extraer_email(credentials.credentials), nro_doc,
                             f"Campos modificados: {', '.join(updates.keys())}")
        return {"status": "success", "data": resultado}
    except Exception as e:
        logger.error(f"Error: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/health")
async def health(): return {"status": "healthy", "service": "modificar_persona"}

async def _registrar_log(tipo, email, doc, desc):
    try:
        async with httpx.AsyncClient(timeout=config.SERVICE_TIMEOUT) as client:
            await client.post(f"{config.LOGS_SERVICE_URL}/registrar",
                json={"tipo_operacion": tipo, "usuario_email": email, "documento": doc, "descripcion": desc})
    except Exception as e: logger.warning(f"No se registró log: {str(e)}")

def _extraer_email(token):
    try: return jwt.decode(token, options={"verify_signature": False}).get("email", "desconocido")
    except: return "desconocido"
