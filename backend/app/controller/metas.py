from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.database import get_db
from app.schemas.meta import MetaCreate
from app.services.meta_service import crear_meta, asignar_meta, actualizar_progreso
from app.services.security import solo_profesor, get_user
from app.services.meta_service import crear_meta, ver_metas

router = APIRouter(prefix="/metas", tags=["Metas"])


@router.post("/")
def crear(data: MetaCreate, db: Session = Depends(get_db)):
    return crear_meta(db, data)

@router.post("/asignar/{meta_id}/{estudiante_id}")
def asignar(meta_id:int, estudiante_id:int, db: Session = Depends(get_db)):
    return asignar_meta(db, meta_id, estudiante_id)

@router.put("/actualizar/{estudiante_id}")
def actualizar(estudiante_id:int, db: Session = Depends(get_db)):
    actualizar_progreso(db, estudiante_id)
    return {"status":"actualizado"}

@router.post("/")
def crear_meta_api(
    data: MetaCreate,
    db: Session = Depends(get_db),
    user = Depends(solo_profesor)
):
    return crear_meta(db, data)

@router.get("/estudiante/{id}")
def ver_metas_api(
    id: int,
    db: Session = Depends(get_db),
    user = Depends(get_user)
):
    return ver_metas(db, id)