from pydantic_settings import BaseSettings
from pydantic import Field

class Config(BaseSettings):
    """Configuración del servicio RAG con Google Gemini"""

    # ========== ROBLE API ==========
    ROBLE_API_URL: str = Field(default="https://roble-api.openlab.uninorte.edu.co")
    ROBLE_DB_NAME: str = Field(default="diseo_de_software_ii_908c0f07a5")

    @property
    def ROBLE_DATABASE_URL(self) -> str:
        return f"{self.ROBLE_API_URL}/database/{self.ROBLE_DB_NAME}"

    # ========== GOOGLE AI STUDIO / GEMINI ==========
    GOOGLE_API_KEY: str 
    GOOGLE_MODEL: str = Field(default="gemini-2.5-flash")

    # ========== SERVICIOS ==========
    LOGS_SERVICE_URL: str = Field(default="http://servicio-logs:8005")

    # ========== TIMEOUTS ==========
    ROBLE_TIMEOUT: int = Field(default=30)
    GOOGLE_TIMEOUT: int = Field(default=60)
    SERVICE_TIMEOUT: int = Field(default=5)

    # ========== TABLAS ROBLE ==========
    TABLA_PERSONAS: str = Field(default="persona")

    # ========== LOGGING ==========
    DEBUG: bool = Field(default=False)

    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"

config = Config()