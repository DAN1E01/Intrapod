from typing import Generator
from sqlalchemy import create_engine,MetaData
from sqlalchemy.orm import sessionmaker, Session, declarative_base

conexion = create_engine("mysql+pymysql://root:@localhost:3306/inventario_intrapod", echo=True)

meta = MetaData()

Base = declarative_base()

sesion_local = sessionmaker(autocommit=False, autoflush=False, bind=conexion)

def get_db() -> Generator[Session,None,None]:
    db = sesion_local()
    try:
        yield db
    finally:
        db.close()
    
