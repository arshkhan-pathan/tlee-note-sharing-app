from typing import List

from fastapi import APIRouter, Depends, HTTPException
from fastapi_users.password import PasswordHelper
from sqlalchemy.exc import IntegrityError
from sqlalchemy.ext.asyncio import AsyncSession
from starlette import status
from starlette.responses import JSONResponse
from sqlalchemy.future import select
from dependencies import get_user_db, get_async_session
from models import User
from models.Users import UserRoles
from schemas.UsersSchema import UserCreate, UserRead, UserUpdate, UserReadAdmin
from dependencies.auth import manager_dependency

router = APIRouter(prefix="/users", tags=["Users"])

password_helper = PasswordHelper()


@router.post("/create-user", response_model=UserRead)
async def create_manager_user(
        user: UserCreate,
        created_by=Depends(manager_dependency),
        user_db=Depends(get_user_db),
):
    """Endpoint for admin to create a manager user."""
    try:
        # Validate role
        if user.role not in UserRoles.__members__:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid role. Role must be 'manager' or  'user'"
            )
        if created_by.role == UserRoles.manager and user.role in [UserRoles.manager.value, UserRoles.admin.value]:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail=f"{user.role} Users cannot be created with this role"
            )

        # Hash the password
        hashed_password = password_helper.hash(user.password)

        # Prepare user data
        create_dict = {
            "email": user.email,
            "hashed_password": hashed_password,
            "is_active": True,
            "is_superuser": False,
            "role": user.role,
            "name": user.name
        }

        # Create user in database
        new_user = await user_db.create(create_dict)
        return new_user

    except IntegrityError as e:
        # Handle database integrity issues like duplicate email
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="A user with this email already exists."
        ) from e

    except ValueError as e:
        # Handle issues like invalid password format or validation errors
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail=str(e)
        ) from e

    except Exception as e:
        # Catch all other unexpected errors
        return JSONResponse(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            content={"detail": "An unexpected error occurred.", "error": str(e)},
        )


@router.put("/{user_id}", response_model=UserRead)
async def update_user(
        user_id: str,
        user_update: UserUpdate,  # Or create a separate `UserUpdate` schema for partial updates
        action_by=Depends(manager_dependency),
        user_db=Depends(get_user_db),
):
    """Endpoint for admin to update a user."""
    try:
        existing_user = await user_db.get(user_id)
        if not existing_user:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="User not found."
            )
        if not existing_user:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="User not found."
            )

        if action_by.role == UserRoles.manager and existing_user.role == UserRoles.manager:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Manager Users cannot be edit with this role"
            )

        # Update fields
        updated_data = {
            "email": user_update.email or existing_user.email,
            "hashed_password": (
                password_helper.hash(user_update.password) if user_update.password else existing_user.hashed_password
            ),
            "is_active": user_update.is_active if user_update.is_active is not None else existing_user.is_active,
            "role": user_update.role or existing_user.role,
            "name": user_update.name or existing_user.name
        }

        updated_user = await user_db.update(existing_user, updated_data)
        return updated_user

    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail=str(e)
        ) from e

    except Exception as e:
        return JSONResponse(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            content={"detail": "An unexpected error occurred.", "error": str(e)},
        )


@router.delete("/{user_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_user(
        user_id: str,
        action_by=Depends(manager_dependency),
        user_db=Depends(get_user_db),
):
    """Endpoint for admin to delete a user."""
    try:
        user = await user_db.get(user_id)
        if not user:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="User not found."
            )

        if action_by.role == UserRoles.manager and user.role == UserRoles.manager:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Manager Users cannot be deleted with this role"
            )

        await user_db.delete(user)


    except Exception as e:
        return JSONResponse(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            content={"detail": f"{str(e)}"},
        )


@router.get("/", response_model=List[UserReadAdmin])
async def get_all_users(
        created_by=Depends(manager_dependency),
        session: AsyncSession = Depends(get_async_session),
):
    """Endpoint for admin to get all users."""
    try:
        # Query all users from the database
        result = await session.execute(
            select(User))
        users = result.unique().scalars().all()
        return users

    except Exception as e:
        return JSONResponse(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            content={"detail": "An unexpected error occurred.", "error": str(e)},
        )
