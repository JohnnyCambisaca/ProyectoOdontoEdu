from pydantic import BaseModel
from typing import Optional

class OdontogramaDetalleCreate(BaseModel):
    id_paciente: int
    diente: str
    cara: str       # "O","M","D","V","L"
    estado: str     # "SANO","CARIES","RESTAURACION","EXTRAIDO","AUSENTE"
    nota: Optional[str] = ""

class OdontogramaDetalleOut(BaseModel):
    id_detalle: int
    id_paciente: int
    diente: str
    cara: str
    estado: str
    nota: Optional[str] = ""

    class Config:
        from_attributes = True
