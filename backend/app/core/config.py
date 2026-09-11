from functools import lru_cache

from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8", extra="ignore")

    APP_NAME: str = "E-Commerce Tracking System"
    APP_ENV: str = "development"

   # DATABASE_URL: str = "mysql+pymysql://root:office123@localhost:3306/ecommerce_tracking"
    DATABASE_URL: str = "mysql+pymysql://tracking_:vastraliya@123@localhost:3306/ecommerce_tracking"

    JWT_SECRET: str = "change_this_secret"
    JWT_ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    REFRESH_TOKEN_EXPIRE_DAYS: int = 7

    FRONTEND_URL: str = "http://localhost:5173","https://tracking.vastraliya.com/"

    @property
    def is_production(self) -> bool:
        return self.APP_ENV.lower() == "production"


@lru_cache
def get_settings() -> Settings:
    return Settings()


settings = get_settings()
