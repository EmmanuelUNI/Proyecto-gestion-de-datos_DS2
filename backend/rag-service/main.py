from fastapi import FastAPI, HTTPException, Depends, Header
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from pydantic import BaseModel
from typing import Optional
import httpx
from roble_db import RobleDB

app = FastAPI()
security = HTTPBearer()
roble = RobleDB()

LOGS_SERVICE = "http://servicio-logs:8004"

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

@app.post("/crear")
async def crear_persona(request: CrearPersonaRequest, 
                       credentials: HTTPAuthorizationCredentials = Depends(security)):
    """Crea una nueva persona con validaciones"""
    try:
       
        # Verificar que no exista previamente
        existente = await roble.obtener_persona(request.nro_doc, credentials.credentials)
        if existente:
            raise HTTPException(status_code=409, detail="Documento ya registrado")
        # Insertar en ROBLE
        persona_data = {
            "primer_nombre": request.primer_nombre,
            "segundo_nombre": request.segundo_nombre or "",
            "apellidos": request.apellidos,
            "fecha_nacimiento": request.fecha_nacimiento,
            "genero": request.genero,
            "correo": request.correo,
            "celular": request.celular,
            "nro_doc": request.nro_doc,
            "tipo_doc": request.tipo_doc
        }
        resultado = await roble.insertar_persona(persona_data, credentials.credentials)
        
        # Registrar en log
        await _registrar_log(
            tipo_operacion="CREAR",
            usuario_email=_extraer_email(credentials.credentials),
            documento=request.nro_doc,
            descripcion=f"Creada persona: {request.primer_nombre} {request.apellidos}"
        )
        
        return {"status": "success", "data": resultado}
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/consultar/{nro_doc}")
async def consultar_persona(nro_doc: str, 
                           credentials: HTTPAuthorizationCredentials = Depends(security)):
    """Consulta una persona por documento"""
    
    try:
        resultado = await roble.obtener_persona(nro_doc, credentials.credentials)
        
        if not resultado:
            raise HTTPException(status_code=404, detail="Persona no encontrada")
        
        # Registrar en log
        await _registrar_log(
            tipo_operacion="CONSULTAR",
            usuario_email=_extraer_email(credentials.credentials),
            documento=nro_doc,
            descripcion="Consultada información personal"
        )
        
        return {"status": "success", "data": resultado}
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.put("/modificar/{nro_doc}")
async def modificar_persona(nro_doc: str, 
                           request: dict, 
                           credentials: HTTPAuthorizationCredentials = Depends(security)):
    """Modifica datos de una persona existente"""
    
    try:
        # Verificar que existe
        existente = await roble.obtener_persona(nro_doc, credentials.credentials)
        if not existente:
            raise HTTPException(status_code=404, detail="Persona no encontrada")
        
        resultado = await roble.actualizar_persona(nro_doc, request, credentials.credentials)
        
        # Registrar en log
        await _registrar_log(
            tipo_operacion="MODIFICAR",
            usuario_email=_extraer_email(credentials.credentials),
            documento=nro_doc,
            descripcion=f"Modificados campos: {', '.join(request.keys())}"
        )
        
        return {"status": "success", "data": resultado}
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.delete("/eliminar/{nro_doc}")
async def eliminar_persona(nro_doc: str, 
                          credentials: HTTPAuthorizationCredentials = Depends(security)):
    """Elimina una persona"""
    
    try:
        # Verificar que existe
        existente = await roble.obtener_persona(nro_doc, credentials.credentials)
        if not existente:
            raise HTTPException(status_code=404, detail="Persona no encontrada")
        
        # Eliminar
        resultado = await roble.eliminar_persona(nro_doc, credentials.credentials)
        
        # Registrar en log
        await _registrar_log(
            tipo_operacion="ELIMINAR",
            usuario_email=_extraer_email(credentials.credentials),
            documento=nro_doc,
            descripcion="Eliminada persona del sistema"
        )
        
        return {"status": "success", "message": "Persona eliminada"}
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

async def _registrar_log(tipo_operacion, usuario_email, documento, descripcion):
    """Registra operación en servicio de logs"""
    try:
        async with httpx.AsyncClient() as client:
            await client.post(
                f"{LOGS_SERVICE}/registrar",
                json={
                    "tipo_operacion": tipo_operacion,
                    "usuario_email": usuario_email,
                    "documento": documento,
                    "descripcion": descripcion
                }
            )
    except:
        pass  # No bloquear si falla el log

def _extraer_email(token):
    """Extrae email del token (implementación simplificada)"""
    import jwt
    try:
        payload = jwt.decode(token, options={"verify_signature": False})
        return payload.get("email", "desconocido")
    except:
        return "desconocido"