from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from datetime import timedelta
from pydantic import BaseModel
from core._db import get_db
from core._auth import (
    authenticate_admin_user, 
    create_access_token, 
    get_current_admin_user,
    get_password_hash,
    ACCESS_TOKEN_EXPIRE_MINUTES
)
from models._admin import AdminUser

router = APIRouter(prefix="/api/admin", tags=["admin"])

class AdminUserCreate(BaseModel):
    username: str
    email: str
    password: str

class AdminUserLogin(BaseModel):
    username: str
    password: str

class Token(BaseModel):
    access_token: str
    token_type: str

class AdminUserResponse(BaseModel):
    id: int
    username: str
    email: str
    is_active: bool
    is_superuser: bool

@router.post("/register", response_model=AdminUserResponse)
def create_admin_user(
    user_data: AdminUserCreate,
    db: Session = Depends(get_db)
):
    """Create a new admin user (only for initial setup)"""
    # Check if any admin users already exist
    existing_admin = db.query(AdminUser).first()
    if existing_admin:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Admin user already exists. Only one admin is allowed."
        )
    
    # Check if username or email already exists
    if db.query(AdminUser).filter(AdminUser.username == user_data.username).first():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Username already registered"
        )
    
    if db.query(AdminUser).filter(AdminUser.email == user_data.email).first():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered"
        )
    
    # Create new admin user
    hashed_password = get_password_hash(user_data.password)
    db_user = AdminUser(
        username=user_data.username,
        email=user_data.email,
        hashed_password=hashed_password,
        is_superuser=True  # First admin is superuser
    )
    
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    
    return AdminUserResponse(
        id=db_user.id,
        username=db_user.username,
        email=db_user.email,
        is_active=db_user.is_active,
        is_superuser=db_user.is_superuser
    )

@router.post("/login", response_model=Token)
def login_admin_user(
    form_data: OAuth2PasswordRequestForm = Depends(),
    db: Session = Depends(get_db)
):
    """Login admin user and get access token"""
    user = authenticate_admin_user(db, form_data.username, form_data.password)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Inactive user"
        )
    
    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": user.username}, expires_delta=access_token_expires
    )
    
    return {"access_token": access_token, "token_type": "bearer"}