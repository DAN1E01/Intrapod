from pydantic import BaseModel

class UserLogin(BaseModel):
    username: str
    password: str

class UserRespone(BaseModel):
    id: int
    nombre: int
    username: str
    correo: str
    id_rol: int
    id_sucursal: int
    
    class Config:
        orm_mode = True