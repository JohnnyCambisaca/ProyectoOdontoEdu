from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.database import get_db
from app.schemas.historia import HistoriaCreate
from app.services.historia_service import crear_historia, obtener_historia_paciente
from app.database import get_db
from app.services.security import get_user
from app.services.historia_service import obtener_historia_paciente

router = APIRouter(prefix="/historia", tags=["Historia Clínica"])


@router.post("/")
def crear(data: HistoriaCreate, db: Session = Depends(get_db)):
    return crear_historia(db, data)

@router.get("/paciente/{paciente_id}")
def ver_historia(paciente_id: int, db: Session = Depends(get_db)):
    return obtener_historia_paciente(db, paciente_id)

@router.get("/paciente/{id}")
def ver_historial(
    id: int,
    db: Session = Depends(get_db),
    user = Depends(get_user)
):
    return obtener_historia_paciente(db, id)