import os
from dotenv import load_dotenv

load_dotenv()

class Config:
    """Configuración centralizada del servicio de personas"""
    
    # ========== ROBLE API ==========
    ROBLE_API_BASE_URL = os.getenv(
        "ROBLE_API_URL",
        "https://roble-api.openlab.uninorte.edu.co"
    )
    
    ROBLE_DB_NAME = os.getenv(
        "ROBLE_DB_NAME",
        "diseo_de_software_ii_908c0f07a5"
    )
    
    ROBLE_DATABASE_URL = f"{ROBLE_API_BASE_URL}/database/{ROBLE_DB_NAME}"
    
    # ========== SERVICIOS EXTERNOS ==========
    LOGS_SERVICE_URL = os.getenv(
        "LOGS_SERVICE_URL",
        "http://servicio-logs:8004"
    )
    
    # ========== TIMEOUTS ==========
    ROBLE_TIMEOUT = 30
    SERVICE_TIMEOUT = 5
    
    # ========== TABLAS ROBLE ==========
    TABLA_PERSONAS = "persona"
    PERSONA_ID_COLUMN = "nro_doc"
    
    # ========== LOGGING ==========
    DEBUG = os.getenv("DEBUG", "False") == "True"
    LOG_LEVEL = os.getenv("LOG_LEVEL", "INFO")

config = Config()