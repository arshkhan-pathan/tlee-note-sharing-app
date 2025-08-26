import sys
import os

sys.path.append(os.path.dirname(__file__))

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routes._note_routes import router as note_router
from routes._admin_routes import router as admin_router

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(note_router)
app.include_router(admin_router)

# if __name__ == "__main__":
#     import uvicorn
#
#     uvicorn.run("index:app", host="0.0.0.0", port=8000, reload=True)
