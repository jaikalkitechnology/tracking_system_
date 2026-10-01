from app.core.config import Settings


def test_cors_origins_single():
    settings = Settings(FRONTEND_URL="https://tracking.vastraliya.com")
    assert settings.cors_origins == ["https://tracking.vastraliya.com"]


def test_cors_origins_comma_separated():
    settings = Settings(FRONTEND_URL="https://tracking.vastraliya.com, http://localhost:5173")
    assert settings.cors_origins == ["https://tracking.vastraliya.com", "http://localhost:5173"]


def test_cors_origins_trims_blank_entries():
    settings = Settings(FRONTEND_URL="https://tracking.vastraliya.com,,")
    assert settings.cors_origins == ["https://tracking.vastraliya.com"]
