from fastapi import FastAPI
from dotenv import load_dotenv
import os

from starlette.middleware.cors import CORSMiddleware

from database.session import Base, sync_engine
from routes import user_routes, notes_router

Base.metadata.create_all(bind=sync_engine)

load_dotenv()

allowed_origins = os.getenv("ALLOWED_ORIGINS", "").split(",")  # Defaults to empty list
allow_credentials = os.getenv("ALLOW_CREDENTIALS", "False").lower() == "true"
allow_methods = os.getenv("ALLOW_METHODS", "").split(",")
allow_headers = os.getenv("ALLOW_HEADERS", "").split(",")

app = FastAPI()

# app.include_router(user_routes.router)
app.include_router(notes_router.router)


@app.get("/")
async def root():
    return {"message": "Hello World!"}


@app.get("/hello/{name}")
async def say_hello(name: str):
    return {"message": f"Hello {name}"}


app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)
