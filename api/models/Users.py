from fastapi_users.db import SQLAlchemyBaseUserTableUUID
from sqlalchemy import Column, String
from enum import Enum
from models import BaseModel
from sqlalchemy import Enum as SQLEnum


class UserRoles(Enum):
    admin = "admin"
    manager = "manager"
    user = "user"


class User(SQLAlchemyBaseUserTableUUID, BaseModel):
    __tablename__ = "users"
    name = Column(String, nullable=False)
    role = Column(SQLEnum(UserRoles), default=UserRoles.manager)
    hashed_password = Column(String, nullable=False)


