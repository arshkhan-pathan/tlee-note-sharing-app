import os

from dotenv import load_dotenv
from sqlalchemy.ext.asyncio import AsyncSession, async_sessionmaker, create_async_engine
from sqlalchemy.orm import DeclarativeBase
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

load_dotenv()
DB_PATH = os.getenv('SQLITE_DB_PATH', './db/db.sqlite')

DATABASE_URL = f"sqlite+aiosqlite:///{DB_PATH}"
DATABASE_URL_SYNC = f"sqlite:///{DB_PATH}"


class Base(DeclarativeBase):
    pass


engine = create_async_engine(DATABASE_URL)
async_session_maker = async_sessionmaker(engine, expire_on_commit=False)

sync_engine = create_engine(DATABASE_URL_SYNC)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=sync_engine)


async def create_db_and_tables():
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)


async def get_db() -> AsyncSession:
    """
    Dependency that provides an asynchronous SQLAlchemy session.
    Automatically manages the session lifecycle.
    """
    async with async_session_maker() as session:
        yield session


def get_sync_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
