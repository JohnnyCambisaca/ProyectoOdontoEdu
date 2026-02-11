from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database import get_db
from app.schemas.usuario import UsuarioCreate
from app.services.security import solo_admin, solo_admin_o_estudiante, solo_profesor, solo_admin_o_profesor
from app.services.usuario_service import crear_usuario
from app.model.usuario import Usuario
from fastapi import HTTPException
from app.model.usuario import Usuario
from app.schemas.usuario import UsuarioUpdate
from app.services.auth import get_password_hash

router = APIRouter(prefix="/usuarios", tags=["Usuarios"])

@router.post("/")
def crear_usuario_api(
    data: UsuarioCreate,
    db: Session = Depends(get_db),
    user = Depends(solo_admin_o_profesor)
):
    return crear_usuario(db, data)

@router.get("/")
def listar_usuarios(db: Session = Depends(get_db)):
    lista_usuarios = db.query(Usuario).all()
    return lista_usuarios


@router.get("/estudiantes")
def listar_estudiantes(db: Session = Depends(get_db)):
    estudiantes = db.query(Usuario).filter(Usuario.rol == "ESTUDIANTE").all()
    return estudiantes

@router.get("/profesores")
def listar_profesores(db: Session = Depends(get_db)):
    return db.query(Usuario).filter(Usuario.rol == "PROFESOR").all()

@router.get("/estudiantes/me/progreso")
def progreso_estudiante_me(
    db: Session = Depends(get_db),
    user: dict = Depends(solo_admin_o_estudiante),
):
    """
    Devuelve progreso del estudiante logueado.
    """
    rol = (user.get("rol") or "").upper()
    if rol != "ESTUDIANTE":
        raise HTTPException(status_code=403, detail="Solo ESTUDIANTE")

    estudiante_id = int(user.get("sub"))

    # ✅ Aquí calculas el progreso real
    # Como todavía no tienes tablas de progreso, te dejo 2 opciones:
    # (1) TEMPORAL: retorno fijo (para que el front funcione YA)
    # (2) REAL: contar aprobaciones desde una tabla "solicitudes" o "procedimientos_aprobados" si la creas

    aprobados = {
        "1": {"101": 0},  # Odontología 1 -> Procedimiento 101
        "2": {"201": 0},  # Odontología 2 -> Procedimiento 201
    }

    return {"estudiante_id": estudiante_id, "aprobados": aprobados}


@router.get("/estudiantes/{estudiante_id}/progreso")
def progreso_estudiante(
    estudiante_id: int,
    db: Session = Depends(get_db),
    user: dict = Depends(solo_admin_o_profesor),
):
    """
    Para profesor/admin: ver progreso de un estudiante específico.
    """
    rol = (user.get("rol") or "").upper()
    if rol not in ["PROFESOR", "ADMIN"]:
        raise HTTPException(status_code=403, detail="Solo PROFESOR o ADMIN")

    # Validar que exista el estudiante
    est = db.query(Usuario).filter(Usuario.id_usuario == estudiante_id, Usuario.rol == "ESTUDIANTE").first()
    if not est:
        raise HTTPException(status_code=404, detail="Estudiante no encontrado")

    aprobados = {
        "1": {"101": 0},
        "2": {"201": 0},
    }

    return {"estudiante_id": estudiante_id, "aprobados": aprobados}

@router.put("/{id_usuario}")
def actualizar_usuario(
    id_usuario: int,
    data: UsuarioUpdate,
    db: Session = Depends(get_db),
    user=Depends(solo_admin_o_profesor),  # o el depend que ya usas para admin
):
    u = db.query(Usuario).filter(Usuario.id_usuario == id_usuario).first()
    if not u:
        raise HTTPException(status_code=404, detail="Usuario no encontrado")

    if data.nombre is not None:
        u.nombre = data.nombre
    if data.apellido is not None:
        u.apellido = data.apellido
    if data.correo is not None:
        u.correo = data.correo
    if data.activo is not None:
        u.activo = data.activo

    # si mandan password, re-hashear
    if data.password:
        u.password_hash = get_password_hash(data.password)

    db.commit()
    db.refresh(u)
    return u


@router.delete("/{id_usuario}")
def eliminar_usuario(
    id_usuario: int,
    db: Session = Depends(get_db),
    user=Depends(solo_admin_o_profesor),
):
    u = db.query(Usuario).filter(Usuario.id_usuario == id_usuario).first()
    if not u:
        raise HTTPException(status_code=404, detail="Usuario no encontrado")

    db.delete(u)
    db.commit()
    return {"ok": True, "msg": "Usuario eliminado"}
