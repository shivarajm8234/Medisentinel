from datetime import timedelta
from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.auth import get_password_hash, create_access_token, get_user
from app.schemas import User, UserCreate, Token
from app.config import get_settings

router = APIRouter(prefix="/auth", tags=["auth"])
settings = get_settings()

@router.post("/token", response_model=Token)
async def login_for_access_token(
    form_data: OAuth2PasswordRequestForm = Depends(), db: AsyncSession = Depends(get_db)
):
    user = await get_user(db, form_data.username)
    from app.auth import verify_password
    if not user or not verify_password(form_data.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    access_token_expires = timedelta(minutes=settings.access_token_expire_minutes)
    access_token = create_access_token(
        data={"sub": user.username, "role": user.role}, expires_delta=access_token_expires
    )
    return {"access_token": access_token, "token_type": "bearer"}

@router.post("/register", response_model=User)
async def register_user(user: UserCreate, db: AsyncSession = Depends(get_db)):
    db_user = await get_user(db, user.username)
    if db_user:
        raise HTTPException(status_code=400, detail="Username already registered")
    
    from app.models import User as DBUser
    hashed_password = get_password_hash(user.password)
    db_user = DBUser(
        username=user.username,
        hashed_password=hashed_password,
        role=user.role,
        is_active=user.is_active
    )
    db.add(db_user)
    await db.commit()
    await db.refresh(db_user)
    return db_user
