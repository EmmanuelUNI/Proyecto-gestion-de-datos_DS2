from pydantic_settings import BaseSettings
from pydantic import Field
from typing import Optional
class Config(BaseSettings):
    """Configuración centralizada del servicio de logs"""

    # ========== ROBLE API ==========
    ROBLE_API_URL:  Optional[str] = None
    ROBLE_DB_NAME:  Optional[str] = None

    @property
    def ROBLE_DATABASE_URL(self) -> str:
        return f"{self.ROBLE_API_URL}/database/{self.ROBLE_DB_NAME}"

    # ========== TIMEOUTS ==========
    ROBLE_TIMEOUT: Optional[int] = None

    # ========== TABLAS ROBLE ==========
    TABLA_LOGS: Optional[str] = None
    LOG_ID_COLUMN:Optional[str] = None

    # ========== LOGGING ==========
    DEBUG: bool = Field(default=False)
    LOG_LEVEL: str = Field(default="INFO")

    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"

config = Config()