from datetime import datetime
from sqlalchemy.orm import Session
from app.model.tratamiento import Tratamiento
from app.schemas.tratamiento import TratamientoCreate

def crear_tratamiento(db: Session, data: TratamientoCreate):
    t = Tratamiento(
        id_paciente=data.id_paciente,
        descripcion=data.descripcion,
        fecha=data.fecha or datetime.now()
    )
    db.add(t)
    db.commit()
    db.refresh(t)
    return t

def listar_tratamientos_paciente(db: Session, paciente_id: int):
    return db.query(Tratamiento).filter(Tratamiento.id_paciente == paciente_id).all()
