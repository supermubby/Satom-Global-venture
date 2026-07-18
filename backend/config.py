import os
from dotenv import load_dotenv

load_dotenv()

# ── Database ────────────────────────────────────────────────────────────────────
# In production, DATABASE_URL must be set in the environment (Render dashboard).
# For local development, create a backend/.env file with your connection string.
DATABASE_URL: str = os.getenv("DATABASE_URL", "")
if not DATABASE_URL:
    raise ValueError(
        "DATABASE_URL environment variable is not set. "
        "Please set it in your Render dashboard or create backend/.env with:\n"
        "  DATABASE_URL=postgresql+asyncpg://username:password@host:5432/database"
    )

# Optional: separate sync URL for Alembic migrations if needed
DATABASE_URL_SYNC: str = os.getenv("DATABASE_URL_SYNC", "")

APP_TITLE: str = "Satom Global Venture API"
APP_VERSION: str = "1.0.0"

# JWT & Admin Auth
SECRET_KEY = os.environ["SECRET_KEY"]
ALGORITHM: str = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES: int = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", "480"))  # 8 hours