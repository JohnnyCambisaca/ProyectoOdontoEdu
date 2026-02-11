from sqlalchemy import Column, Integer, String
from app.database import Base

class Diente(Base):
    __tablename__ = "dientes"
    id_diente = Column(Integer, primary_key=True)
    codigo = Column(String)   # 11,12,13...48
