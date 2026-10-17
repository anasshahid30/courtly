from functools import lru_cache

from pydantic import model_validator
from pydantic_settings import BaseSettings, SettingsConfigDict

DEV_DEFAULT_SECRET = "dev-only-change-me"


class Settings(BaseSettings):
    COURTLY_ENV: str = "development"
    JWT_SECRET: str = DEV_DEFAULT_SECRET
    DATABASE_URL: str = "sqlite:///./courtly.db"
    CORS_ORIGINS: str = "http://localhost:3000,http://127.0.0.1:3000"

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore",
    )

    @property
    def cors_origins_list(self) -> list[str]:
        return [origin.strip() for origin in self.CORS_ORIGINS.split(",") if origin.strip()]

    @model_validator(mode="after")
    def validate_production_jwt(self) -> "Settings":
        if self.COURTLY_ENV.strip().lower() == "production" and (
            not self.JWT_SECRET or self.JWT_SECRET.strip() == DEV_DEFAULT_SECRET
        ):
            raise ValueError(
                "Production configuration error: JWT_SECRET must be configured with a secure, non-default secret when COURTLY_ENV is 'production'."
            )
        return self


@lru_cache
def get_settings() -> Settings:
    return Settings()


settings = get_settings()
