from sqlalchemy import Column, Integer, String, Float, DateTime, ForeignKey, Text, Numeric, func, Enum
from sqlalchemy.orm import relationship
from datetime import datetime
from app.config.db.db import Base  # Usa la instancia única de Base

class Rol(Base):
    __tablename__ = "roles"
    
    id = Column(Integer, primary_key=True, index=True)
    nombre = Column(String(50), nullable=False, unique=True)
    
    # Relación con usuarios
    usuarios = relationship("Usuario", back_populates="rol")

class Sucursal(Base):
    __tablename__ = "sucursales"
    
    id = Column(Integer, primary_key=True, index=True)
    nombre = Column(String(100), nullable=False)
    ciudad = Column(String(100))
    direccion = Column(Text)
    
    # Relaciones
    usuarios = relationship("Usuario", back_populates="sucursal")
    inventarios = relationship("Inventario", back_populates="sucursal")
    compras = relationship("Compra", back_populates="sucursal")
    ventas = relationship("Venta", back_populates="sucursal")

class Categoria(Base):
    __tablename__ = "categorias"
    
    id = Column(Integer, primary_key=True, index=True)
    nombre = Column(String(100), nullable=False, unique=True)
    
    # Relación con productos
    productos = relationship("Producto", back_populates="categoria")

class Producto(Base):
    __tablename__ = "productos"
    
    id = Column(Integer, primary_key=True, index=True)
    nombre = Column(String(100), nullable=False)
    descripcion = Column(Text)
    precio_compra = Column(Numeric(10, 2), nullable=False)
    precio_venta = Column(Numeric(10, 2), nullable=False)
    stock_minimo = Column(Integer, default=0)
    unidad = Column(String(20), default="unidad")
    id_categoria = Column(Integer, ForeignKey("categorias.id"), nullable=False)
    
    # Relaciones
    categoria = relationship("Categoria", back_populates="productos")
    inventarios = relationship("Inventario", back_populates="producto")
    detalles_compra = relationship("DetalleCompra", back_populates="producto")
    detalles_venta = relationship("DetalleVenta", back_populates="producto")
    detalles_movimiento = relationship("DetalleMovimiento", back_populates="producto")

class Inventario(Base):
    __tablename__ = "inventario"
    
    id = Column(Integer, primary_key=True, index=True)
    id_producto = Column(Integer, ForeignKey("productos.id"), nullable=False)
    id_sucursal = Column(Integer, ForeignKey("sucursales.id"), nullable=False)
    stock = Column(Integer, default=0)
    
    # Relaciones
    producto = relationship("Producto", back_populates="inventarios")
    sucursal = relationship("Sucursal", back_populates="inventarios")

class Compra(Base):
    __tablename__ = "compra"
    
    id = Column(Integer, primary_key=True, index=True)
    id_usuario = Column(Integer, ForeignKey("usuarios.id"), nullable=False)
    id_sucursal = Column(Integer, ForeignKey("sucursales.id"), nullable=False)
    total = Column(Numeric(10, 2))
    fecha = Column(DateTime, default=func.now())
    
    # Relaciones
    usuario = relationship("Usuario", back_populates="compras")
    sucursal = relationship("Sucursal", back_populates="compras")
    detalles = relationship("DetalleCompra", back_populates="compra")

class DetalleCompra(Base):
    __tablename__ = "detalle_compra"
    
    id = Column(Integer, primary_key=True, index=True)
    id_compra = Column(Integer, ForeignKey("compra.id"), nullable=False)
    id_producto = Column(Integer, ForeignKey("productos.id"), nullable=False)
    cantidad = Column(Integer, nullable=False)
    precio_unitario = Column(Numeric(10, 2), nullable=False)
    subtotal = Column(Numeric(10, 2), nullable=False)
    
    # Relaciones
    compra = relationship("Compra", back_populates="detalles")
    producto = relationship("Producto", back_populates="detalles_compra")

class Venta(Base):
    __tablename__ = "ventas"
    
    id = Column(Integer, primary_key=True, index=True)
    id_usuario = Column(Integer, ForeignKey("usuarios.id"), nullable=False)
    id_sucursal = Column(Integer, ForeignKey("sucursales.id"), nullable=False)
    total = Column(Numeric(10, 2))
    fecha = Column(DateTime, default=func.now())
    estado = Column(Enum('pendiente', 'entregado', 'cancelado', name='estado_venta'), default='pendiente')
    
    # Relaciones
    usuario = relationship("Usuario", back_populates="ventas")
    sucursal = relationship("Sucursal", back_populates="ventas")
    detalles = relationship("DetalleVenta", back_populates="venta")

class DetalleVenta(Base):
    __tablename__ = "detalle_venta"
    
    id = Column(Integer, primary_key=True, index=True)
    id_venta = Column(Integer, ForeignKey("ventas.id"), nullable=False)
    id_producto = Column(Integer, ForeignKey("productos.id"), nullable=False)
    cantidad = Column(Integer, nullable=False)
    precio_unitario = Column(Numeric(10, 2), nullable=False)
    subtotal = Column(Numeric(10, 2), nullable=False)
    
    # Relaciones
    venta = relationship("Venta", back_populates="detalles")
    producto = relationship("Producto", back_populates="detalles_venta")

class Auditoria(Base):
    __tablename__ = "auditoria"
    
    id = Column(Integer, primary_key=True, index=True)
    id_usuario = Column(Integer, ForeignKey("usuarios.id"))
    accion = Column(Text)
    fecha = Column(DateTime, default=func.now())
    
    # Relaciones
    usuario = relationship("Usuario", back_populates="auditorias")

class DetalleMovimiento(Base):
    __tablename__ = "detalle_movimiento"

    id = Column(Integer, primary_key=True, index=True)
    id_movimiento = Column(Integer, ForeignKey("movimientos.id"), nullable=False)
    id_producto = Column(Integer, ForeignKey("productos.id"), nullable=False)
    cantidad = Column(Integer, nullable=False)
    precio_unitario = Column(Numeric(10, 2))

    # Relaciones
    producto = relationship("Producto", back_populates="detalles_movimiento")
