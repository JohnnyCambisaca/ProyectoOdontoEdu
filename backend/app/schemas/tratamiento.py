from pydantic import BaseModel
from datetime import datetime
from typing import Optional

class TratamientoCreate(BaseModel):
    id_paciente: int
    descripcion: str
    fecha: Optional[datetime] = None  # si no mandas fecha, el backend pone la actual

class TratamientoOut(BaseModel):
    id_tratamiento: int
    id_paciente: int
    descripcion: str
    fecha: Optional[datetime] = None

    class Config:
        from_attributes = True
