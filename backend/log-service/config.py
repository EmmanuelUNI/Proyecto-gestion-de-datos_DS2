from pydantic_settings import BaseSettings
from pydantic import Field

class Config(BaseSettings):
    """Configuración centralizada del servicio de logs"""

    # ========== ROBLE API ==========
    ROBLE_API_URL: str = Field(default="https://roble-api.openlab.uninorte.edu.co")
    ROBLE_DB_NAME: str = Field(default="diseo_de_software_ii_908c0f07a5")

    @property
    def ROBLE_DATABASE_URL(self) -> str:
        return f"{self.ROBLE_API_URL}/database/{self.ROBLE_DB_NAME}"

    # ========== TIMEOUTS ==========
    ROBLE_TIMEOUT: int = 30

    # ========== TABLAS ROBLE ==========
    TABLA_LOGS: str = "log"
    LOG_ID_COLUMN: str = "_id"

    # ========== LOGGING ==========
    DEBUG: bool = Field(default=False)
    LOG_LEVEL: str = Field(default="INFO")

    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"

config = Config()