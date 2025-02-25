from sqlalchemy.ext.asyncio import AsyncSession
from fastapi import Depends
from fastapi_users.db import SQLAlchemyUserDatabase
from database.session import get_db, async_session_maker  # Adjust path as per your project structure
from models.Users import User  # Import your User model


async def get_user_db(session: AsyncSession = Depends(get_db)):
    """
    Dependency to provide a FastAPI Users database instance.
    """
    yield SQLAlchemyUserDatabase(session, User)


async def get_async_session() -> AsyncSession:
    async with async_session_maker() as session:
        yield session
