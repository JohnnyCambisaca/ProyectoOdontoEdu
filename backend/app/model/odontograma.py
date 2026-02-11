from sqlalchemy import Column, Integer, Date, ForeignKey
from app.database import Base

class Odontograma(Base):
    __tablename__ = "odontogramas"
    id_odontograma = Column(Integer, primary_key=True)
    id_paciente = Column(Integer, ForeignKey("pacientes.id_paciente"))
    fecha = Column(Date)
    creado_por = Column(Integer, ForeignKey("usuarios.id_usuario"))
