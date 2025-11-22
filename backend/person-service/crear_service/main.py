from fastapi import FastAPI, HTTPException, Depends, Form, File, UploadFile
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from pydantic import BaseModel
from typing import Optional
import httpx, logging, jwt
import io, re, base64, csv, os, sys, asyncio
from datetime import datetime

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
    
@app.post("/cargar-archivo")
async def cargar_archivo(
    delimitador: str = Form(...),
    archivo: UploadFile = File(...),
    credentials: HTTPAuthorizationCredentials = Depends(security)
):
    try:
        contenido = await archivo.read()
        texto = contenido.decode("utf-8")

        reader = csv.DictReader(io.StringIO(texto), delimiter=delimitador)

        resultados = {
            "total": 0,
            "insertadas": 0,
            "errores": []  
        }

        filas = list(reader)
        resultados["total"] = len(filas)

        for idx, fila in enumerate(filas, start=1):

            errores = validar_persona(fila)
            if errores:
                resultados["errores"].append({
                    "fila": idx,
                    "motivo": errores
                })
                continue

            # Verificar si ya existe
            existente = await roble.obtener_persona(fila["nro_doc"], credentials.credentials)
            if existente:
                resultados["errores"].append({
                    "fila": idx,
                    "motivo": ["Documento ya existe"]
                })
                continue


            try:
                await roble.insertar_persona(fila, credentials.credentials)
                resultados["insertadas"] += 1
                await _registrar_log(
                    "CREAR",
                    _extraer_email(credentials.credentials),
                    fila.get("nro_doc"),
                    f"Creada persona {fila.get('primer_nombre', '')} {fila.get('apellidos', '')}",
                    credentials.credentials
                )
            except Exception as e:
                resultados["errores"].append({
                    "fila": idx,
                    "motivo": [str(e)]
                })
                continue

        return resultados

    except Exception as e:
        return {
            "status": "error",
            "msg": f"Error procesando archivo: {str(e)}"
        }

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


import re
import base64
from datetime import datetime

def validar_persona(fila):
    errores = []

    # ------------------------- CAMPOS OBLIGATORIOS -------------------------
    obligatorios = [
        "primer_nombre", "apellidos", "fecha_nacimiento", "genero",
        "correo", "celular", "nro_doc", "tipo_doc"
    ]
    for campo in obligatorios:
        if not fila.get(campo):
            errores.append(f"{campo} es obligatorio")

    # ------------------------- NOMBRES Y APELLIDOS -------------------------
    def validar_texto(campo, valor, max_len):
        if any(char.isdigit() for char in valor):
            errores.append(f"{campo} no puede contener números")
        if len(valor) > max_len:
            errores.append(f"{campo} no puede superar {max_len} caracteres")

    if fila.get("primer_nombre"):
        validar_texto("primer_nombre", fila["primer_nombre"], 30)

    if fila.get("segundo_nombre"):
        validar_texto("segundo_nombre", fila["segundo_nombre"], 30)

    if fila.get("apellidos"):
        validar_texto("apellidos", fila["apellidos"], 60)

    # ------------------------- FECHA NACIMIENTO -------------------------
    # Formato dd-mmm  (01-ene, 12-feb, 03-dic)

    if fila.get("fecha_nacimiento"):
        try:
            datetime.strptime(fila["fecha_nacimiento"], "%Y-%m-%d")
        except ValueError:
            errores.append("fecha_nacimiento inválida (YYYY-MM-DD)")

    # ------------------------- GÉNERO -------------------------
    generos_validos = ["Masculino", "Femenino", "No binario", "Prefiero no reportar"]

    if fila.get("genero") and fila["genero"] not in generos_validos:
        errores.append(f"género inválido. Debe ser uno de: {', '.join(generos_validos)}")

    # ------------------------- EMAIL -------------------------
    if fila.get("correo") and not re.match(r"^[^@]+@[^@]+\.[^@]+$", fila["correo"]):
        errores.append("correo inválido")

    # ------------------------- CELULAR -------------------------
    if fila.get("celular") and not re.match(r"^\d{10}$", fila["celular"]):
        errores.append("celular inválido (debe tener 10 dígitos numéricos)")

    # ------------------------- DOCUMENTO -------------------------
    # Debe ser número, máximo 10 dígitos
    if fila.get("nro_doc") and not re.match(r"^\d{1,10}$", fila["nro_doc"]):
        errores.append("nro_doc debe ser numérico y máximo 10 dígitos")

    # ------------------------- TIPO DOCUMENTO -------------------------
    tipos_validos = ["Tarjeta de identidad", "Cédula"]

    if fila.get("tipo_doc") and fila["tipo_doc"] not in tipos_validos:
        errores.append(f"tipo_doc inválido. Valores permitidos: {', '.join(tipos_validos)}")

    # ------------------------- FOTO BASE64 (≤ 2MB) -------------------------
    if fila.get("foto"):
        try:
            data = base64.b64decode(fila["foto"])
            if len(data) > 2 * 1024 * 1024:  # 2 MB
                errores.append("foto supera los 2MB")
        except Exception:
            errores.append("foto no es base64 válido")

    return errores
