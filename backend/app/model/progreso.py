from sqlalchemy import Column, Integer, String, DateTime, ForeignKey
from sqlalchemy.sql import func
from app.database import Base

class ProgresoProcedimiento(Base):
    __tablename__ = "progreso_procedimientos"

    id = Column(Integer, primary_key=True, index=True)

    # quien lo hizo
    estudiante_id = Column(Integer, ForeignKey("usuarios.id_usuario"), nullable=False, index=True)

    # opcional: quien lo revisa
    profesor_id = Column(Integer, ForeignKey("usuarios.id_usuario"), nullable=True, index=True)

    # agrupación
    materia = Column(String, nullable=False, index=True)          # "Odontologia 1"
    procedimiento = Column(String, nullable=False, index=True)    # "Profilaxis", etc

    # paciente con el que lo hizo (si ya tienes pacientes)
    paciente_id = Column(Integer, ForeignKey("pacientes.id_paciente"), nullable=True, index=True)

    # estado: PENDIENTE / APROBADO / DENEGADO
    estado = Column(String, nullable=False, default="PENDIENTE", index=True)

    # nota opcional
    observacion = Column(String, nullable=True)

    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
