from pydantic_settings import BaseSettings
from pydantic import Field
from typing import Optional
class Config(BaseSettings):
    """Configuración centralizada del servicio de autenticación"""

    # ========== ROBLE ==========
    ROBLE_API_URL: Optional[str] = None
    ROBLE_DB_NAME: Optional[str] = None

    @property
    def ROBLE_AUTH_LOGIN(self) -> str:
        return f"{self.ROBLE_API_URL}/auth/{self.ROBLE_DB_NAME}/login"

    @property
    def ROBLE_AUTH_VERIFY(self) -> str:
        return f"{self.ROBLE_API_URL}/auth/{self.ROBLE_DB_NAME}/verify-token"

    @property
    def ROBLE_AUTH_LOGOUT(self) -> str:
        return f"{self.ROBLE_API_URL}/auth/{self.ROBLE_DB_NAME}/logout"

    @property
    def ROBLE_AUTH_SIGNUP(self) -> str:
        return f"{self.ROBLE_API_URL}/auth/{self.ROBLE_DB_NAME}/signup"

    @property
    def ROBLE_AUTH_VERIFY_EMAIL(self) -> str:
        return f"{self.ROBLE_API_URL}/auth/{self.ROBLE_DB_NAME}/verify-email"

    # ========== TIMEOUTS ==========
    HTTP_TIMEOUT:  Optional[int] = None

    # ========== LOGGING ==========
    DEBUG: bool = Field(default=False)

    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"

config = Config()