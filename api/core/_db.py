from ._config import DB_URL
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.pool import QueuePool
from sqlalchemy.exc import OperationalError, DisconnectionError
import logging
import os
import time
from functools import wraps

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Check if running in Vercel (serverless environment)
IS_VERCEL = os.getenv('VERCEL') == '1'

# Optimize connection pool for serverless environments
if IS_VERCEL:
    # Serverless-optimized settings
    pool_size = 1
    max_overflow = 0
    pool_recycle = 300
    pool_pre_ping = True
    connect_args = {
        'connect_timeout': 10,
        'application_name': 'tlee-notes-vercel'
    }
else:
    # Local development settings
    pool_size = 5
    max_overflow = 10
    pool_recycle = 300
    pool_pre_ping = True
    connect_args = {}

def retry_on_connection_error(max_retries=3, delay=1):
    """Decorator to retry database operations on connection errors"""
    def decorator(func):
        @wraps(func)
        def wrapper(*args, **kwargs):
            for attempt in range(max_retries):
                try:
                    return func(*args, **kwargs)
                except (OperationalError, DisconnectionError) as e:
                    if attempt == max_retries - 1:
                        logger.error(f"❌ Database connection failed after {max_retries} attempts: {e}")
                        raise
                    logger.warning(f"⚠️  Database connection attempt {attempt + 1} failed, retrying in {delay}s: {e}")
                    time.sleep(delay)
            return func(*args, **kwargs)
        return wrapper
    return decorator

# Create PostgreSQL engine with optimized connection pooling
engine = create_engine(
    DB_URL,
    poolclass=QueuePool,
    pool_size=pool_size,
    max_overflow=max_overflow,
    pool_pre_ping=pool_pre_ping,
    pool_recycle=pool_recycle,
    echo=False,  # Set to True for SQL query logging
    connect_args=connect_args
)

# Test database connection
try:
    with engine.connect() as connection:
        logger.info("✅ Successfully connected to PostgreSQL database")
        if IS_VERCEL:
            logger.info("🚀 Running in Vercel serverless environment")
except Exception as e:
    logger.error(f"❌ Failed to connect to PostgreSQL database: {e}")
    if IS_VERCEL:
        logger.warning("⚠️  This is expected during Vercel build time")
    else:
        raise

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()

@retry_on_connection_error(max_retries=3, delay=1)
def get_db():
    """Get database session with proper cleanup for serverless"""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
        # Force close connection in serverless to prevent pool exhaustion
        if IS_VERCEL:
            db.bind.dispose()