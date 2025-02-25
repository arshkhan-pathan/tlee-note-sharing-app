from fastapi import Depends, HTTPException

from models.Users import UserRoles
from services.users_service import fastapi_users

get_current_user = fastapi_users.current_user(active=True)


async def admin_dependency(user=Depends(get_current_user)):
    if user.role != UserRoles.admin:
        raise HTTPException(status_code=403, detail="Access denied")
    return user


async def manager_dependency(user=Depends(get_current_user)):
    if user.role != UserRoles.admin and user.role != UserRoles.manager:
        raise HTTPException(status_code=403, detail="Access denied")
    return user
