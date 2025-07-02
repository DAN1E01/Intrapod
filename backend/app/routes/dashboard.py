from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.auth.utils import require_role
from app.config.db.db import get_db
from app.models.modelos import Producto, Inventario, Venta, Sucursal, Rol, Categoria
from app.models.usuario import Usuario
from sqlalchemy.exc import IntegrityError
from sqlalchemy import or_, and_, and_
from passlib.hash import bcrypt
from sqlalchemy import func
from app.models.modelos import DetalleVenta

router = APIRouter()

@router.get("/dashboard/admin/data")
def admin_dashboard_data(user=Depends(require_role('administrador')), db: Session = Depends(get_db)):
    # Total productos
    total_productos = db.query(Producto).count()
    # Total stock
    total_stock = db.query(Inventario).with_entities(Inventario.stock).all()
    total_stock = sum([s[0] for s in total_stock])
    # Total ventas
    total_ventas = db.query(Venta).count()
    # Suma de ventas
    suma_ventas = db.query(Venta).with_entities(Venta.total).all()
    suma_ventas = float(sum([float(s[0]) for s in suma_ventas]))
    # Lista de sucursales
    sucursales = db.query(Sucursal).all()
    sucursales_list = [{"id": s.id, "nombre": s.nombre, "ciudad": s.ciudad, "direccion": s.direccion} for s in sucursales]
    return {
        "info_cards": {
            "total_productos": total_productos,
            "total_stock": total_stock,
            "total_ventas": total_ventas,
            "suma_ventas": suma_ventas
        },
        "sucursales": sucursales_list
    }

@router.get("/dashboard/empacador/data")
def empacador_dashboard_data(user=Depends(require_role('empacador')), db: Session = Depends(get_db)):
    # Obtener información del usuario actual
    usuario_actual = user  # user ya es un objeto Usuario
    
    # Si el empacador tiene una sucursal asignada, filtrar por ella
    if usuario_actual.id_sucursal:
        # Productos de su sucursal
        total_productos = db.query(Inventario).filter(Inventario.id_sucursal == usuario_actual.id_sucursal).count()
        # Stock de su sucursal
        total_stock = db.query(Inventario).filter(Inventario.id_sucursal == usuario_actual.id_sucursal).with_entities(Inventario.stock).all()
        total_stock = sum([s[0] for s in total_stock])
        # Ventas de su sucursal (información limitada)
        total_ventas = db.query(Venta).filter(Venta.id_sucursal == usuario_actual.id_sucursal).count()
        
        # Información de las sucursales disponibles para el empacador
        sucursales = db.query(Sucursal).all()
        sucursales_list = [{"id": s.id, "nombre": s.nombre, "ciudad": s.ciudad, "direccion": s.direccion} for s in sucursales]
    else:
        # Si no tiene sucursal asignada, mostrar datos generales limitados
        total_productos = db.query(Producto).count()
        total_stock = db.query(Inventario).with_entities(Inventario.stock).all()
        total_stock = sum([s[0] for s in total_stock])
        total_ventas = db.query(Venta).count()
        # Permitir acceso a todas las sucursales
        sucursales = db.query(Sucursal).all()
        sucursales_list = [{"id": s.id, "nombre": s.nombre, "ciudad": s.ciudad, "direccion": s.direccion} for s in sucursales]
    
    return {
        "info_cards": {
            "total_productos": total_productos,
            "total_stock": total_stock,
            "total_ventas": total_ventas
        },
        "sucursales": sucursales_list
    }

@router.get("/dashboard/admin/users")
def admin_users_list(user=Depends(require_role('administrador')), db: Session = Depends(get_db)):
    usuarios = db.query(Usuario).all()
    result = []
    for u in usuarios:
        result.append({
            "id": u.id,
            "nombre": u.nombre,
            "username": u.username,
            "correo": u.correo,
            "rol": u.rol.nombre if u.rol else None,
            "sucursal": u.sucursal.nombre if u.sucursal else None,
            "fecha_creacion": u.fecha_creacion.strftime('%Y-%m-%d %H:%M:%S') if u.fecha_creacion else None
        })
    return {"usuarios": result}

@router.post("/dashboard/admin/users")
def crear_usuario(
    data: dict,  
    user=Depends(require_role('administrador')),
    db: Session = Depends(get_db)
):
    nombre = data.get("nombre", "").strip()
    username = data.get("username", "").strip()
    correo = data.get("correo", "").strip()
    contraseña = data.get("contraseña", "")
    rol_nombre = data.get("rol")
    id_sucursal = data.get("id_sucursal")

    # Validaciones básicas
    if not nombre or not username or not correo or not contraseña or not rol_nombre:
        raise HTTPException(status_code=400, detail="Todos los campos obligatorios deben estar completos.")
    if " " in username:
        raise HTTPException(status_code=400, detail="El username no puede contener espacios.")
    # Unicidad
    if db.query(Usuario).filter(or_(Usuario.username == username, Usuario.correo == correo)).first():
        raise HTTPException(status_code=400, detail="El username o correo ya está registrado.")
    # Buscar rol
    rol = db.query(Rol).filter(Rol.nombre == rol_nombre).first()
    if not rol:
        raise HTTPException(status_code=400, detail="Rol no válido.")
    # Buscar sucursal (opcional)
    sucursal = None
    if id_sucursal:
        sucursal = db.query(Sucursal).filter(Sucursal.id == id_sucursal).first()
        if not sucursal:
            raise HTTPException(status_code=400, detail="Sucursal no válida.")
    # Crear usuario
    nuevo_usuario = Usuario(
        nombre=nombre,
        username=username,
        correo=correo,
        contraseña=bcrypt.hash(contraseña),
        id_rol=rol.id,
        id_sucursal=sucursal.id if sucursal else None
    )
    db.add(nuevo_usuario)
    try:
        db.commit()
        db.refresh(nuevo_usuario)
    except IntegrityError:
        db.rollback()
        raise HTTPException(status_code=400, detail="No se pudo crear el usuario (duplicado o error de datos).")
    return {"message": "Usuario creado exitosamente"}

