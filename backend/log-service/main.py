from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from datetime import datetime
import httpx
import os

app = FastAPI()

ROBLE_API_URL = f"https://roble-api.openlab.uninorte.edu.co/database/diseo_de_software_ii_908c0f07a5"

class RegistroLog(BaseModel):
    tipo_operacion: str
    usuario_email: str
    documento: str
    descripcion: str

@app.post("/registrar")
async def registrar_log(log: RegistroLog):
    """Registra una operación en la tabla de logs"""
    try:
        log_entry = {
            "tipo_operacion": log.tipo_operacion,
            "usuario_email": log.usuario_email,
            "documento_afectado": log.documento,
            "datos_nuevos": {"descripcion": log.descripcion},
            "fecha_transaccion": datetime.utcnow().isoformat()
        }
        
        async with httpx.AsyncClient() as client:
            response = await client.post(
                f"{ROBLE_API_URL}/insert",
                json={
                    "tableName": "log",
                    "records": [log_entry]
                }
            )
        
        return {"status": "registered"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/consultar")
async def consultar_logs(tipo: str = None, documento: str = None, fecha: str = None):
    """Consulta logs con filtros opcionales"""
    try:
        filtros = {"tableName": "log"}
        
        if tipo:
            filtros["tipo_operacion"] = tipo
        if documento:
            filtros["documento_afectado"] = documento
        # Nota: Para fecha se necesitaría lógica más compleja con comparaciones
        
        async with httpx.AsyncClient() as client:
            response = await client.get(
                f"{ROBLE_API_URL}/read",
                params=filtros
            )
        
        return response.json()
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))