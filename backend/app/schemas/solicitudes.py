from pydantic import BaseModel
from typing import Optional

class SolicitudCreate(BaseModel):
    paciente_id: int
    motivo: str = "Aprobación de procedimiento"
    nota: Optional[str] = None

class SolicitudOut(BaseModel):
    id_solicitud: int
    paciente_id: int
    estudiante_id: int
    profesor_id: Optional[int]
    estado: str
    comentario: Optional[str] = None
    payload_json: Optional[str] = None

    class Config:
        from_attributes = True
