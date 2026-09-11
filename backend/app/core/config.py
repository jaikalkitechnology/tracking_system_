from functools import lru_cache

from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8", extra="ignore")

    APP_NAME: str = "E-Commerce Tracking System"
    APP_ENV: str = "development"

    DATABASE_URL: str = "mysql+pymysql://root:password@localhost:3306/ecommerce_tracking"

    JWT_SECRET: str = "change_this_secret"
    JWT_ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    REFRESH_TOKEN_EXPIRE_DAYS: int = 7

    # Hardcoded default so CORS works in production even if FRONTEND_URL is
    # never set as an environment variable on the server. Override via the
    # FRONTEND_URL env var (comma-separated for multiple origins) if needed.
    FRONTEND_URL: str = "https://tracking.vastraliya.com,http://localhost:5173"

    @property
    def is_production(self) -> bool:
        return self.APP_ENV.lower() == "production"

    @property
    def cors_origins(self) -> list[str]:
        """FRONTEND_URL may be a single origin or a comma-separated list, e.g.
        "https://tracking.example.com,http://localhost:5173"."""
        return [origin.strip() for origin in self.FRONTEND_URL.split(",") if origin.strip()]


@lru_cache
def get_settings() -> Settings:
    return Settings()


settings = get_settings()
