# Sistema de Gestión para Pollería

Este es un sistema de gestión para pollerías con control de acceso basado en roles.

## Instalación

1. Clona este repositorio o descarga los archivos
2. Crea un entorno virtual de Python e instala las dependencias:
   ```
   python -m venv env
   env\Scripts\activate
   pip install -r requirements.txt
   ```

3. Configura la base de datos MySQL:
   - Crea una base de datos llamada `inventario`
   - Asegúrate de que las credenciales en `backend/app/config/db/db.py` sean correctas

4. Ejecuta el script para crear el usuario administrador:
   ```
   crear_admin.bat
   ```

## Ejecución

Para iniciar el sistema completo, ejecuta:
```
iniciar_sistema.bat
```

O inicia por separado:

1. Backend:
   ```
   cd C:\ruta\a\la\carpeta\polleria
   env\Scripts\activate
   uvicorn backend.app.main:app --reload
   ```

2. Frontend:
   ```
   cd C:\ruta\a\la\carpeta\polleria\frontend
   python -m http.server 5500
   ```

## Usuarios de prueba

El sistema incluye los siguientes usuarios por defecto:

- **Administrador**
  - Usuario: admin
  - Contraseña: admin123

- **Cajero**
  - Usuario: cajero
  - Contraseña: cajero123

- **Cocinero**
  - Usuario: cocinero
  - Contraseña: cocinero123

## Estructura del Proyecto

- **backend/**: API FastAPI con autenticación JWT
  - **app/**: Código principal
    - **auth/**: Utilidades de autenticación
    - **config/**: Configuración (DB, CORS, etc.)
    - **models/**: Modelos de datos
    - **routes/**: Endpoints de la API
    - **schemas/**: Esquemas Pydantic

- **frontend/**: Interfaz web
  - **assets/**: Recursos (CSS, JS, etc.)
  - **pages/**: Páginas HTML

## Características

- Autenticación con JWT
- Control de acceso basado en roles
- Protección de rutas en frontend y backend
- Interfaz adaptada a cada rol de usuario
