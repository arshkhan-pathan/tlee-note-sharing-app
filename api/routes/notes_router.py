from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from database.session import get_sync_db as get_db
from models import Note
from schemas.NotesSchema import NoteCreate, NoteResponse

router = APIRouter(prefix="/notes", tags=["Notes"])


# Create a new note
@router.post("/", response_model=NoteResponse)
def create_note(note: NoteCreate, db: Session = Depends(get_db)):
    db_note = db.query(Note).filter(Note.identifier == note.identifier).first()
    print("db_note", db_note)
    if db_note:
        db_note.note = note.note
        db_note.author = note.author
        db.commit()
        db.refresh(db_note)
    else:
        db_note = Note(note=note.note, author=note.author, identifier=note.identifier)
        db.add(db_note)
        db.commit()
        db.refresh(db_note)
    return db_note


# Get all notes
@router.get("/", response_model=list[NoteResponse])
def get_notes(db: Session = Depends(get_db)):
    notes = db.query(Note).all()
    return notes


# Get a specific note by ID
@router.get("/{identifier}", response_model=NoteResponse)
def get_note(identifier: str, db: Session = Depends(get_db)):
    note = db.query(Note).filter(Note.identifier == identifier).first()
    if not note:
        raise HTTPException(status_code=200, detail="Note not found")
    return note


# Update a note by ID
@router.put("/{note_id}", response_model=NoteResponse)
def update_note(note_id: int, note: NoteCreate, db: Session = Depends(get_db)):
    db_note = db.query(Note).filter(Note.id == note_id).first()
    if not db_note:
        raise HTTPException(status_code=404, detail="Note not found")

    db_note.note = note.note
    db_note.author = note.author
    db.commit()
    db.refresh(db_note)
    return db_note


# Delete a note by ID
@router.delete("/{note_id}", status_code=204)
def delete_note(note_id: int, db: Session = Depends(get_db)):
    db_note = db.query(Note).filter(Note.id == note_id).first()
    if not db_note:
        raise HTTPException(status_code=404, detail="Note not found")

    db.delete(db_note)
    db.commit()
    return None
