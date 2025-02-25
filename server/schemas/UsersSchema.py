import uuid
from typing import Optional, TypeVar, List
from pydantic import BaseModel, Field, field_validator
from fastapi_users import schemas

ID = TypeVar("ID")


class UserRead(schemas.BaseUser[uuid.UUID]):
    name: str
    role: str
    is_active: Optional[bool] = Field(None, exclude=True)
    is_superuser: Optional[bool] = Field(None, exclude=True)
    is_verified: Optional[bool] = Field(None, exclude=True)


class UserReadAdmin(schemas.BaseUser[uuid.UUID]):
    name: str
    role: str
    is_active: Optional[bool] = Field(None, exclude=True)
    is_superuser: Optional[bool] = Field(None, exclude=True)
    is_verified: Optional[bool] = Field(None, exclude=True)


class UserCreate(schemas.BaseUserCreate):
    name: str
    role: Optional[str] = "user"


class UserUpdate(schemas.BaseUserUpdate):
    name: Optional[str] = None
    role: Optional[str] = None
    password: Optional[str] = None

    @field_validator("name", "role", "password", mode="before")
    def check_not_empty(cls, value, field):
        if value is not None and value.strip() == "":
            raise ValueError(f"{field.name} should not be an empty string")
        return value


class LoginRequest(BaseModel):
    username: str
    password: str
