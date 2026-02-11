from pydantic import BaseModel

class MetaCreate(BaseModel):
    procedimiento: str
    cantidad_objetivo: int
    periodo: str
    id_estudiante: int
    descripcion: str
    objetivo: int