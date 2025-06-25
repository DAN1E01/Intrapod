"""
Script para crear usuarios predeterminados (administradores y empleados)
"""
import sys
import os

# Añadir el directorio raíz al path para poder importar los módulos
current_dir = os.path.dirname(os.path.abspath(__file__))
backend_dir = os.path.dirname(current_dir)
root_dir = os.path.dirname(backend_dir)
sys.path.append(root_dir)

from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from passlib.context import CryptContext

# Modelos
from backend.app.models.modelos import Usuario, Rol, Sucursal, Base

# Para manejar el hash de las contraseñas
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def get_password_hash(password):
    """Genera el hash de una contraseña"""
    return pwd_context.hash(password)

# Configuración de la base de datos
engine = create_engine("mysql+pymysql://root:123456@localhost:3306/sistema_inventario")
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

def crear_tablas():
    """Crear las tablas si no existen"""
    Base.metadata.create_all(bind=engine)
    print("✅ Tablas creadas o verificadas correctamente")

def crear_roles_y_sucursal():
    """Crear roles y sucursal principal si no existen"""
    db = SessionLocal()
    
    # Verificar que exista el rol de administrador
    rol_admin = db.query(Rol).filter(Rol.nombre == "administrador").first()
    if not rol_admin:
        rol_admin = Rol(nombre="administrador")
        db.add(rol_admin)
        db.commit()
        db.refresh(rol_admin)
        print(f"✅ Rol de administrador creado")
    
    # Verificar que exista el rol de empleado
    rol_empleado = db.query(Rol).filter(Rol.nombre == "empleado").first()
    if not rol_empleado:
        rol_empleado = Rol(nombre="empleado")
        db.add(rol_empleado)
        db.commit()
        db.refresh(rol_empleado)
        print(f"✅ Rol de empleado creado")
    
    # Verificar que exista al menos una sucursal
    sucursal = db.query(Sucursal).first()
    if not sucursal:
        sucursal = Sucursal(
            nombre="Sucursal Principal",
            ciudad="Lima",
            direccion="Av. Principal 123"
        )
        db.add(sucursal)
        db.commit()
        db.refresh(sucursal)
        print(f"✅ Sucursal principal creada")
    
    return {
        "rol_admin": rol_admin,
        "rol_empleado": rol_empleado,
        "sucursal": sucursal
    }

def crear_usuario_admin():
    """Crear un usuario administrador por defecto"""
    db = SessionLocal()
    
    # Verificar si ya existe un administrador
    admin = db.query(Usuario).join(Usuario.rol).filter(Rol.nombre == "administrador").first()
    
    if admin:
        print(f"👤 Ya existe un administrador: {admin.username}")
        return
        
    # Obtener roles y sucursal
    datos = crear_roles_y_sucursal()
    rol_admin = datos["rol_admin"]
    sucursal = datos["sucursal"]
    
    # Datos del administrador
    nuevo_admin = Usuario(
        nombre="Administrador",
        username="admin",
        correo="admin@polleria.com",
        contraseña=get_password_hash("admin123"),
        id_rol=rol_admin.id,
        id_sucursal=sucursal.id
    )
    
    # Guardar en la base de datos
    db.add(nuevo_admin)
    db.commit()
    db.refresh(nuevo_admin)
    
    print(f"✅ Administrador creado correctamente")
    print(f"👤 Correo: admin@polleria.com")
    print(f"🔑 Contraseña: admin123")

def crear_usuario_empleado():
    """Crear un usuario empleado por defecto"""
    db = SessionLocal()
    
    # Verificar si ya existe un empleado
    empleado = db.query(Usuario).join(Usuario.rol).filter(Rol.nombre == "empleado").first()
    
    if empleado:
        print(f"👤 Ya existe un empleado: {empleado.username}")
        return
    
    # Obtener roles y sucursal
    datos = crear_roles_y_sucursal()
    rol_empleado = datos["rol_empleado"]
    sucursal = datos["sucursal"]
    
    # Datos del empleado
    nuevo_empleado = Usuario(
        nombre="Empleado",
        username="empleado",
        correo="empleado@polleria.com",
        contraseña=get_password_hash("empleado123"),
        id_rol=rol_empleado.id,
        id_sucursal=sucursal.id
    )
    
    # Guardar en la base de datos
    db.add(nuevo_empleado)
    db.commit()
    db.refresh(nuevo_empleado)
    
    print(f"✅ Empleado creado correctamente")
    print(f"👤 Correo: empleado@polleria.com")
    print(f"🔑 Contraseña: empleado123")

if __name__ == "__main__":
    try:
        print("\n📋 CONFIGURACIÓN INICIAL DEL SISTEMA")
        print("=" * 50)
        crear_tablas()
        crear_usuario_admin()
        crear_usuario_empleado()
        print("=" * 50)
        print("✅ Proceso completado correctamente")
        print("\n📝 CREDENCIALES DE ACCESO:")
        print("👤 Admin: usuario 'admin' / contraseña 'admin123'")
        print("👤 Empleado: usuario 'empleado' / contraseña 'empleado123'")
    except Exception as e:
        print(f"❌ Error: {str(e)}")
        print("Por favor asegúrate de que:")
        print("1. La base de datos 'sistema_inventario' existe")
        print("2. Las credenciales de la base de datos son correctas")
        print("3. El servidor MySQL está en ejecución")
