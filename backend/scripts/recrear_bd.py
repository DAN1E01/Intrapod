"""
Script para recrear la base de datos desde cero
"""
import sys
import os
from sqlalchemy import create_engine, text
import pymysql

# Añadir el directorio raíz al path para poder importar los módulos
current_dir = os.path.dirname(os.path.abspath(__file__))
backend_dir = os.path.dirname(current_dir)
root_dir = os.path.dirname(backend_dir)
sys.path.append(root_dir)

# Leer el archivo SQL de inicialización
sql_file_path = os.path.join(backend_dir, "init.sql")
with open(sql_file_path, "r") as file:
    sql_script = file.read()

# Conectarse directamente a MySQL para eliminar y recrear la base de datos
try:
    # Conectar a MySQL sin especificar la base de datos
    conn = pymysql.connect(
        host="localhost",
        user="root",
        password="123456"
    )
    
    with conn.cursor() as cursor:
        # Eliminar la base de datos si existe
        cursor.execute("DROP DATABASE IF EXISTS sistema_inventario")
        print("✅ Base de datos eliminada correctamente")
        
        # Recrear la base de datos
        cursor.execute("CREATE DATABASE sistema_inventario")
        print("✅ Base de datos creada correctamente")
    
    conn.commit()
    conn.close()
    
    # Conexión a la nueva base de datos usando SQLAlchemy
    engine = create_engine("mysql+pymysql://root:123456@localhost:3306/sistema_inventario")
    
    # Ejecutar el script SQL para crear las tablas y datos iniciales
    with engine.connect() as connection:
        connection.execute(text("USE sistema_inventario"))
        
        # Separar las sentencias SQL por punto y coma
        sql_commands = sql_script.split(';')
        
        # Ejecutar cada sentencia SQL
        for command in sql_commands:
            if command.strip():
                connection.execute(text(command))
                connection.commit()
    
    print("✅ Esquema y datos iniciales creados correctamente")
    print("\n📝 CREDENCIALES DE ACCESO:")
    print("👤 Admin: usuario 'admin' / contraseña 'admin123'")
    
except Exception as e:
    print(f"❌ Error: {str(e)}")
    print("Por favor asegúrate de que:")
    print("1. MySQL está en ejecución")
    print("2. Las credenciales de la base de datos son correctas")
