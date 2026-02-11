#Seguridad
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from jose import JWTError
from typing import Dict, Any
from app.services.jwt_service import verificar_token


security = HTTPBearer()


def get_user(credentials: HTTPAuthorizationCredentials = Depends(security)) -> Dict[str, Any]:
    token = credentials.credentials
    try:
        payload = verificar_token(token)
        # Normalizar rol a MAYÚSCULAS siempre
        if "rol" in payload:
            payload["rol"] = str(payload["rol"]).upper().strip()
        return payload
    except JWTError as e:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=f"Token inválido o expirado: {str(e)}"
        )


def solo_admin(user: Dict[str, Any] = Depends(get_user)):
    if user.get("rol") != "ADMIN":
        raise HTTPException(status_code=403, detail="Acceso denegado: solo ADMIN")
    return user


def solo_profesor(user: Dict[str, Any] = Depends(get_user)):
    if user.get("rol") != "PROFESOR":
        raise HTTPException(status_code=403, detail="Acceso denegado: solo PROFESOR")
    return user


def solo_estudiante(user: Dict[str, Any] = Depends(get_user)):
    if user.get("rol") != "ESTUDIANTE":
        raise HTTPException(status_code=403, detail="Acceso denegado: solo ESTUDIANTE")
    return user


def solo_admin_o_estudiante(user: Dict[str, Any] = Depends(get_user)):
    if user.get("rol") not in ["ADMIN", "ESTUDIANTE"]:
        raise HTTPException(status_code=403, detail="Acceso denegado: solo ADMIN o ESTUDIANTE")
    return user


def solo_admin_o_profesor(user: Dict[str, Any] = Depends(get_user)):
    if user.get("rol") not in ["ADMIN", "PROFESOR"]:
        raise HTTPException(status_code=403, detail="Acceso denegado: solo ADMIN o PROFESOR")
    return user
