from pydantic import BaseModel
from typing import Optional

class ProgresoCreate(BaseModel):
    materia: str
    procedimiento: str
    paciente_id: Optional[int] = None
    profesor_id: Optional[int] = None
    observacion: Optional[str] = None

class ProgresoOut(BaseModel):
    id: int
    estudiante_id: int
    profesor_id: Optional[int]
    materia: str
    procedimiento: str
    paciente_id: Optional[int]
    estado: str
    observacion: Optional[str]

    class Config:
        from_attributes = True
