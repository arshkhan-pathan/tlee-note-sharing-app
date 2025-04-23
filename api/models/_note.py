from pydantic import BaseModel
from sqlalchemy import Column, Integer, String
from core._db import Base


class Note(Base):
    __tablename__ = "notes"

    id = Column(Integer, primary_key=True, index=True)
    note = Column(String, nullable=False)
    author = Column(String, nullable=False)
    identifier = Column(String, unique=True, nullable=False)


class NoteBase(BaseModel):
    note: str
    author: str


class NoteCreate(NoteBase):
    identifier: str


class NoteResponse(NoteBase):
    id: int
