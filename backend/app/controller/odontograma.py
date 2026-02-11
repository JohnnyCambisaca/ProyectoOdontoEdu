from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.database import get_db
from app.services.security import get_user   # o tu dependencia actual
from app.schemas.odontograma import OdontogramaDetalleCreate, OdontogramaDetalleOut
from app.services.odontograma_service import listar_por_paciente, guardar_detalle

router = APIRouter(prefix="/odontograma", tags=["Odontograma"])

@router.get("/paciente/{paciente_id}", response_model=list[OdontogramaDetalleOut])
def ver_odontograma_paciente(paciente_id: int, db: Session = Depends(get_db), user=Depends(get_user)):
    return listar_por_paciente(db, paciente_id)

@router.post("/detalle", response_model=OdontogramaDetalleOut)
def guardar_odontograma_detalle(data: OdontogramaDetalleCreate, db: Session = Depends(get_db), user=Depends(get_user)):
    return guardar_detalle(db, data)
