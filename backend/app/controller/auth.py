#login
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database import get_db
from app.schemas.auth_schemas import LoginRequest
from app.services.jwt_service import crear_token
from app.services.auth import verify_password
from app.model.usuario import Usuario

router = APIRouter(prefix="/auth", tags=["Autenticación"])

@router.post("/login")
def login(data: LoginRequest, db: Session = Depends(get_db)):
    user = db.query(Usuario).filter(Usuario.correo == data.correo).first()

    if not user or not verify_password(data.password, user.password_hash):
        raise HTTPException(status_code=401, detail="Credenciales inválidas")

    token = crear_token({"sub": str(user.id_usuario), "rol": user.rol.upper().strip()})
    return {
        "access_token": token,
        "token_type": "bearer",
        "usuario": {
            "id_usuario": user.id_usuario,
            "nombre": user.nombre,
            "apellido": user.apellido,
            "correo": user.correo,
            "rol": user.rol.upper().strip()
        }
    }
