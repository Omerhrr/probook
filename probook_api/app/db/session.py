from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from app.core.config import settings
# Import Base if you plan to use it for create_all, e.g., in a development script
# from app.models.models import Base 

DATABASE_URL = settings.SQLALCHEMY_DATABASE_URL

engine = create_engine(DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
