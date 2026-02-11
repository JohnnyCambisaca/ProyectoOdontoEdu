from app.model.paciente import Paciente
from app.model.usuario import Usuario
from app.services.auth import hash_password

def crear_usuario(db, data):
    user = Usuario(
        nombre=data.nombre,
        apellido=data.apellido,
        correo=data.correo,
        password_hash=hash_password(data.password),
        rol=data.rol
    )
    db.add(user)
    db.commit()
    return user

def crear_paciente(db, data, user_id):
    p = Paciente(**data.dict(), creado_por=user_id)
    db.add(p)
    db.commit()
    return p
