from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, Text
from datetime import datetime
from app.database import Base

class Tratamiento(Base):
    __tablename__ = "tratamientos"
    id_tratamiento = Column(Integer, primary_key=True)
    id_paciente = Column(Integer, ForeignKey("pacientes.id_paciente"))
    id_diente = Column(Integer, ForeignKey("dientes.id_diente"))
    procedimiento = Column(String)   # Ej: Obturación, Endodoncia
    estado = Column(String)          # PROPUESTO, APROBADO, FINALIZADO
    id_estudiante = Column(Integer, ForeignKey("usuarios.id_usuario"))
    id_profesor = Column(Integer, ForeignKey("usuarios.id_usuario"))
    observacion_profesor = Column(Text)
    fecha = Column(DateTime, default=datetime.now)
    descripcion = Column(String, nullable=False)

