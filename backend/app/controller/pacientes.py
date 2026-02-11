from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.database import get_db
from app.schemas.paciente import PacienteCreate
from app.services.security import get_user, solo_admin_o_estudiante
from app.services.paciente_service import crear_paciente
from app.model.paciente import Paciente
from fastapi import HTTPException
from app.schemas.paciente import PacienteUpdate


router = APIRouter(prefix="/pacientes", tags=["Pacientes"])


# ✅ Crear paciente (solo estudiante)
@router.post("/")
def crear_paciente_api(
    data: PacienteCreate,
    db: Session = Depends(get_db),
    user = Depends(solo_admin_o_estudiante)
):
    # sub viene como string → convertir a int para creado_por (FK)
    return crear_paciente(db, data, int(user["sub"]))


# ✅ Listar pacientes
# Admin/Profesor ven todos, Estudiante solo los suyos
@router.get("/")
def listar_pacientes(
    db: Session = Depends(get_db),
    user=Depends(get_user)
):
    rol = user.get("rol", "")
    if rol == "ESTUDIANTE":
        return db.query(Paciente).filter(
            Paciente.creado_por == int(user["sub"])
        ).all()
    # Admin y Profesor ven todos
    return db.query(Paciente).all()



@router.put("/{id_paciente}")
def actualizar_paciente_api(
    id_paciente: int,
    data: PacienteUpdate,
    db: Session = Depends(get_db),
    user=Depends(solo_admin_o_estudiante),
):
    paciente = db.query(Paciente).filter(Paciente.id_paciente == id_paciente).first()
    if not paciente:
        raise HTTPException(status_code=404, detail="Paciente no encontrado")

    # solo actualiza lo que venga
    if data.cedula is not None:
        paciente.cedula = data.cedula
    if data.nombre is not None:
        paciente.nombre = data.nombre
    if data.apellido is not None:
        paciente.apellido = data.apellido
    if data.telefono is not None:
        paciente.telefono = data.telefono
    if data.direccion is not None:
        paciente.direccion = data.direccion

    db.commit()
    db.refresh(paciente)
    return paciente


@router.delete("/{id_paciente}")
def eliminar_paciente_api(
    id_paciente: int,
    db: Session = Depends(get_db),
    user=Depends(solo_admin_o_estudiante),
):
    paciente = db.query(Paciente).filter(Paciente.id_paciente == id_paciente).first()
    if not paciente:
        raise HTTPException(status_code=404, detail="Paciente no encontrado")

    db.delete(paciente)
    db.commit()
    return {"ok": True, "msg": "Paciente eliminado"}
