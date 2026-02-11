from sqlalchemy import Column, Integer, Text, DateTime, ForeignKey
from datetime import datetime
from app.database import Base

class HistoriaClinica(Base):
    __tablename__ = "historia_clinica"
    id_historia = Column(Integer, primary_key=True)
    id_paciente = Column(Integer, ForeignKey("pacientes.id_paciente"))
    motivo = Column(Text)
    diagnostico = Column(Text)
    observaciones = Column(Text)
    fecha_registro = Column(DateTime, default=datetime.now)
