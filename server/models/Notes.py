from sqlalchemy import Column, Integer, String

from database.session import Base


class Note(Base):
    __tablename__ = "notes"

    id = Column(Integer, primary_key=True, index=True)
    note = Column(String, nullable=False)
    identifier = Column(String, nullable=False, unique=True)
    author = Column(String, nullable=False)
