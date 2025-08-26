from fastapi import APIRouter, HTTPException, Depends
from sqlalchemy.orm import Session
from models._note import NoteCreate, NoteResponse
from models._admin import AdminUser
from pydantic import BaseModel
from typing import List
import services._note_service as svc
from core._db import get_db
from core._auth import get_current_admin_user

router = APIRouter()

class PaginatedNotesResponse(BaseModel):
    notes: List[NoteResponse]
    total: int
    page: int
    per_page: int
    total_pages: int
    has_next: bool
    has_prev: bool

@router.get("/api/")
def hello():
    return {"message": "Hello from FastAPI!"}

@router.get("/api/notes", response_model=PaginatedNotesResponse)
def get_notes(
    page: int = 1, 
    per_page: int = 10, 
    search: str = None,
    db: Session = Depends(get_db),
    current_admin: AdminUser = Depends(get_current_admin_user)
):
    """Get notes with pagination and search support (Admin only)"""
    if per_page == -1:  # Show all notes
        notes = svc.get_all_notes(db, search=search)
        return PaginatedNotesResponse(
            notes=notes,
            total=len(notes),
            page=1,
            per_page=len(notes),
            total_pages=1,
            has_next=False,
            has_prev=False
        )
    
    # Validate pagination parameters
    if page < 1:
        page = 1
    if per_page < 1:
        per_page = 10
    
    return svc.get_notes_paginated(db, page=page, per_page=per_page, search=search)

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
def delete_note(
    note_id: int, 
    db: Session = Depends(get_db),
    current_admin: AdminUser = Depends(get_current_admin_user)
):
    """Delete a note by ID (Admin only)"""
    success = svc.delete_note_by_id(db, note_id)
    if not success:
        raise HTTPException(status_code=404, detail="Note not found")
    return None

@router.delete("/api/notes/delete/{identifier}", status_code=204)
def delete_note_by_identifier(
    identifier: str, 
    db: Session = Depends(get_db),
    current_admin: AdminUser = Depends(get_current_admin_user)
):
    """Delete a note by its identifier (Admin only)"""
    success = svc.delete_note_by_identifier(db, identifier)
    if not success:
        raise HTTPException(status_code=404, detail="Note not found")
    return None
