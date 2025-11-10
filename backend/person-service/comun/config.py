from pydantic_settings import BaseSettings
from pydantic import Field

class Config(BaseSettings):
    """Configuración centralizada del servicio de personas"""

    # ========== ROBLE API ==========
    ROBLE_API_URL: str = Field(default="https://roble-api.openlab.uninorte.edu.co")
    ROBLE_DB_NAME: str = Field(default="diseo_de_software_ii_908c0f07a5")

    @property
    def ROBLE_DATABASE_URL(self) -> str:
        return f"{self.ROBLE_API_URL}/database/{self.ROBLE_DB_NAME}"

    # ========== SERVICIOS EXTERNOS ==========
    LOGS_SERVICE_URL: str = Field(default="http://servicio-logs:8004")

    # ========== TIMEOUTS ==========
    ROBLE_TIMEOUT: int = 30
    SERVICE_TIMEOUT: int = 5

    # ========== TABLAS ROBLE ==========
    TABLA_PERSONAS: str = "persona"
    PERSONA_ID_COLUMN: str = "nro_doc"

    # ========== LOGGING ==========
    DEBUG: bool = Field(default=False)
    LOG_LEVEL: str = Field(default="INFO")

    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"

config = Config()