from sqlalchemy.orm import Session
from app.model.odontograma_detalle import OdontogramaDetalle
from app.schemas.odontograma import OdontogramaDetalleCreate

def listar_por_paciente(db: Session, paciente_id: int):
    return (
        db.query(OdontogramaDetalle)
        .filter(OdontogramaDetalle.id_paciente == paciente_id)
        .all()
    )

def guardar_detalle(db: Session, data: OdontogramaDetalleCreate):
    # upsert: (paciente + diente + cara) unico
    existe = (
        db.query(OdontogramaDetalle)
        .filter(
            OdontogramaDetalle.id_paciente == data.id_paciente,
            OdontogramaDetalle.diente == data.diente,
            OdontogramaDetalle.cara == data.cara,
        )
        .first()
    )

    if existe:
        existe.estado = data.estado
        existe.nota = data.nota or ""
        db.commit()
        db.refresh(existe)
        return existe

    nuevo = OdontogramaDetalle(
        id_paciente=data.id_paciente,
        diente=data.diente,
        cara=data.cara,
        estado=data.estado,
        nota=data.nota or "",
    )
    db.add(nuevo)
    db.commit()
    db.refresh(nuevo)
    return nuevo
