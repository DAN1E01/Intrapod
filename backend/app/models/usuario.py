from sqlalchemy import Column,Integer,String, ForeignKey,TIMESTAMP
from sqlalchemy.orm import relationship
from app.config.db.db import Base

# IMPORTA Rol, Sucursal, Compra, Venta, Auditoria para registrar los modelos en el mismo módulo
from app.models.modelos import Rol, Sucursal, Compra, Venta, Auditoria

class Usuario(Base):
    __tablename__= 'usuarios'
    id = Column(Integer,primary_key=True, index=True)
    nombre = Column(String(100), nullable=False)
    username= Column(String(50), unique=True,nullable=False)
    correo = Column(String(100), unique=True,nullable=False)
    contraseña = Column(String(255),nullable=False)
    id_rol = Column(Integer,ForeignKey('roles.id'),nullable=False)
    id_sucursal = Column(Integer,ForeignKey('sucursales.id'))
    fecha_creacion = Column(TIMESTAMP)
    # Relaciones
    rol = relationship("Rol", back_populates="usuarios")
    sucursal = relationship("Sucursal", back_populates="usuarios")
    compras = relationship("Compra", back_populates="usuario")
    ventas = relationship("Venta", back_populates="usuario")
    auditorias = relationship("Auditoria", back_populates="usuario")
