from sqlalchemy import Column, Integer, String
from app.database import Base

class Meta(Base):
    __tablename__ = "metas"
    id_meta = Column(Integer, primary_key=True)
    procedimiento = Column(String)   # Ej: "Limpieza"
    cantidad_objetivo = Column(Integer)
    periodo = Column(String)         # Ej: "2025-A"
