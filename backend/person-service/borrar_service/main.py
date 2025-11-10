from fastapi import FastAPI, HTTPException, Depends
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
import httpx, logging, jwt
from comun.roble_db import RobleDB
from comun.config import config

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)
app = FastAPI(title="Servicio Eliminar Persona")
security = HTTPBearer()
roble = RobleDB()

@app.delete("/eliminar/{nro_doc}")
async def eliminar_persona(nro_doc: str, credentials: HTTPAuthorizationCredentials = Depends(security)):
    try:
        existente = await roble.obtener_persona(nro_doc, credentials.credentials)
        if not existente:
            raise HTTPException(status_code=404, detail="Persona no encontrada")

        resultado = await roble.eliminar_persona(nro_doc, credentials.credentials)
        await _registrar_log("ELIMINAR", _extraer_email(credentials.credentials), nro_doc, "Persona eliminada")
        return {"status": "success", "message": "Persona eliminada", "data": resultado}
    except Exception as e:
        logger.error(f"Error: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/health")
async def health(): return {"status": "healthy", "service": "eliminar_persona"}

async def _registrar_log(tipo, email, doc, desc):
    try:
        async with httpx.AsyncClient(timeout=config.SERVICE_TIMEOUT) as client:
            await client.post(f"{config.LOGS_SERVICE_URL}/registrar",
                json={"tipo_operacion": tipo, "usuario_email": email, "documento": doc, "descripcion": desc})
    except Exception as e: logger.warning(f"No se registró log: {str(e)}")

def _extraer_email(token):
    try: return jwt.decode(token, options={"verify_signature": False}).get("email", "desconocido")
    except: return "desconocido"
