from app.model.meta import Meta
from app.model.meta_estudiante import MetaEstudiante
from app.model.tratamiento import Tratamiento

def crear_meta(db, data):
    m = Meta(**data.dict())
    db.add(m)
    db.commit()
    return m

def asignar_meta(db, meta_id, estudiante_id):
    me = MetaEstudiante(id_meta=meta_id, id_estudiante=estudiante_id)
    db.add(me)
    db.commit()
    return me

def actualizar_progreso(db, estudiante_id):
    metas = db.query(MetaEstudiante).filter(
        MetaEstudiante.id_estudiante == estudiante_id
    ).all()

    for m in metas:
        total = db.query(Tratamiento).filter(
            Tratamiento.id_estudiante == estudiante_id,
            Tratamiento.procedimiento == m.meta.procedimiento,
            Tratamiento.estado == "FINALIZADO"
        ).count()

        m.cantidad_realizada = total

    db.commit()

def ver_metas(db, id_estudiante):
    return db.query(Meta).filter(Meta.id_estudiante == id_estudiante).all()