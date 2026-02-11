from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import func
from app.database import get_db
from app.services.security import get_user
from app.model.progreso import ProgresoProcedimiento
from app.schemas.progreso import ProgresoCreate, ProgresoOut

router = APIRouter(prefix="/progreso", tags=["Progreso"])


def solo_estudiante(user: dict):
    if (user.get("rol") or "").upper() != "ESTUDIANTE":
        raise HTTPException(status_code=403, detail="Acceso denegado: solo ESTUDIANTE")

def solo_profesor(user: dict):
    if (user.get("rol") or "").upper() != "PROFESOR":
        raise HTTPException(status_code=403, detail="Acceso denegado: solo PROFESOR")


@router.post("/solicitar", response_model=ProgresoOut)
def solicitar_aprobacion(
    data: ProgresoCreate,
    db: Session = Depends(get_db),
    user: dict = Depends(get_user)
):
    solo_estudiante(user)

    nuevo = ProgresoProcedimiento(
        estudiante_id=int(user["sub"]),
        profesor_id=data.profesor_id,
        materia=data.materia,
        procedimiento=data.procedimiento,
        paciente_id=data.paciente_id,
        observacion=data.observacion,
        estado="PENDIENTE"
    )
    db.add(nuevo)
    db.commit()
    db.refresh(nuevo)
    return nuevo


@router.get("/estudiante/me")
def progreso_estudiante_me(
    db: Session = Depends(get_db),
    user: dict = Depends(get_user)
):
    """
    Devuelve conteo APROBADO por materia/procedimiento.
    Formato:
    {
      "aprobados": {
        "Odontologia 1": {"Procedimiento A": 2, "Procedimiento B": 1},
        "Odontologia 2": {"Procedimiento C": 3}
      }
    }
    """
    solo_estudiante(user)
    estudiante_id = int(user["sub"])

    rows = (
        db.query(
            ProgresoProcedimiento.materia.label("materia"),
            ProgresoProcedimiento.procedimiento.label("procedimiento"),
            func.count(ProgresoProcedimiento.id).label("total")
        )
        .filter(ProgresoProcedimiento.estudiante_id == estudiante_id)
        .filter(ProgresoProcedimiento.estado == "APROBADO")
        .group_by(ProgresoProcedimiento.materia, ProgresoProcedimiento.procedimiento)
        .all()
    )

    aprobados = {}
    for r in rows:
        aprobados.setdefault(r.materia, {})
        aprobados[r.materia][r.procedimiento] = int(r.total)

    return {"aprobados": aprobados}


@router.get("/profesor/inbox", response_model=list[ProgresoOut])
def inbox_profesor(
    db: Session = Depends(get_db),
    user: dict = Depends(get_user)
):
    solo_profesor(user)
    profesor_id = int(user["sub"])

    return (
        db.query(ProgresoProcedimiento)
        .filter(ProgresoProcedimiento.profesor_id == profesor_id)
        .filter(ProgresoProcedimiento.estado == "PENDIENTE")
        .order_by(ProgresoProcedimiento.created_at.desc())
        .all()
    )


@router.put("/profesor/{solicitud_id}/aprobar", response_model=ProgresoOut)
def aprobar(
    solicitud_id: int,
    db: Session = Depends(get_db),
    user: dict = Depends(get_user)
):
    solo_profesor(user)
    profesor_id = int(user["sub"])

    obj = db.query(ProgresoProcedimiento).filter(ProgresoProcedimiento.id == solicitud_id).first()
    if not obj:
        raise HTTPException(status_code=404, detail="Solicitud no encontrada")
    if obj.profesor_id != profesor_id:
        raise HTTPException(status_code=403, detail="No puedes aprobar solicitudes de otro profesor")

    obj.estado = "APROBADO"
    db.commit()
    db.refresh(obj)
    return obj


@router.put("/profesor/{solicitud_id}/denegar", response_model=ProgresoOut)
def denegar(
    solicitud_id: int,
    db: Session = Depends(get_db),
    user: dict = Depends(get_user)
):
    solo_profesor(user)
    profesor_id = int(user["sub"])

    obj = db.query(ProgresoProcedimiento).filter(ProgresoProcedimiento.id == solicitud_id).first()
    if not obj:
        raise HTTPException(status_code=404, detail="Solicitud no encontrada")
    if obj.profesor_id != profesor_id:
        raise HTTPException(status_code=403, detail="No puedes denegar solicitudes de otro profesor")

    obj.estado = "DENEGADO"
    db.commit()
    db.refresh(obj)
    return obj

@router.get("/estudiante/{id_estudiante}")
def get_progreso_estudiante(id_estudiante: int, db: Session = Depends(get_db)):
    rows = (
        db.query(ProgresoProcedimiento)
        .filter(ProgresoProcedimiento.id_estudiante == id_estudiante)
        .all()
    )
    return rows