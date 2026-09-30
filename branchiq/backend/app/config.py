"""
Application configuration loaded from environment variables / .env file.
Uses pydantic-settings for type-safe, validated settings.
"""

from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=False,
        extra="ignore",
    )

    app_env: str = "development"
    app_version: str = "0.1.0"

    # Database
    database_url: str = "sqlite:///./branchiq.db"

    # CORS — comma-separated origins
    allowed_origins: str = "http://localhost:5173"

    @property
    def origins_list(self) -> list[str]:
        return [o.strip() for o in self.allowed_origins.split(",")]


# Single shared instance — import this everywhere
settings = Settings()
