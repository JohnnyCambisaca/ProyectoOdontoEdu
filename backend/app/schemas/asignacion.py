from pydantic import BaseModel
from typing import Optional


class AsignacionCreate(BaseModel):
    profesor_id: int
    estudiante_id: int


class AsignacionOut(BaseModel):
    id: int
    profesor_id: int
    estudiante_id: int

    class Config:
        from_attributes = True


class EstudianteConProfesor(BaseModel):
    id_usuario: int
    nombre: str
    apellido: str
    correo: str
    rol: str

    class Config:
        from_attributes = True
