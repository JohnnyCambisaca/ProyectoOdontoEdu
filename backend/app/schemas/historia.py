from pydantic import BaseModel
from datetime import datetime
from typing import Optional

class HistoriaCreate(BaseModel):
    id_paciente: int
    motivo: str
    diagnostico: str
    observaciones: str
    fecha_registro: Optional[datetime] = None  # si no se manda, el backend pone la actual
