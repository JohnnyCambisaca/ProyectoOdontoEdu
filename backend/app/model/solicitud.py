from sqlalchemy import Column, Integer, String, Text, ForeignKey, DateTime
from datetime import datetime
from app.database import Base

class Solicitud(Base):
    __tablename__ = "solicitudes"

    id_solicitud = Column(Integer, primary_key=True, index=True)
    paciente_id = Column(Integer, ForeignKey("pacientes.id_paciente"))
    estudiante_id = Column(Integer, ForeignKey("usuarios.id_usuario"))

    motivo = Column(String(150), default="Aprobación de procedimiento")
    nota = Column(Text, nullable=True)

    estado = Column(String(20), default="PENDIENTE")  # PENDIENTE / APROBADO / DENEGADO
    fecha_creacion = Column(DateTime, default=datetime.now)
