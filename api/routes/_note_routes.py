from fastapi import APIRouter, HTTPException
from models._note import NoteCreate, NoteResponse
import services._note_service as svc

router = APIRouter()

@router.get("/api/")
def hello():
    return {"message": "Hello from FastAPI!"}

@router.get("/api/notes", response_model=list[NoteResponse])
def get_notes():
    return svc.get_all_notes()

@router.get("/api/notes/{identifier}", response_model=NoteResponse)
def get_note(identifier: str):
    note = svc.get_note_by_identifier(identifier)
    if not note:
        raise HTTPException(status_code=404, detail="Note not found")
    return {"id": note[0], "note": note[1], "author": note[2]}

@router.post("/api/notes", response_model=NoteResponse)
def create_note(note: NoteCreate):
    result = svc.create_or_update_note(note)
    return {"id": result[0], "note": result[1], "author": result[2]}

@router.put("/api/notes/{note_id}", response_model=NoteResponse)
def update_note(note_id: int, note: NoteCreate):
    updated = svc.update_note_by_id(note_id, note)
    if not updated:
        raise HTTPException(status_code=404, detail="Note not found")
    return {"id": updated[0], "note": updated[1], "author": updated[2]}

@router.delete("/api/notes/{note_id}", status_code=204)
def delete_note(note_id: int):
    success = svc.delete_note_by_id(note_id)
    if not success:
        raise HTTPException(status_code=404, detail="Note not found")
    return None
