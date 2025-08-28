from sqlalchemy.orm import Session
from models._note import Note, NoteResponse

def get_all_notes(db: Session, search: str = None):
    """Get all notes with optional search"""
    query = db.query(Note)
    
    if search:
        search_term = f"%{search}%"
        query = query.filter(
            Note.identifier.ilike(search_term) |
            Note.author.ilike(search_term) |
            Note.note.ilike(search_term)
        )
    
    notes = query.all()
    # Convert SQLAlchemy models to Pydantic models
    return [NoteResponse(
        id=note.id, 
        note=note.note, 
        author=note.author, 
        identifier=note.identifier,
        created_at=note.created_at.isoformat() if note.created_at else None,
        updated_at=note.updated_at.isoformat() if note.updated_at else None
    ) for note in notes]

def get_notes_paginated(db: Session, page: int = 1, per_page: int = 10, search: str = None):
    """Get notes with pagination and search"""
    # Build base query
    query = db.query(Note)
    
    # Apply search filter if provided
    if search:
        search_term = f"%{search}%"
        query = query.filter(
            Note.identifier.ilike(search_term) |
            Note.author.ilike(search_term) |
            Note.note.ilike(search_term)
        )
    
    # Get total count for pagination
    total = query.count()
    offset = (page - 1) * per_page
    
    # Get paginated results
    notes = query.offset(offset).limit(per_page).all()
    
    # Convert SQLAlchemy models to Pydantic models
    note_responses = [NoteResponse(
        id=note.id, 
        note=note.note, 
        author=note.author, 
        identifier=note.identifier,
        created_at=note.created_at.isoformat() if note.created_at else None,
        updated_at=note.updated_at.isoformat() if note.updated_at else None
    ) for note in notes]
    
    total_pages = (total + per_page - 1) // per_page  # Ceiling division
    
    return {
        "notes": note_responses,
        "total": total,
        "page": page,
        "per_page": per_page,
        "total_pages": total_pages,
        "has_next": page < total_pages,
        "has_prev": page > 1
    }

def get_note_by_identifier(db: Session, identifier: str):
    note = db.query(Note).filter(Note.identifier == identifier).first()
    if note:
        return NoteResponse(
            id=note.id, 
            note=note.note, 
            author=note.author, 
            identifier=note.identifier,
            created_at=note.created_at.isoformat() if note.created_at else None,
            updated_at=note.updated_at.isoformat() if note.updated_at else None
        )
    return None

def create_or_update_note(db: Session, note):
    db_note = db.query(Note).filter(Note.identifier == note.identifier).first()
    if db_note:
        db_note.note = note.note
        db_note.author = note.author
    else:
        db_note = Note(note=note.note, author=note.author, identifier=note.identifier)
        db.add(db_note)
    db.commit()
    db.refresh(db_note)
    return NoteResponse(
        id=db_note.id, 
        note=db_note.note, 
        author=db_note.author, 
        identifier=db_note.identifier,
        created_at=db_note.created_at.isoformat() if db_note.created_at else None,
        updated_at=db_note.updated_at.isoformat() if db_note.updated_at else None
    )

def update_note_by_id(db: Session, note_id: int, note):
    db_note = db.query(Note).filter(Note.id == note_id).first()
    if not db_note:
        return None
    db_note.note = note.note
    db_note.author = note.author
    db.commit()
    db.refresh(db_note)
    return NoteResponse(
        id=db_note.id, 
        note=db_note.note, 
        author=db_note.author, 
        identifier=db_note.identifier,
        created_at=db_note.created_at.isoformat() if db_note.created_at else None,
        updated_at=db_note.updated_at.isoformat() if db_note.updated_at else None
    )

def delete_note_by_id(db: Session, note_id: int):
    db_note = db.query(Note).filter(Note.id == note_id).first()
    if not db_note:
        return False
    db.delete(db_note)
    db.commit()
    return True

def delete_note_by_identifier(db: Session, identifier: str):
    """Delete a note by its identifier"""
    db_note = db.query(Note).filter(Note.identifier == identifier).first()
    if not db_note:
        return False
    db.delete(db_note)
    db.commit()
    return True
