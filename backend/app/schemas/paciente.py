from pydantic import BaseModel
from typing import Optional

class PacienteCreate(BaseModel):
    cedula: str
    nombre: str
    apellido: str
    telefono: str
    direccion: str
    

class PacienteUpdate(BaseModel):
    cedula: Optional[str] = None
    nombre: Optional[str] = None
    apellido: Optional[str] = None
    telefono: Optional[str] = None
    direccion: Optional[str] = None
