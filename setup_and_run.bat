@echo off
REM Script completo para preparar y ejecutar el proyecto Polleria

REM 1. Recordatorio para ejecutar la base de datos
ECHO =============================================
ECHO 1. Antes de continuar, ejecuta el script SQL de la base de datos en MySQL:
ECHO    - Abre tu gestor MySQL y ejecuta in_intrapod.sql
ECHO =============================================
PAUSE

REM 2. Crear entorno virtual si no existe
cd backend
IF NOT EXIST env (
    python -m venv env
)

REM 3. Activar entorno virtual e instalar dependencias
call env\Scripts\activate.bat
pip install -r requirements.txt
cd ..

REM 4. Iniciar backend
cd backend
start cmd /k "call env\Scripts\activate.bat && uvicorn app.main:app --reload"
cd ..

REM 5. Iniciar frontend y abrir navegador
cd frontend
start http://localhost:5500/frontend
python -m http.server 5500
