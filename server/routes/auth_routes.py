from fastapi import Depends, APIRouter, HTTPException
from fastapi_users import FastAPIUsers
from models import User
from services.users_service import auth_backend, current_active_user, fastapi_users
from schemas.UsersSchema import UserCreate, UserUpdate, UserRead, LoginRequest

router = APIRouter()


@router.post("/auth/login")
async def login(data: LoginRequest, user_manager: FastAPIUsers = Depends(fastapi_users.get_user_manager)):
    user = await user_manager.authenticate(credentials=data)

    if user:
        # Issue a token if authentication is successful
        token = await auth_backend.get_strategy().write_token(user)
        return {"access_token": token, "token_type": "bearer",
                "user": {"name": user.name, "email": user.email, "role": user.role}}
    raise HTTPException(status_code=400, detail="Invalid credentials")


router.include_router(
    fastapi_users.get_register_router(UserRead, UserCreate),
    prefix="/auth",
    tags=["auth"],
)
router.include_router(
    fastapi_users.get_reset_password_router(),
    prefix="/auth",
    tags=["auth"],
)
router.include_router(
    fastapi_users.get_verify_router(UserRead),
    prefix="/auth",
    tags=["auth"],
)
router.include_router(
    fastapi_users.get_users_router(UserRead, UserUpdate),
    prefix="/user",
    tags=["user"],
)


@router.get("/authenticated-route")
async def authenticated_route(user: User = Depends(current_active_user)):
    return {"message": f"Hello {user.email}!"}
