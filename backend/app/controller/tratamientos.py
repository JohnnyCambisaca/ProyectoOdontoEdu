from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.database import get_db
from app.schemas.tratamiento import TratamientoCreate, TratamientoOut
from app.services.tratamiento_service import crear_tratamiento, listar_tratamientos_paciente

router = APIRouter(prefix="/tratamientos", tags=["Tratamientos"])

@router.post("/", response_model=TratamientoOut)
def crear_tratamiento_api(data: TratamientoCreate, db: Session = Depends(get_db)):
    return crear_tratamiento(db, data)

@router.get("/paciente/{paciente_id}", response_model=list[TratamientoOut])
def listar_tratamientos_api(paciente_id: int, db: Session = Depends(get_db)):
    return listar_tratamientos_paciente(db, paciente_id)
