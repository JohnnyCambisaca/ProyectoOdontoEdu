from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import func

from app.database import get_db
from app.model.usuario import Usuario
from app.model.profesor_estudiante import ProfesorEstudiante
from app.schemas.asignacion import AsignacionCreate, AsignacionOut
from app.services.security import solo_admin, solo_admin_o_profesor, get_user

router = APIRouter(prefix="/asignaciones", tags=["Asignaciones Profesor-Estudiante"])


# ──────────────────────────────────────────────
# 1) ASIGNAR un estudiante a un profesor
# ──────────────────────────────────────────────
@router.post("/", response_model=AsignacionOut)
def asignar_estudiante(
    data: AsignacionCreate,
    db: Session = Depends(get_db),
    user=Depends(solo_admin),
):
    prof = db.query(Usuario).filter(
        Usuario.id_usuario == data.profesor_id,
        func.upper(Usuario.rol) == "PROFESOR"
    ).first()
    if not prof:
        raise HTTPException(status_code=404, detail="Profesor no encontrado")

    est = db.query(Usuario).filter(
        Usuario.id_usuario == data.estudiante_id,
        func.upper(Usuario.rol) == "ESTUDIANTE"
    ).first()
    if not est:
        raise HTTPException(status_code=404, detail="Estudiante no encontrado")

    # ── Relación 1:1: un estudiante solo puede tener UN profesor ──
    # Si ya está asignado al MISMO profesor, no hacer nada
    existe_mismo = db.query(ProfesorEstudiante).filter(
        ProfesorEstudiante.profesor_id == data.profesor_id,
        ProfesorEstudiante.estudiante_id == data.estudiante_id,
    ).first()
    if existe_mismo:
        raise HTTPException(status_code=400, detail="El estudiante ya está asignado a este profesor")

    # Si está asignado a OTRO profesor, eliminamos la asignación anterior
    anteriores = db.query(ProfesorEstudiante).filter(
        ProfesorEstudiante.estudiante_id == data.estudiante_id,
    ).all()
    for ant in anteriores:
        db.delete(ant)

    nueva = ProfesorEstudiante(
        profesor_id=data.profesor_id,
        estudiante_id=data.estudiante_id,
    )
    db.add(nueva)
    db.commit()
    db.refresh(nueva)
    return nueva


# ──────────────────────────────────────────────
# 2) DESASIGNAR
# ──────────────────────────────────────────────
@router.delete("/")
def desasignar_estudiante(
    data: AsignacionCreate,
    db: Session = Depends(get_db),
    user=Depends(solo_admin),
):
    registro = db.query(ProfesorEstudiante).filter(
        ProfesorEstudiante.profesor_id == data.profesor_id,
        ProfesorEstudiante.estudiante_id == data.estudiante_id,
    ).first()
    if not registro:
        raise HTTPException(status_code=404, detail="Asignación no encontrada")

    db.delete(registro)
    db.commit()
    return {"ok": True, "msg": "Estudiante desasignado del profesor"}


# ──────────────────────────────────────────────
# 3) Estudiantes de UN profesor (admin o profesor)
# ──────────────────────────────────────────────
@router.get("/profesor/{profesor_id}/estudiantes")
def estudiantes_de_profesor(
    profesor_id: int,
    db: Session = Depends(get_db),
    user=Depends(solo_admin_o_profesor),
):
    asignaciones = db.query(ProfesorEstudiante).filter(
        ProfesorEstudiante.profesor_id == profesor_id
    ).all()

    ids = [a.estudiante_id for a in asignaciones]
    if not ids:
        return []

    return db.query(Usuario).filter(Usuario.id_usuario.in_(ids)).all()


# ──────────────────────────────────────────────
# 4) MIS estudiantes (profesor logueado)
# ──────────────────────────────────────────────
@router.get("/mis-estudiantes")
def mis_estudiantes(
    db: Session = Depends(get_db),
    user=Depends(get_user),
):
    rol = user.get("rol", "")
    if rol not in ["PROFESOR", "ADMIN"]:
        raise HTTPException(status_code=403, detail="Solo PROFESOR o ADMIN")

    profesor_id = int(user.get("sub"))

    asignaciones = db.query(ProfesorEstudiante).filter(
        ProfesorEstudiante.profesor_id == profesor_id
    ).all()

    ids = [a.estudiante_id for a in asignaciones]
    if not ids:
        return []

    return db.query(Usuario).filter(Usuario.id_usuario.in_(ids)).all()


# ──────────────────────────────────────────────
# 5) MIS pacientes (pacientes de mis estudiantes asignados)
# ──────────────────────────────────────────────
@router.get("/mis-pacientes")
def mis_pacientes(
    db: Session = Depends(get_db),
    user=Depends(get_user),
):
    from app.model.paciente import Paciente

    rol = user.get("rol", "")
    if rol not in ["PROFESOR", "ADMIN"]:
        raise HTTPException(status_code=403, detail="Solo PROFESOR o ADMIN")

    profesor_id = int(user.get("sub"))

    asignaciones = db.query(ProfesorEstudiante).filter(
        ProfesorEstudiante.profesor_id == profesor_id
    ).all()

    ids_est = [a.estudiante_id for a in asignaciones]
    if not ids_est:
        return []

    return db.query(Paciente).filter(Paciente.creado_por.in_(ids_est)).all()


# ──────────────────────────────────────────────
# 6) TODAS las asignaciones (admin)
# ──────────────────────────────────────────────
@router.get("/todas")
def listar_todas(
    db: Session = Depends(get_db),
    user=Depends(solo_admin),
):
    asignaciones = db.query(ProfesorEstudiante).all()
    resultado = []

    for a in asignaciones:
        prof = db.query(Usuario).filter(Usuario.id_usuario == a.profesor_id).first()
        est = db.query(Usuario).filter(Usuario.id_usuario == a.estudiante_id).first()
        resultado.append({
            "id": a.id,
            "profesor_id": a.profesor_id,
            "profesor_nombre": f"{prof.nombre} {prof.apellido}" if prof else "—",
            "estudiante_id": a.estudiante_id,
            "estudiante_nombre": f"{est.nombre} {est.apellido}" if est else "—",
        })

    return resultado


# ──────────────────────────────────────────────
# 7) Mi profesor (para el estudiante logueado)
# ──────────────────────────────────────────────
@router.get("/mi-profesor")
def mi_profesor(
    db: Session = Depends(get_db),
    user=Depends(get_user),
):
    """Devuelve el profesor asignado al estudiante logueado."""
    estudiante_id = int(user.get("sub"))

    asignacion = db.query(ProfesorEstudiante).filter(
        ProfesorEstudiante.estudiante_id == estudiante_id
    ).first()

    if not asignacion:
        return None

    prof = db.query(Usuario).filter(Usuario.id_usuario == asignacion.profesor_id).first()
    if not prof:
        return None

    return {
        "id_usuario": prof.id_usuario,
        "nombre": prof.nombre,
        "apellido": prof.apellido,
        "correo": prof.correo,
    }
