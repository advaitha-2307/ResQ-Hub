import uuid
from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException, status
from ..schemas import UserCreate, UserLogin, UserOut, Token
from ..data import users_db
from ..auth import hash_password, verify_password, create_access_token
from ..dependencies import get_current_user

router = APIRouter(prefix="/api/auth", tags=["Authentication"])

@router.post("/register", response_model=Token, status_code=status.HTTP_201_CREATED)
async def register(user_in: UserCreate):
    # Check if email exists
    existing = next((u for u in users_db if u["email"].lower() == user_in.email.lower()), None)
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="An account with this email address already exists."
        )

    user_id = f"USR-{len(users_db) + 101}"
    new_user = {
        "id": user_id,
        "name": user_in.name,
        "email": user_in.email.lower(),
        "password_hash": hash_password(user_in.password),
        "role": user_in.role.value,
        "phone": user_in.phone or "",
        "is_active": True,
        "created_at": datetime.utcnow().isoformat() + "Z"
    }
    users_db.append(new_user)

    token = create_access_token(data={"sub": user_id, "email": new_user["email"], "role": new_user["role"]})
    return {
        "access_token": token,
        "token_type": "bearer",
        "user": new_user
    }

@router.post("/login", response_model=Token)
async def login(credentials: UserLogin):
    user = next((u for u in users_db if u["email"].lower() == credentials.email.lower()), None)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password."
        )
    if not verify_password(credentials.password, user["password_hash"]):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password."
        )
    if not user.get("is_active", True):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="This account has been deactivated."
        )

    token = create_access_token(data={"sub": user["id"], "email": user["email"], "role": user["role"]})
    return {
        "access_token": token,
        "token_type": "bearer",
        "user": user
    }

@router.get("/me", response_model=UserOut)
async def get_my_profile(current_user: dict = Depends(get_current_user)):
    return current_user
