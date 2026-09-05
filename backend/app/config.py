from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    SUPABASE_URL: str
    SUPABASE_SERVICE_KEY: str

    GEMINI_API_KEY: str
    GEMINI_MODEL_FREE: str = "gemini-3.1-flash-lite"
    GEMINI_MODEL_PREMIUM: str = "gemini-3.5-flash"

    ENVIRONMENT: str = "development"
    FRONTEND_ORIGIN: str = "http://localhost:5173"

    model_config = SettingsConfigDict(env_file=".env", extra="ignore")


settings = Settings()
