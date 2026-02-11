from pydantic import BaseModel
from typing import Optional

class UsuarioCreate(BaseModel):
    nombre: str
    apellido: str
    correo: str
    password: str
    rol: str

class UsuarioOut(BaseModel):
    id_usuario: int
    nombre: str
    apellido: str
    correo: str
    rol: str

    class Config:
        from_attributes = True


class UsuarioUpdate(BaseModel):
    nombre: Optional[str] = None
    apellido: Optional[str] = None
    correo: Optional[str] = None
    password: Optional[str] = None   # opcional: si viene, se re-hashea
    activo: Optional[bool] = None
