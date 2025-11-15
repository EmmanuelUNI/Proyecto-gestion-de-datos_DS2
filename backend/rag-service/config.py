from pydantic_settings import BaseSettings
from pydantic import Field
from typing import Optional
class Config(BaseSettings):
    """Configuración del servicio RAG con Google Gemini"""

    # ========== ROBLE API ==========
    ROBLE_API_URL: str = Field(default="https://roble-api.openlab.uninorte.edu.co")
    ROBLE_DB_NAME: str = Field(default="diseo_de_software_ii_908c0f07a5")

    @property
    def ROBLE_DATABASE_URL(self) -> str:
        return f"{self.ROBLE_API_URL}/database/{self.ROBLE_DB_NAME}"

    # ========== GOOGLE AI STUDIO / GEMINI ==========
    GOOGLE_API_KEY: Optional[str] = None
    GOOGLE_MODEL:  Optional[str] = None

    # ========== SERVICIOS ==========
    LOGS_URL:  Optional[str] = None

    # ========== TIMEOUTS ==========
    ROBLE_TIMEOUT:  Optional[int] = None
    GOOGLE_TIMEOUT:  Optional[int] = None
    SERVICE_TIMEOUT:  Optional[int] = None

    # ========== TABLAS ROBLE ==========
    TABLA_PERSONAS: Optional[str] = None

    # ========== LOGGING ==========
    DEBUG: bool = Field(default=False)

    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"

config = Config()