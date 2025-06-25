from pydantic import BaseModel, Field, EmailStr
from typing import Optional, List, Dict, Any
from datetime import datetime
from decimal import Decimal

# Esquemas para Rol
class RolBase(BaseModel):
    nombre: str

class RolCreate(RolBase):
    pass

class RolResponse(RolBase):
    id: int
    
    class Config:
        from_attributes = True

# Esquemas para Sucursal
class SucursalBase(BaseModel):
    nombre: str
    ciudad: Optional[str] = None
    direccion: Optional[str] = None

class SucursalCreate(SucursalBase):
    pass

class SucursalUpdate(SucursalBase):
    nombre: Optional[str] = None

class SucursalResponse(SucursalBase):
    id: int
    
    class Config:
        from_attributes = True

# Esquemas para Usuario
class UsuarioBase(BaseModel):
    nombre: str
    username: str
    correo: EmailStr
    id_rol: int
    id_sucursal: Optional[int] = None

class UsuarioCreate(UsuarioBase):
    contraseña: str

class UsuarioUpdate(BaseModel):
    nombre: Optional[str] = None
    username: Optional[str] = None
    correo: Optional[EmailStr] = None
    contraseña: Optional[str] = None
    id_rol: Optional[int] = None
    id_sucursal: Optional[int] = None

class UsuarioResponse(UsuarioBase):
    id: int
    fecha_creacion: datetime
    
    class Config:
        from_attributes = True

class UsuarioDetalleResponse(UsuarioResponse):
    rol: RolResponse
    sucursal: Optional[SucursalResponse] = None
    
    class Config:
        from_attributes = True

# Esquemas para Producto
class ProductoBase(BaseModel):
    nombre: str
    descripcion: Optional[str] = None
    precio_compra: Decimal = Field(gt=0)
    precio_venta: Decimal = Field(gt=0)
    stock_minimo: int = 0
    unidad: str = "unidad"

class ProductoCreate(ProductoBase):
    pass

class ProductoUpdate(BaseModel):
    nombre: Optional[str] = None
    descripcion: Optional[str] = None
    precio_compra: Optional[Decimal] = None
    precio_venta: Optional[Decimal] = None
    stock_minimo: Optional[int] = None
    unidad: Optional[str] = None

class ProductoResponse(ProductoBase):
    id: int
    
    class Config:
        from_attributes = True

# Esquemas para Inventario
class InventarioBase(BaseModel):
    id_producto: int
    id_sucursal: int
    stock: int = 0

class InventarioCreate(InventarioBase):
    pass

class InventarioUpdate(BaseModel):
    stock: Optional[int] = None

class InventarioResponse(InventarioBase):
    id: int
    
    class Config:
        from_attributes = True

class InventarioDetalleResponse(InventarioResponse):
    producto: ProductoResponse
    sucursal: SucursalResponse
    
    class Config:
        from_attributes = True

# Esquemas para Compra
class CompraBase(BaseModel):
    id_usuario: int
    id_sucursal: int
    total: Optional[Decimal] = None

class CompraCreate(CompraBase):
    detalles: List[Dict[str, Any]]  # [{id_producto: 1, cantidad: 10, precio_unitario: 100.0}]

class CompraResponse(CompraBase):
    id: int
    fecha: datetime
    
    class Config:
        from_attributes = True

# Esquemas para Detalle de Compra
class DetalleCompraBase(BaseModel):
    id_compra: int
    id_producto: int
    cantidad: int
    precio_unitario: Decimal
    subtotal: Decimal

class DetalleCompraCreate(BaseModel):
    id_producto: int
    cantidad: int
    precio_unitario: Decimal

class DetalleCompraResponse(DetalleCompraBase):
    id: int
    
    class Config:
        from_attributes = True

# Esquemas para Venta
class VentaBase(BaseModel):
    id_usuario: int
    id_sucursal: int
    total: Optional[Decimal] = None

class VentaCreate(VentaBase):
    detalles: List[Dict[str, Any]]  # [{id_producto: 1, cantidad: 10, precio_unitario: 100.0}]

class VentaResponse(VentaBase):
    id: int
    fecha: datetime
    
    class Config:
        from_attributes = True

# Esquemas para Detalle de Venta
class DetalleVentaBase(BaseModel):
    id_venta: int
    id_producto: int
    cantidad: int
    precio_unitario: Decimal
    subtotal: Decimal

class DetalleVentaCreate(BaseModel):
    id_producto: int
    cantidad: int
    precio_unitario: Decimal

class DetalleVentaResponse(DetalleVentaBase):
    id: int
    
    class Config:
        from_attributes = True

# Esquemas para Auditoria
class AuditoriaBase(BaseModel):
    id_usuario: Optional[int] = None
    accion: str

class AuditoriaCreate(AuditoriaBase):
    pass

class AuditoriaResponse(AuditoriaBase):
    id: int
    fecha: datetime
    
    class Config:
        from_attributes = True

# Esquemas para Login
class UserLogin(BaseModel):
    username: str
    contraseña: str

# Esquemas para Token
class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user_id: int
    rol: str

# Esquema para respuesta paginada
class PaginatedResponse(BaseModel):
    total: int
    page: int
    size: int
    items: List
