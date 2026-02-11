from sqlalchemy import Column, Integer, String, ForeignKey
from app.database import Base

class OdontogramaDetalle(Base):
    __tablename__ = "odontograma_detalle"

    id_detalle = Column(Integer, primary_key=True, index=True)
    id_paciente = Column(Integer, ForeignKey("pacientes.id_paciente"), nullable=False, index=True)

    diente = Column(String, nullable=False)     # "11", "12", ..., "48"
    cara = Column(String, nullable=False)
    estado = Column(String, nullable=False, default="SANO")
    nota = Column(String, nullable=True, default="")
