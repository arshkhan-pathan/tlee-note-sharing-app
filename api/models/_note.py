from pydantic import BaseModel
from sqlalchemy import Column, Integer, String, Text, Index, DateTime
from sqlalchemy.sql import func
from core._db import Base
from typing import Optional


class Note(Base):
    __tablename__ = "notes"

    id = Column(Integer, primary_key=True, index=True)
    note = Column(Text, nullable=False)  # Changed from String to Text for longer content
    author = Column(String(255), nullable=False)  # Added length limit
    identifier = Column(String(255), unique=True, nullable=False, index=True)
    created_at = Column(DateTime(timezone=True), default=func.now())
    updated_at = Column(DateTime(timezone=True), default=func.now(), onupdate=func.now())

    # Create composite index for better query performance
    __table_args__ = (
        Index('idx_author_created', 'author', 'created_at'),
    )


class NoteBase(BaseModel):
    note: str
    author: str


class NoteCreate(NoteBase):
    identifier: str


class NoteResponse(NoteBase):
    id: int
    identifier: str
    created_at: Optional[str] = None
    updated_at: Optional[str] = None
