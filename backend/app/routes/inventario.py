from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.config.db.db import get_db
from app.models.modelos import Producto, Inventario, Sucursal, Categoria, DetalleCompra, DetalleVenta
from pydantic import BaseModel
from fastapi import status

router = APIRouter(
    prefix="/inventario",
    tags=["Inventario"]
)

class ProductoCreate(BaseModel):
    nombre: str
    descripcion: str
    precio_compra: float
    precio_venta: float
    stock_minimo: int
    id_sucursal: int
    id_categoria: int

class AjusteStockRequest(BaseModel):
    id_inventario: int
    cantidad: int
    motivo: str

class ProductoUpdate(BaseModel):
    nombre: str
    descripcion: str
    precio_compra: float
    precio_venta: float
    stock_minimo: int
    id_categoria: int

@router.get("/listar")
def listar_inventario(db: Session = Depends(get_db)):
    query = (
        db.query(
            Inventario.id.label("id"),
            Producto.nombre.label("producto"),
            Producto.descripcion.label("descripcion"),
            Producto.precio_compra.label("precio_compra"),
            Producto.precio_venta.label("precio_venta"),
            Inventario.stock.label("stock"),
            Producto.stock_minimo.label("stock_minimo"),
            Sucursal.nombre.label("sucursal"),
            Categoria.nombre.label("categoria")
        )
        .join(Producto, Inventario.id_producto == Producto.id)
        .join(Sucursal, Inventario.id_sucursal == Sucursal.id)
        .join(Categoria, Producto.id_categoria == Categoria.id)
        .all()
    )
    resultado = [
        {
            "id": r.id,
            "producto": r.producto,
            "descripcion": r.descripcion,
            "precio_compra": float(r.precio_compra),
            "precio_venta": float(r.precio_venta),
            "stock": r.stock,
            "stock_minimo": r.stock_minimo,
            "sucursal": r.sucursal,
            "categoria": r.categoria
        }
        for r in query
    ]
    return {"inventario": resultado}

@router.get("/categorias")
def listar_categorias(db: Session = Depends(get_db)):
    cats = db.query(Categoria).all()
    return [{"id": c.id, "nombre": c.nombre} for c in cats]

@router.post("/agregar")
def agregar_producto(producto: ProductoCreate, db: Session = Depends(get_db)):
    # Validar que no exista un producto con el mismo nombre
    if db.query(Producto).filter(Producto.nombre == producto.nombre).first():
        raise HTTPException(status_code=400, detail="Ya existe un producto con ese nombre")
    # Crear producto
    nuevo_producto = Producto(
        nombre=producto.nombre.strip(),
        descripcion=producto.descripcion.strip(),
        precio_compra=producto.precio_compra,
        precio_venta=producto.precio_venta,
        stock_minimo=producto.stock_minimo,
        id_categoria=producto.id_categoria
    )
    db.add(nuevo_producto)
    db.commit()
    db.refresh(nuevo_producto)
    inventario = Inventario(
        id_producto=nuevo_producto.id,
        id_sucursal=producto.id_sucursal,
        stock=0
    )
    db.add(inventario)
    db.commit()
    return {"message": "Producto agregado correctamente"}

@router.post("/ajustar_stock")
def ajustar_stock(data: AjusteStockRequest, db: Session = Depends(get_db)):
    inventario = db.query(Inventario).filter(Inventario.id == data.id_inventario).first()
    if not inventario:
        raise HTTPException(status_code=404, detail="Inventario no encontrado")
    inventario.stock += data.cantidad
    db.commit()
    return {"message": "Stock ajustado correctamente", "nuevo_stock": inventario.stock}

@router.put("/editar/{id}")
def editar_producto(id: int, producto: ProductoUpdate, db: Session = Depends(get_db)):
    prod = db.query(Producto).filter(Producto.id == id).first()
    if not prod:
        raise HTTPException(status_code=404, detail="Producto no encontrado")
    prod.nombre = producto.nombre.strip()
    prod.descripcion = producto.descripcion.strip()
    prod.precio_compra = producto.precio_compra
    prod.precio_venta = producto.precio_venta
    prod.stock_minimo = producto.stock_minimo
    prod.id_categoria = producto.id_categoria
    db.commit()
    return {"message": "Producto editado correctamente"}

@router.delete("/eliminar/{id}", status_code=status.HTTP_204_NO_CONTENT)
def eliminar_producto(id: int, db: Session = Depends(get_db)):
    prod = db.query(Producto).filter(Producto.id == id).first()
    if not prod:
        raise HTTPException(status_code=404, detail="Producto no encontrado")
    # Eliminar primero los inventarios relacionados
    db.query(Inventario).filter(Inventario.id_producto == id).delete()
    # Eliminar detalles de compra relacionados
    db.query(DetalleCompra).filter(DetalleCompra.id_producto == id).delete()
    # Eliminar detalles de venta relacionados
    db.query(DetalleVenta).filter(DetalleVenta.id_producto == id).delete()
    db.delete(prod)
    db.commit()
    return
