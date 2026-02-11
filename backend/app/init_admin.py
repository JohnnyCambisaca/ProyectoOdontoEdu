from app.database import SessionLocal
from app.model.usuario import Usuario
from app.services.auth import get_password_hash

db = SessionLocal()

# Verificar si ya existe un admin
admin = db.query(Usuario).filter(Usuario.rol == "ADMIN").first()

if not admin:
    admin = Usuario(
        nombre="Administrador",
        correo="salesianos@ups.edu.ec",
        password_hash=get_password_hash("salesianos2026"),
        rol="ADMIN"
    )
    db.add(admin)
    db.commit()
    print("ADMIN creado → correo: salesianos@ups.edu.ec  password: salesianos2026")
else:
    print("ADMIN ya existe")

db.close()