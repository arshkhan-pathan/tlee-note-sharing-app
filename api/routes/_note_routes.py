from fastapi import APIRouter, HTTPException, Depends
from sqlalchemy.orm import Session
from models._note import NoteCreate, NoteResponse
import services._note_service as svc
from core._db import get_db  # Make sure this returns SessionLocal like you showed

router = APIRouter()

@router.get("/api/")
def hello():
    return {"message": "Hello from FastAPI!"}

# @router.get("/api/notes", response_model=list[NoteResponse])
# def get_notes(db: Session = Depends(get_db)):
#     return svc.get_all_notes(db)

@router.get("/api/notes/{identifier}", response_model=NoteResponse)
def get_note(identifier: str, db: Session = Depends(get_db)):
    note = svc.get_note_by_identifier(db, identifier)
    if not note:
        raise HTTPException(status_code=404, detail="Note not found")
    return note

@router.post("/api/notes", response_model=NoteResponse)
def create_note(note: NoteCreate, db: Session = Depends(get_db)):
    result = svc.create_or_update_note(db, note)
    if result is not None:
        return result
    else:
        raise HTTPException(status_code=500, detail="Note creation failed")

@router.put("/api/notes/{note_id}", response_model=NoteResponse)
def update_note(note_id: int, note: NoteCreate, db: Session = Depends(get_db)):
    updated = svc.update_note_by_id(db, note_id, note)
    if not updated:
        raise HTTPException(status_code=404, detail="Note not found")
    return updated

@router.delete("/api/notes/{note_id}", status_code=204)
def delete_note(note_id: int, db: Session = Depends(get_db)):
    success = svc.delete_note_by_id(db, note_id)
    if not success:
        raise HTTPException(status_code=404, detail="Note not found")
    return None
