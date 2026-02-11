from sqlalchemy import Column, Integer, ForeignKey
from app.database import Base

class MetaEstudiante(Base):
    __tablename__ = "metas_estudiante"
    id = Column(Integer, primary_key=True)
    id_meta = Column(Integer, ForeignKey("metas.id_meta"))
    id_estudiante = Column(Integer, ForeignKey("usuarios.id_usuario"))
    cantidad_realizada = Column(Integer, default=0)
