from pydantic_settings import BaseSettings
from pydantic import Field
from typing import Optional
class Config(BaseSettings):
    """Configuración centralizada del servicio de personas"""

    # ========== ROBLE API ==========
    ROBLE_API_URL: Optional[str] = None
    ROBLE_DB_NAME: Optional[str] = None

    @property
    def ROBLE_DATABASE_URL(self) -> str:
        return f"{self.ROBLE_API_URL}/database/{self.ROBLE_DB_NAME}"

    # ========== SERVICIOS EXTERNOS ==========
    LOGS_URL: Optional[str] = None

    # ========== TIMEOUTS ==========
    ROBLE_TIMEOUT: Optional[int] = None
    SERVICE_TIMEOUT: Optional[int] = None

    # ========== TABLAS ROBLE ==========
    TABLA_PERSONAS: Optional[str] = None
    PERSONA_ID_COLUMN: Optional[str] = None

    # ========== LOGGING ==========
    DEBUG: bool = Field(default=False)
    LOG_LEVEL: str = Field(default="INFO")

    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"

config = Config()