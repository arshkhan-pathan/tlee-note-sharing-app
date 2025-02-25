from sqlalchemy import Column, Integer, DateTime
from database.session import Base
from datetime import datetime


class BaseModel(Base):
    __abstract__ = True  # This ensures that SQLAlchemy does not try to create a table for this model
    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
