import os
from sqlalchemy import create_engine, text
from sqlalchemy.orm import sessionmaker, declarative_base

# DÙNG POSTGRES THAY VÌ SQLITE
DB_HOST = os.getenv("DB_HOST", "localhost")  # ← LOCAL: localhost | DOCKER: postgres
DB_PORT = os.getenv("DB_PORT", "5432")
DB_USERNAME = os.getenv("DB_USERNAME", "postgres")
DB_PASSWORD = os.getenv("DB_PASSWORD", "matkhau")
DB_DATABASE = os.getenv("DB_DATABASE", "icloud_db")

DATABASE_URL = f"postgresql://{DB_USERNAME}:{DB_PASSWORD}@{DB_HOST}:{DB_PORT}/{DB_DATABASE}"
engine = create_engine(DATABASE_URL, pool_pre_ping=True)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# THÊM Base ĐỂ DÙNG ORM
Base = declarative_base()

def init_db():
    with engine.begin() as conn:
        # Tạo bảng items
        conn.execute(text("""
        CREATE TABLE IF NOT EXISTS items (
            id SERIAL PRIMARY KEY,
            title VARCHAR(200) NOT NULL
        );
        """))
        
        # Tạo bảng users (nếu chưa có)
        conn.execute(text("""
        CREATE TABLE IF NOT EXISTS users (
            id SERIAL PRIMARY KEY,
            username VARCHAR(50) UNIQUE NOT NULL,
            password TEXT NOT NULL
        );
        """))