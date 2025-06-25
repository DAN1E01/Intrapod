from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime

# Esquemas para Categoría

class CategoriaBase(BaseModel):
    nombre: str
    descripcion: Optional[str] = None

class CategoriaCreate(CategoriaBase):
    pass

class CategoriaUpdate(CategoriaBase):
    pass

class CategoriaResponse(CategoriaBase):
    id: int
    
    class Config:
        from_attributes = True

# Esquemas para Producto

class ProductoBase(BaseModel):
    nombre: str
    descripcion: Optional[str] = None
    precio_venta: float = Field(gt=0)
    precio_costo: float = Field(gt=0)
    stock_actual: int = 0
    stock_minimo: int = 10
    unidad_medida: Optional[str] = None
    categoria_id: int

class ProductoCreate(ProductoBase):
    pass

class ProductoUpdate(BaseModel):
    nombre: Optional[str] = None
    descripcion: Optional[str] = None
    precio_venta: Optional[float] = None
    precio_costo: Optional[float] = None
    stock_actual: Optional[int] = None
    stock_minimo: Optional[int] = None
    unidad_medida: Optional[str] = None
    categoria_id: Optional[int] = None

class ProductoResponse(ProductoBase):
    id: int
    fecha_creacion: datetime
    fecha_actualizacion: datetime
    
    class Config:
        from_attributes = True

class ProductoDetalleResponse(ProductoResponse):
    categoria: CategoriaResponse
    
    class Config:
        from_attributes = True

# Esquemas para Movimiento de Inventario

class MovimientoBase(BaseModel):
    producto_id: int
    tipo_movimiento: str
    cantidad: int
    nota: Optional[str] = None

class MovimientoCreate(MovimientoBase):
    pass

class MovimientoResponse(MovimientoBase):
    id: int
    fecha_movimiento: datetime
    usuario_id: int
    
    class Config:
        from_attributes = True

# Esquemas para respuestas paginadas
class PaginatedResponse(BaseModel):
    total: int
    page: int
    size: int
    items: List