@router.get("/dashboard/admin/productos-mas-vendidos")
def productos_mas_vendidos(db: Session = Depends(get_db)):
    resultados = (
        db.query(
            Producto.nombre,
            Sucursal.nombre.label("sucursal"),
            func.sum(DetalleVenta.cantidad).label("unidades_vendidas"),
            func.sum(DetalleVenta.subtotal).label("total_vendido")
        )
        .join(DetalleVenta, DetalleVenta.id_producto == Producto.id)
        .join(Venta, DetalleVenta.id_venta == Venta.id)
        .join(Sucursal, Venta.id_sucursal == Sucursal.id)
        .group_by(Producto.id, Sucursal.id)
        .order_by(func.sum(DetalleVenta.cantidad).desc())
        .limit(10)
        .all()
    )
    return [
        {
            "producto": r[0],
            "sucursal": r[1],
            "unidades_vendidas": r[2],
            "total_vendido": r[3]
        }
        for r in resultados
    ]

@router.get("/dashboard/admin/ventas_por_mes")
def ventas_por_mes(user=Depends(require_role('administrador')), db: Session = Depends(get_db)):
    from datetime import datetime
    meses = ["Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"]
    ventas = db.query(Venta).all()
    conteo = [0]*12
    for v in ventas:
        if v.fecha:
            mes = v.fecha.month-1
            conteo[mes] += float(v.total)
    return {"labels": meses, "data": conteo}

@router.get("/dashboard/admin/inventario_por_categoria")
def inventario_por_categoria(user=Depends(require_role('administrador')), db: Session = Depends(get_db)):
    # Usar la relación con Categoria
    categorias = db.query(Categoria).all()
    labels = [c.nombre for c in categorias]
    data = []
    for cat in categorias:
        stock = db.query(Inventario).join(Producto, Inventario.id_producto==Producto.id).filter(Producto.id_categoria==cat.id).with_entities(func.sum(Inventario.stock)).scalar() or 0
        data.append(stock)
    return {"labels": labels, "data": data}

@router.get("/dashboard/admin/proporcion_productos")
def proporcion_productos(user=Depends(require_role('administrador')), db: Session = Depends(get_db)):
    categorias = db.query(Categoria).all()
    labels = [c.nombre for c in categorias]
    data = []
    for cat in categorias:
        count = db.query(Producto).filter(Producto.id_categoria==cat.id).count()
        data.append(count)
    return {"labels": labels, "data": data}

@router.get("/dashboard/admin/ventas_por_producto")
def ventas_por_producto(user=Depends(require_role('administrador')), db: Session = Depends(get_db)):
    resultados = (
        db.query(
            Producto.nombre,
            func.sum(DetalleVenta.cantidad).label("unidades_vendidas")
        )
        .join(DetalleVenta, DetalleVenta.id_producto == Producto.id)
        .group_by(Producto.id)
        .order_by(func.sum(DetalleVenta.cantidad).desc())
        .limit(10)
        .all()
    )
    labels = [r[0] for r in resultados]
    data = [r[1] for r in resultados]
    return {"labels": labels, "data": data}

@router.get("/dashboard/empacador/productos-mas-vendidos")
def productos_mas_vendidos_empacador(user=Depends(require_role('empacador')), db: Session = Depends(get_db)):
    # Obtener información del usuario actual
    usuario_actual = user  # user ya es un objeto Usuario
    
    # Base query para productos más vendidos
    query = (
        db.query(
            Producto.nombre,
            Sucursal.nombre.label("sucursal"),
            func.sum(DetalleVenta.cantidad).label("total_vendido"),
            Inventario.stock.label("stock_actual")
        )
        .join(DetalleVenta, DetalleVenta.id_producto == Producto.id)
        .join(Venta, DetalleVenta.id_venta == Venta.id)
        .join(Sucursal, Venta.id_sucursal == Sucursal.id)
        .join(Inventario, and_(Inventario.id_producto == Producto.id, Inventario.id_sucursal == Sucursal.id))
        .group_by(Producto.id, Sucursal.id, Inventario.stock)
    )
    
    # Si el empacador tiene sucursal asignada, filtrar por ella
    if usuario_actual.id_sucursal:
        query = query.filter(Venta.id_sucursal == usuario_actual.id_sucursal)
    
    resultados = query.order_by(func.sum(DetalleVenta.cantidad).desc()).limit(10).all()
    
    return [
        {
            "producto": r[0],
            "sucursal": r[1],
            "total_vendido": r[2],
            "stock_actual": r[3]
        }
        for r in resultados
    ]

@router.get("/dashboard/empacador/users")
def empacador_users_list(user=Depends(require_role('empacador')), db: Session = Depends(get_db)):
    # Los empacadores pueden ver la lista de usuarios para crear ventas
    usuarios = db.query(Usuario).all()
    result = []
    for u in usuarios:
        result.append({
            "id": u.id,
            "nombre": u.nombre,
            "username": u.username,
            "correo": u.correo,
            "rol": u.rol.nombre if u.rol else None,
            "sucursal": u.sucursal.nombre if u.sucursal else None,
            "fecha_creacion": u.fecha_creacion.strftime('%Y-%m-%d %H:%M:%S') if u.fecha_creacion else None
        })
    return {"usuarios": result}