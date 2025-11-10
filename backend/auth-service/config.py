
import os
from dotenv import load_dotenv

load_dotenv()

class Config:
    """Configuración centralizada del servicio de autenticación"""
    
    # ROBLE - Estos son tus valores exactos
    ROBLE_DB_NAME = os.getenv(
        "ROBLE_DB_NAME", 
        "diseo_de_software_ii_908c0f07a5"
    )
    ROBLE_API_URL = os.getenv(
        "ROBLE_API_URL",
        "https://roble-api.openlab.uninorte.edu.co"
    )
    
    # URLs construidas
    ROBLE_AUTH_LOGIN = f"{ROBLE_API_URL}/auth/{ROBLE_DB_NAME}/login"
    ROBLE_AUTH_VERIFY = f"{ROBLE_API_URL}/auth/{ROBLE_DB_NAME}/verify-token"
    ROBLE_AUTH_LOGOUT = f"{ROBLE_API_URL}/auth/{ROBLE_DB_NAME}/logout"
    
    # Timeouts
    HTTP_TIMEOUT = 30
    
    # Logging
    DEBUG = os.getenv("DEBUG", "False") == "True"

config = Config()

