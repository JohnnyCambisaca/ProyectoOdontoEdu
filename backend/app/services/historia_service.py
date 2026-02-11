from app.model.historia import HistoriaClinica

def crear_historia(db, data):
    historia = HistoriaClinica(**data.dict())
    db.add(historia)
    db.commit()
    db.refresh(historia)
    return historia

def obtener_historia_paciente(db, paciente_id):
    return db.query(HistoriaClinica).filter(
        HistoriaClinica.id_paciente == paciente_id
    ).all()
