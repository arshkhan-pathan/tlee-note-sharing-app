import os
from dotenv import load_dotenv

load_dotenv()

# PostgreSQL connection string
DB_URL = os.getenv("DATABASE_URL") or os.getenv("NEXT_PUBLIC_DB_URL")



# JWT configuration
JWT_SECRET_KEY = os.getenv("JWT_SECRET_KEY", "your-secret-key-here")
JWT_ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", "30"))
