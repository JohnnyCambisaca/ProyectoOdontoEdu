from app.model.paciente import Paciente

def crear_paciente(db, data, user_id: int):
    paciente = Paciente(
        nombre=data.nombre,
        apellido=data.apellido,
        cedula=data.cedula,
        telefono=data.telefono,
        direccion=data.direccion,
        creado_por=user_id  # ✅ columna real del modelo
    )
    db.add(paciente)
    db.commit()
    db.refresh(paciente)
    return paciente