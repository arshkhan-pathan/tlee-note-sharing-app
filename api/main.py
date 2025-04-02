from fastapi import FastAPI, HTTPException
import sqlitecloud
from pydantic import BaseModel
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv
import os
import uvicorn

load_dotenv()

# Database connection
DB_URL = os.getenv("DB_URL")


def get_db():
    conn = sqlitecloud.connect(DB_URL)
    return conn


# Pydantic schemas
class NoteBase(BaseModel):
    note: str
    author: str


class NoteCreate(NoteBase):
    identifier: str


class NoteResponse(NoteBase):
    id: int


# Create table if not exists
def initialize_db():
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS notes (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            note TEXT NOT NULL,
            identifier TEXT UNIQUE NOT NULL,
            author TEXT NOT NULL
        )
    """)
    conn.commit()
    conn.close()


initialize_db()



app = FastAPI()

# Enable CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.post("/notes", response_model=NoteResponse)
def create_note(note: NoteCreate):
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("SELECT id FROM notes WHERE identifier = ?", (note.identifier,))
    existing_note = cursor.fetchone()

    if existing_note:
        cursor.execute("UPDATE notes SET note = ?, author = ? WHERE identifier = ?",
                       (note.note, note.author, note.identifier))
    else:
        cursor.execute("INSERT INTO notes (note, author, identifier) VALUES (?, ?, ?)",
                       (note.note, note.author, note.identifier))

    conn.commit()
    cursor.execute("SELECT id, note, author FROM notes WHERE identifier = ?", (note.identifier,))
    result = cursor.fetchone()
    print("result", result)
    conn.close()

    # Fixme
    return {"id": 1, "note": note.note, "author": "admin"}


@app.get("/notes", response_model=list[NoteResponse])
def get_notes():
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("SELECT id, note, author FROM notes")
    notes = cursor.fetchall()
    conn.close()

    return [{"id": row[0], "note": row[1], "author": row[2]} for row in notes]


@app.get("/notes/{identifier}", response_model=NoteResponse)
def get_note(identifier: str):
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("SELECT id, note, author FROM notes WHERE identifier = ?", (identifier,))
    note = cursor.fetchone()
    conn.close()

    if not note:
        raise HTTPException(status_code=404, detail="Note not found")
    return {"id": note[0], "note": note[1], "author": note[2]}


@app.put("/notes/{note_id}", response_model=NoteResponse)
def update_note(note_id: int, note: NoteCreate):
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("SELECT id FROM notes WHERE id = ?", (note_id,))
    existing_note = cursor.fetchone()

    if not existing_note:
        raise HTTPException(status_code=404, detail="Note not found")

    cursor.execute("UPDATE notes SET note = ?, author = ? WHERE id = ?", (note.note, note.author, note_id))
    conn.commit()
    cursor.execute("SELECT id, note, author FROM notes WHERE id = ?", (note_id,))
    updated_note = cursor.fetchone()
    conn.close()

    return {"id": updated_note[0], "note": updated_note[1], "author": updated_note[2]}


@app.delete("/notes/{note_id}", status_code=204)
def delete_note(note_id: int):
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("SELECT id FROM notes WHERE id = ?", (note_id,))
    existing_note = cursor.fetchone()

    if not existing_note:
        raise HTTPException(status_code=404, detail="Note not found")

    cursor.execute("DELETE FROM notes WHERE id = ?", (note_id,))
    conn.commit()
    conn.close()
    return None


if __name__ == "__main__":
    uvicorn.run(app, host="127.0.0.1", port=8000)