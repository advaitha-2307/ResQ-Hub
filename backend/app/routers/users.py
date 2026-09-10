from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status
from ..schemas import UserOut, UserUpdateRole
from ..data import users_db
from ..dependencies import get_current_user, require_roles

router = APIRouter(prefix="/api/users", tags=["Users"])

@router.get("", response_model=List[UserOut])
async def list_users(current_user: dict = Depends(require_roles("ADMIN"))):
    return users_db

@router.get("/{id}", response_model=UserOut)
async def get_user_by_id(id: str, current_user: dict = Depends(require_roles("ADMIN"))):
    user = next((u for u in users_db if u["id"] == id), None)
    if not user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found.")
    return user

@router.put("/{id}", response_model=UserOut)
async def update_user_role(
    id: str,
    update_data: UserUpdateRole,
    current_user: dict = Depends(require_roles("ADMIN"))
):
    user = next((u for u in users_db if u["id"] == id), None)
    if not user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found.")
    user["role"] = update_data.role.value
    return user
