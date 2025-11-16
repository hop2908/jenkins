from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from sqlalchemy import text
from .db import engine, init_db
from passlib.context import CryptContext
import os

# Dùng argon2 để tránh lỗi bcrypt và không giới hạn độ dài password
# MỚI: DÙNG bcrypt – KHÔNG CẦN argon2-cffi
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

app = FastAPI(title="Demo API (FastAPI + Postgres)")

# CORS
origins_str = os.getenv("CORS_ORIGINS", "http://localhost,http://localhost:5173, http://54.253.9.71")
origins = origins_str.split(",")
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Models
class ItemIn(BaseModel):
    title: str

class UserIn(BaseModel):
    username: str
    password: str


# Startup
@app.on_event("startup")
def on_startup():
    init_db()


# -------------------------------------------
# SYSTEM TEST
# -------------------------------------------
@app.get("/api/health")
def health():
    return {"status": "ok"}


# -------------------------------------------
# ITEMS CRUD
# -------------------------------------------
@app.get("/api/items")
def list_items():
    with engine.connect() as conn:
        rows = conn.execute(
            text("SELECT id, title FROM items ORDER BY id DESC")
        ).mappings().all()
        return {"items": list(rows)}


@app.post("/api/items", status_code=201)
def create_item(item: ItemIn):
    if not item.title.strip():
        raise HTTPException(status_code=400, detail="Title is required.")

    with engine.begin() as conn:
        conn.execute(
            text("INSERT INTO items(title) VALUES(:t)"),
            {"t": item.title}
        )
    return {"message": "created"}


# -------------------------------------------
# AUTH: REGISTER + LOGIN
# -------------------------------------------
@app.post("/api/register")
def register(user: UserIn):
    if not user.username or not user.password:
        raise HTTPException(status_code=400, detail="Username and password are required")

    with engine.begin() as conn:
        existing = conn.execute(
            text("SELECT * FROM users WHERE username = :u"),
            {"u": user.username}
        ).fetchone()

        if existing:
            raise HTTPException(status_code=400, detail="Username already exists")

        password_bytes = user.password.encode('utf-8')
        if len(password_bytes) > 72:
            password_bytes = password_bytes[:72]
        hashed = pwd_context.hash(password_bytes.decode('utf-8'))

        conn.execute(
            text("INSERT INTO users (username, password) VALUES (:u, :p)"),
            {"u": user.username, "p": hashed}
        )

    return {"message": "User registered successfully"}


@app.post("/api/login")
def login(user: UserIn):
    with engine.connect() as conn:
        db_user = conn.execute(
            text("SELECT * FROM users WHERE username = :u"),
            {"u": user.username}
        ).fetchone()

        if not db_user:
            raise HTTPException(status_code=401, detail="Invalid username or password")

        if not pwd_context.verify(user.password, db_user.password):
            raise HTTPException(status_code=401, detail="Invalid username or password")

    return {"message": "Login successful"}


# -------------------------------------------
# USERS CRUD
# -------------------------------------------
@app.get("/api/users")
def get_users():
    with engine.connect() as conn:
        rows = conn.execute(
            text("SELECT id, username FROM users ORDER BY id DESC")
        ).mappings().all()
        return {"users": list(rows)}


@app.put("/api/users/{user_id}")
def update_user(user_id: int, user: UserIn):
    hashed = pwd_context.hash(user.password)

    with engine.begin() as conn:
        result = conn.execute(
            text("UPDATE users SET username = :u, password = :p WHERE id = :i"),
            {"u": user.username, "p": hashed, "i": user_id}
        )

        if result.rowcount == 0:
            raise HTTPException(status_code=404, detail="User not found")

    return {"message": "User updated successfully"}


@app.delete("/api/users/{user_id}")
def delete_user(user_id: int):
    with engine.begin() as conn:
        result = conn.execute(
            text("DELETE FROM users WHERE id = :i"),
            {"i": user_id}
        )

        if result.rowcount == 0:
            raise HTTPException(status_code=404, detail="User not found")

    return {"message": "User deleted successfully"}
