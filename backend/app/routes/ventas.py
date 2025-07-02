from fastapi import APIRouter, Depends, HTTPException, status, Body
from sqlalchemy.orm import Session
from sqlalchemy import func
from app.config.db.db import get_db
from app.models.modelos import Venta, DetalleVenta, Producto, Sucursal, Inventario
from app.models.usuario import Usuario
from app.schemas.esquemas import VentaCreate, VentaResponse, DetalleVentaCreate, DetalleVentaResponse
from app.auth.utils import get_current_user
from typing import List
from datetime import datetime

router = APIRouter(
    prefix="/ventas",
    tags=["Ventas"]
)

@router.get("/listar", response_model=List[VentaResponse])
def listar_ventas(db: Session = Depends(get_db), current_user=Depends(get_current_user)):
    # Obtener información del usuario actual
    usuario_actual = current_user  # current_user ya es un objeto Usuario
    
    # Si es administrador, puede ver todas las ventas
    if usuario_actual.rol and usuario_actual.rol.nombre == 'administrador':
        ventas = db.query(Venta).all()
    # Si es empacador, solo puede ver las ventas de su sucursal
    elif usuario_actual.rol and usuario_actual.rol.nombre == 'empacador':
        if not usuario_actual.id_sucursal:
            raise HTTPException(status_code=400, detail="El empacador no tiene una sucursal asignada")
        ventas = db.query(Venta).filter(Venta.id_sucursal == usuario_actual.id_sucursal).all()
    else:
        # Otros roles pueden ver solo sus propias ventas
        ventas = db.query(Venta).filter(Venta.id_usuario == usuario_actual.id).all()
    
    # Para empacadores, agregar información de cantidad de productos
    if usuario_actual.rol and usuario_actual.rol.nombre == 'empacador':
        ventas_con_cantidad = []
        for venta in ventas:
            # Calcular cantidad total de productos en la venta
            cantidad_productos = db.query(func.sum(DetalleVenta.cantidad)).filter(DetalleVenta.id_venta == venta.id).scalar() or 0
            # Crear un diccionario con la información de la venta + cantidad
            venta_dict = {
                "id": venta.id,
                "id_usuario": venta.id_usuario,
                "id_sucursal": venta.id_sucursal,
                "fecha": venta.fecha,
                "total": venta.total,
                "estado": venta.estado,
                "cantidad_productos": cantidad_productos
            }
            ventas_con_cantidad.append(venta_dict)
        return ventas_con_cantidad
    
    return ventas

@router.post("/crear", response_model=VentaResponse)
def crear_venta(venta: VentaCreate, db: Session = Depends(get_db)):
    nueva_venta = Venta(
        id_usuario=venta.id_usuario,
        id_sucursal=venta.id_sucursal,
        total=venta.total or 0,
        fecha=datetime.now(),
        estado='pendiente'
    )
    db.add(nueva_venta)
    db.commit()
    db.refresh(nueva_venta)
    total = 0
    for det in venta.detalles:
        producto = db.query(Producto).filter(Producto.id == det['id_producto']).first()
        if not producto:
            db.rollback()
            raise HTTPException(status_code=404, detail=f"Producto ID {det['id_producto']} no encontrado")
        # Buscar inventario para ese producto y sucursal
        inventario = db.query(Inventario).filter(Inventario.id_producto == det['id_producto'], Inventario.id_sucursal == venta.id_sucursal).first()
        if not inventario:
            db.rollback()
            raise HTTPException(status_code=404, detail=f"No hay inventario para el producto {producto.nombre} en la sucursal seleccionada")
        if inventario.stock < det['cantidad']:
            db.rollback()
            raise HTTPException(status_code=400, detail=f"Stock insuficiente para el producto {producto.nombre}. Stock disponible: {inventario.stock}")
        # Descontar stock
        inventario.stock -= det['cantidad']
        subtotal = det['cantidad'] * float(det['precio_unitario'])
        detalle = DetalleVenta(
            id_venta=nueva_venta.id,
            id_producto=det['id_producto'],
            cantidad=det['cantidad'],
            precio_unitario=det['precio_unitario'],
            subtotal=subtotal
        )
        db.add(detalle)
        total += subtotal
    nueva_venta.total = total
    db.commit()
    db.refresh(nueva_venta)
    return nueva_venta

@router.put("/editar/{id}", response_model=VentaResponse)
def editar_venta(id: int, venta: VentaCreate, db: Session = Depends(get_db)):
    v = db.query(Venta).filter(Venta.id == id).first()
    if not v:
        raise HTTPException(status_code=404, detail="Venta no encontrada")
    v.id_usuario = venta.id_usuario
    v.id_sucursal = venta.id_sucursal
    v.fecha = datetime.now()
    # Eliminar detalles antiguos
    db.query(DetalleVenta).filter(DetalleVenta.id_venta == id).delete()
    total = 0
    for det in venta.detalles:
        producto = db.query(Producto).filter(Producto.id == det['id_producto']).first()
        if not producto:
            db.rollback()
            raise HTTPException(status_code=404, detail=f"Producto ID {det['id_producto']} no encontrado")
        # Buscar inventario para ese producto y sucursal
        inventario = db.query(Inventario).filter(Inventario.id_producto == det['id_producto'], Inventario.id_sucursal == venta.id_sucursal).first()
        if not inventario:
            db.rollback()
            raise HTTPException(status_code=404, detail=f"No hay inventario para el producto {producto.nombre} en la sucursal seleccionada")
        if inventario.stock < det['cantidad']:
            db.rollback()
            raise HTTPException(status_code=400, detail=f"Stock insuficiente para el producto {producto.nombre}. Stock disponible: {inventario.stock}")
        # Descontar stock
        inventario.stock -= det['cantidad']
        subtotal = det['cantidad'] * float(det['precio_unitario'])
        detalle = DetalleVenta(
            id_venta=id,
            id_producto=det['id_producto'],
            cantidad=det['cantidad'],
            precio_unitario=det['precio_unitario'],
            subtotal=subtotal
        )
        db.add(detalle)
        total += subtotal
    v.total = total
    db.commit()
    db.refresh(v)
    return v

@router.delete("/eliminar/{id}", status_code=status.HTTP_204_NO_CONTENT)
def eliminar_venta(id: int, db: Session = Depends(get_db)):
    v = db.query(Venta).filter(Venta.id == id).first()
    if not v:
        raise HTTPException(status_code=404, detail="Venta no encontrada")
    db.query(DetalleVenta).filter(DetalleVenta.id_venta == id).delete()
    db.delete(v)
    db.commit()
    return None

@router.get("/detalle/{id}", response_model=List[DetalleVentaResponse])
def detalle_venta(id: int, db: Session = Depends(get_db)):
    detalles = db.query(DetalleVenta).filter(DetalleVenta.id_venta == id).all()
    return detalles

@router.patch("/estado/{id}", response_model=VentaResponse)
def actualizar_estado_venta(id: int, estado: str = Body(..., embed=True), db: Session = Depends(get_db)):
    v = db.query(Venta).filter(Venta.id == id).first()
    if not v:
        raise HTTPException(status_code=404, detail="Venta no encontrada")
    # Solo permitir los valores correctos
    if estado not in ["pendiente", "entregado", "cancelado"]:
        raise HTTPException(status_code=400, detail="Estado inválido")
    v.estado = estado
    db.commit()
    db.refresh(v)
    return v
