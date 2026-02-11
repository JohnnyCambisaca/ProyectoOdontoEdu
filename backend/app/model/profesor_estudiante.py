from sqlalchemy import Column, Integer, ForeignKey, UniqueConstraint
from app.database import Base


class ProfesorEstudiante(Base):
    """
    Tabla intermedia (pivote) para la relación muchos-a-muchos
    entre profesores y estudiantes.
    Un profesor puede tener muchos estudiantes asignados.
    Un estudiante puede estar asignado a varios profesores.
    """
    __tablename__ = "profesor_estudiante"

    id = Column(Integer, primary_key=True, autoincrement=True)
    profesor_id = Column(Integer, ForeignKey("usuarios.id_usuario"), nullable=False)
    estudiante_id = Column(Integer, ForeignKey("usuarios.id_usuario"), nullable=False)

    # Evita duplicados: un mismo par profesor-estudiante no puede repetirse
    __table_args__ = (
        UniqueConstraint("profesor_id", "estudiante_id", name="uq_profesor_estudiante"),
    )
