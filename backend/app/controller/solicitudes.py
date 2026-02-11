from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database import get_db
from app.model.solicitud import Solicitud
from app.model.paciente import Paciente
from app.model.usuario import Usuario
from app.model.profesor_estudiante import ProfesorEstudiante
from app.schemas.solicitudes import SolicitudCreate
from app.services.security import get_user

router = APIRouter(prefix="/solicitudes", tags=["Solicitudes"])


def _enriquecer_solicitud(s: Solicitud, db: Session) -> dict:
    pac = db.query(Paciente).filter(Paciente.id_paciente == s.paciente_id).first()
    est = db.query(Usuario).filter(Usuario.id_usuario == s.estudiante_id).first()
    return {
        "id_solicitud": s.id_solicitud,
        "paciente_id": s.paciente_id,
        "paciente_nombre": f"{pac.nombre} {pac.apellido}" if pac else "—",
        "estudiante_id": s.estudiante_id,
        "estudiante_nombre": f"{est.nombre} {est.apellido}" if est else "—",
        "motivo": s.motivo,
        "nota": s.nota,
        "estado": s.estado,
        "fecha_creacion": s.fecha_creacion.isoformat() if s.fecha_creacion else None,
    }


def _ids_estudiantes_del_profesor(profesor_id: int, db: Session) -> list[int]:
    """Retorna los IDs de estudiantes asignados a este profesor."""
    asignaciones = db.query(ProfesorEstudiante).filter(
        ProfesorEstudiante.profesor_id == profesor_id
    ).all()
    return [a.estudiante_id for a in asignaciones]


@router.post("/")
def crear_solicitud(data: SolicitudCreate, db: Session = Depends(get_db), user=Depends(get_user)):
    if user["rol"] not in ["ESTUDIANTE", "ADMIN", "PROFESOR"]:
        raise HTTPException(status_code=403, detail="Solo estudiantes pueden enviar solicitudes")

    nueva = Solicitud(
        paciente_id=data.paciente_id,
        estudiante_id=int(user["sub"]),
        motivo=data.motivo,
        nota=data.nota,
        estado="PENDIENTE"
    )
    db.add(nueva)
    db.commit()
    db.refresh(nueva)
    return {"message": "Solicitud enviada", "id_solicitud": nueva.id_solicitud}


@router.get("/inbox")
def inbox_profesor(db: Session = Depends(get_db), user=Depends(get_user)):
    """Inbox: solo solicitudes PENDIENTES de estudiantes asignados al profesor."""
    rol = user.get("rol", "")

    if rol == "ADMIN":
        # Admin ve todas las pendientes
        solicitudes = db.query(Solicitud).filter(Solicitud.estado == "PENDIENTE").all()
    elif rol == "PROFESOR":
        # Profesor solo ve solicitudes de SUS estudiantes asignados
        ids_est = _ids_estudiantes_del_profesor(int(user["sub"]), db)
        if not ids_est:
            return []
        solicitudes = db.query(Solicitud).filter(
            Solicitud.estado == "PENDIENTE",
            Solicitud.estudiante_id.in_(ids_est)
        ).all()
    else:
        raise HTTPException(status_code=403, detail="No autorizado")

    return [_enriquecer_solicitud(s, db) for s in solicitudes]


@router.post("/{id_solicitud}/aprobar")
def aprobar(id_solicitud: int, db: Session = Depends(get_db), user=Depends(get_user)):
    if user["rol"] not in ["PROFESOR", "ADMIN"]:
        raise HTTPException(status_code=403, detail="Solo profesor puede aprobar")

    s = db.query(Solicitud).filter(Solicitud.id_solicitud == id_solicitud).first()
    if not s:
        raise HTTPException(status_code=404, detail="Solicitud no encontrada")

    # Verificar que el profesor tiene asignado a este estudiante
    if user["rol"] == "PROFESOR":
        ids_est = _ids_estudiantes_del_profesor(int(user["sub"]), db)
        if s.estudiante_id not in ids_est:
            raise HTTPException(status_code=403, detail="Este estudiante no está asignado a usted")

    s.estado = "APROBADO"
    db.commit()
    return {"message": "Solicitud aprobada"}


@router.post("/{id_solicitud}/denegar")
def denegar(id_solicitud: int, db: Session = Depends(get_db), user=Depends(get_user)):
    if user["rol"] not in ["PROFESOR", "ADMIN"]:
        raise HTTPException(status_code=403, detail="Solo profesor puede denegar")

    s = db.query(Solicitud).filter(Solicitud.id_solicitud == id_solicitud).first()
    if not s:
        raise HTTPException(status_code=404, detail="Solicitud no encontrada")

    if user["rol"] == "PROFESOR":
        ids_est = _ids_estudiantes_del_profesor(int(user["sub"]), db)
        if s.estudiante_id not in ids_est:
            raise HTTPException(status_code=403, detail="Este estudiante no está asignado a usted")

    s.estado = "DENEGADO"
    db.commit()
    return {"message": "Solicitud denegada"}


@router.get("/todas")
def listar_todas_solicitudes(
    db: Session = Depends(get_db),
    user=Depends(get_user),
):
    """Historial: profesor ve solo las de sus estudiantes, admin ve todas."""
    rol = user.get("rol", "")

    if rol == "ADMIN":
        solicitudes = db.query(Solicitud).order_by(Solicitud.id_solicitud.desc()).all()
    elif rol == "PROFESOR":
        ids_est = _ids_estudiantes_del_profesor(int(user["sub"]), db)
        if not ids_est:
            return []
        solicitudes = db.query(Solicitud).filter(
            Solicitud.estudiante_id.in_(ids_est)
        ).order_by(Solicitud.id_solicitud.desc()).all()
    else:
        # Estudiante ve las suyas propias
        solicitudes = db.query(Solicitud).filter(
            Solicitud.estudiante_id == int(user["sub"])
        ).order_by(Solicitud.id_solicitud.desc()).all()

    return [_enriquecer_solicitud(s, db) for s in solicitudes]


@router.get("/me")
def solicitudes_estudiante_actual(
    usuario=Depends(get_user),
    db: Session = Depends(get_db)
):
    solicitudes = db.query(Solicitud).filter(
        Solicitud.estudiante_id == int(usuario["sub"])
    ).all()
    return [_enriquecer_solicitud(s, db) for s in solicitudes]
