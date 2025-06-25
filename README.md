# IntraPod - Sistema de Gestión de Inventario para Importadora de Electrodomésticos

## Requisitos previos
- Python 3.11+ instalado
- Git instalado
- MySQL instalado y corriendo

## 1. Inicializa la base de datos

1. Abre tu gestor de MySQL (Workbench, consola, etc).
2. Ejecuta el script SQL ubicado en `in_intrapod.sql` para crear la base de datos y las tablas necesarias:
   ```sql
   -- En tu consola MySQL:
   source C:/ruta/a/in_intrapod.sql;
   ```

## 2. Configura y ejecuta el sistema automáticamente (Windows)

Puedes usar el script incluido para automatizar todo (excepto la base de datos):

```sh
setup_and_run.bat
```

Este script:
- Crea y activa el entorno virtual de Python en `backend/env` si no existe
- Instala las dependencias automáticamente
- Inicia el backend con Uvicorn
- Inicia un servidor local para el frontend y abre el navegador en `http://localhost:5500/frontend`

**Recuerda:** Ejecuta primero el script SQL de la base de datos manualmente antes de usar el .bat la primera vez.

## 3. Acceso al sistema
- Una vez iniciado el script, abre tu navegador en:
  - [http://localhost:5500/frontend](http://localhost:5500/frontend)
- Desde ahí puedes acceder al login y a todas las funcionalidades del sistema.

## 4. Usuario de prueba
- **Usuario:** DAN1E10
- **Contraseña:** admin123
