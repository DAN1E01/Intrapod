from fastapi import FastAPI 
from fastapi.staticfiles import StaticFiles
from app.config.middleware.con_front import add_cors_middleware
from app.routes.auth import router as auth_router
from app.routes.dashboard import router as dashboard_router
from app.routes.inventario import router as inventario_router
from app.routes.usuario import router as usuario_router
from app.routes.ventas import router as ventas_router
import os

app = FastAPI(
    title = "API Inventario Intrapod",
    descripcion = "Sisema de Inventario para importadora de electrodomesticos Intrapod",
    version = "1.0.0"
)

BASE_DIR = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
FRONTEND_DIR = os.path.join(BASE_DIR, "frontend")

# Monta la carpeta frontend correctamente
app.mount("/frontend", StaticFiles(directory=FRONTEND_DIR), name="frontend")

add_cors_middleware(app)


app.include_router(auth_router, prefix="/auth", tags=["auth"])
app.include_router(dashboard_router, tags=["dashboard"])
app.include_router(inventario_router, tags=["inventario"])
app.include_router(usuario_router, tags=["usuarios"])
app.include_router(ventas_router, tags=["ventas"])
@app.get("/")
def root():
    return {"message": "Bienvenido a la API de Inventario Intrapod"}
