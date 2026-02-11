from sqlalchemy import Column, Integer, String, Text, ForeignKey
from app.database import Base

class Paciente(Base):
    __tablename__ = "pacientes"
    id_paciente = Column(Integer, primary_key=True)
    cedula = Column(String)
    nombre = Column(String)
    apellido = Column(String)
    telefono = Column(String)
    direccion = Column(Text)
    creado_por = Column(Integer, ForeignKey("usuarios.id_usuario"))
