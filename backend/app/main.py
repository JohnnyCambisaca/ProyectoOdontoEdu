from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.database import Base, engine
from app.controller import auth, usuarios, pacientes, historia, odontograma, tratamientos, metas, asignaciones
from app.model.solicitud import Solicitud  # solo para registrar modelo
from app.controller.odontograma import router as odontograma_router
from app.model import progreso
from app.controller import solicitudes
from app.controller.progreso import router as progreso_router
app = FastAPI(title="ODONTOEDU - SISTEMA CLINICO ODONTOLOGICO SALESIANA")

@app.on_event("startup")
def on_startup():
    Base.metadata.create_all(bind=engine)

    # Migrar columnas nuevas en tablas existentes (SQLite)
    from sqlalchemy import inspect, text
    inspector = inspect(engine)

    # Agregar fecha_creacion a solicitudes si no existe
    if "solicitudes" in inspector.get_table_names():
        columnas = [c["name"] for c in inspector.get_columns("solicitudes")]
        if "fecha_creacion" not in columnas:
            with engine.connect() as conn:
                conn.execute(text("ALTER TABLE solicitudes ADD COLUMN fecha_creacion DATETIME"))
                conn.commit()
    
# ✅ CORS (Angular)
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:4200",
        "http://127.0.0.1:4200",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ✅ Rutas
app.include_router(auth.router)
app.include_router(usuarios.router)
app.include_router(pacientes.router)
app.include_router(historia.router)
app.include_router(odontograma.router)
app.include_router(tratamientos.router)
app.include_router(metas.router)
app.include_router(odontograma_router)
app.include_router(progreso_router)
app.include_router(solicitudes.router)
app.include_router(asignaciones.router)
