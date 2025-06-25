from fastapi import APIRouter, Depends, HTTPException, Body
from sqlalchemy.orm import Session
from app.config.db.db import get_db
from app.models.usuario import Usuario
from app.models.modelos import Rol
from pydantic import BaseModel
from typing import Optional
from passlib.hash import bcrypt

router = APIRouter()

class UsuarioUpdate(BaseModel):
    nombre: Optional[str]
    username: Optional[str]
    correo: Optional[str]
    contraseña: Optional[str] = None
    rol: Optional[str]  # nombre del rol
    id_sucursal: Optional[int]

@router.put("/usuarios/editar/{id}")
def editar_usuario(id: int, datos: UsuarioUpdate = Body(...), db: Session = Depends(get_db)):
    usuario = db.query(Usuario).filter(Usuario.id == id).first()
    if not usuario:
        raise HTTPException(status_code=404, detail="Usuario no encontrado")
    # Validaciones de unicidad
    if datos.username and datos.username != usuario.username:
        if db.query(Usuario).filter(Usuario.username == datos.username).first():
            raise HTTPException(status_code=400, detail="El username ya está en uso")
        usuario.username = datos.username
    if datos.correo and datos.correo != usuario.correo:
        if db.query(Usuario).filter(Usuario.correo == datos.correo).first():
            raise HTTPException(status_code=400, detail="El correo ya está en uso")
        usuario.correo = datos.correo
    if datos.nombre:
        usuario.nombre = datos.nombre
    if datos.contraseña:
        usuario.contraseña = bcrypt.hash(datos.contraseña)
    if datos.rol:
        rol_obj = db.query(Rol).filter(Rol.nombre == datos.rol).first()
        if not rol_obj:
            raise HTTPException(status_code=400, detail="Rol no válido")
        usuario.id_rol = rol_obj.id
    if datos.id_sucursal is not None:
        usuario.id_sucursal = datos.id_sucursal
    db.commit()
    return {"message": "Usuario actualizado correctamente"}

@router.delete("/usuarios/eliminar/{id}")
def eliminar_usuario(id: int, db: Session = Depends(get_db)):
    usuario = db.query(Usuario).filter(Usuario.id == id).first()
    if not usuario:
        raise HTTPException(status_code=404, detail="Usuario no encontrado")
    db.delete(usuario)
    db.commit()
    return {"message": "Usuario Eliminado Correctamente"}