import sys
import os

# Configurar ruta para importaciones
current_dir = os.path.dirname(os.path.abspath(__file__))
sys.path.append(current_dir)

from sqlalchemy import create_engine
from sqlalchemy.orm import Session, joinedload

from backend.app.models.modelos import Usuario, Rol, Sucursal

# Conexión a la base de datos
engine = create_engine('mysql+pymysql://root:123456@localhost:3306/sistema_inventario')

# Consultar todos los usuarios
with Session(engine) as session:
    usuarios = session.query(Usuario).options(joinedload(Usuario.rol), joinedload(Usuario.sucursal)).all()
    
    if usuarios:
        print(f"\n============= USUARIOS REGISTRADOS ({len(usuarios)}) =============")
        for user in usuarios:
            print(f"\nID: {user.id}")
            print(f"Nombre: {user.nombre}")
            print(f"Usuario: {getattr(user, 'username', 'No disponible')}")
            print(f"Correo: {user.correo}")
            print(f"Rol: {user.rol.nombre if user.rol else 'Sin rol'}")
            print(f"Sucursal: {user.sucursal.nombre if user.sucursal else 'Sin sucursal'}")
            print("-" * 50)
    else:
        print("No se encontraron usuarios en la base de datos")
