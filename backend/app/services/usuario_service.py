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
    db.refresh(user)
    return user
