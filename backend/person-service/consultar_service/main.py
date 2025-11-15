from fastapi import FastAPI, HTTPException, Depends
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
import httpx, logging, jwt
from comun.roble_db import RobleDB
from comun.config import config

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)
app = FastAPI(title="Servicio Consultar Persona")
security = HTTPBearer()
roble = RobleDB()

@app.get("/consultar/{nro_doc}")
async def consultar_persona(nro_doc: str, credentials: HTTPAuthorizationCredentials = Depends(security)):
    try:
        resultado = await roble.obtener_persona(nro_doc, credentials.credentials)
        if not resultado:
            raise HTTPException(status_code=404, detail="Persona no encontrada")

        await _registrar_log("CONSULTAR", _extraer_email(credentials.credentials), nro_doc, "Consulta de persona",credentials.credentials)
        return {"status": "success", "data": resultado}
    except Exception as e:
        logger.error(f"Error: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))


async def _registrar_log(tipo, email, doc, desc, token):
    try:
        headers = {"Authorization": f"Bearer {token}"}
        async with httpx.AsyncClient(timeout=config.SERVICE_TIMEOUT) as client:
            await client.post(
                f"{config.LOGS_URL}/registrar",
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

@app.get("/health")
async def health(): return {"status": "healthy", "service": "consultar_persona"}