from ._config import DB_URL
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.pool import QueuePool
import logging

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Create PostgreSQL engine with connection pooling
engine = create_engine(
    DB_URL,
    poolclass=QueuePool,
    pool_size=5,
    max_overflow=10,
    pool_pre_ping=True,
    pool_recycle=300,
    echo=False  # Set to True for SQL query logging
)

# # Test database connection
# try:
#     with engine.connect() as connection:
#         logger.info("✅ Successfully connected to PostgreSQL database")
# except Exception as e:
#     logger.error(f"❌ Failed to connect to PostgreSQL database: {e}")
#     raise

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()