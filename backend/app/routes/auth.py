from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.schemas.usuario_schema import UserLogin
from app.auth.utils import authenticate_user, create_access_token
from app.config.db.db import get_db

router = APIRouter()

@router.post("/login")
def login(user: UserLogin, db: Session = Depends(get_db)):
    db_user = authenticate_user(db, user.username, user.password)
    if not db_user:
        raise HTTPException(status_code=400, detail="Usuario o contraseña incorrectos")
    access_token = create_access_token(data={
        "sub": db_user.username,
        "rol": db_user.rol.nombre,
        "nombre": db_user.nombre,  
       
    })
    return {"access_token": access_token, "token_type": "bearer", "rol": db_user.rol.nombre, "nombre": db_user.nombre}
