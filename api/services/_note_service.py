from sqlalchemy.orm import Session
from models._note import Note

def get_all_notes(db: Session):
    return db.query(Note).all()

def get_note_by_identifier(db: Session, identifier: str):
    return db.query(Note).filter(Note.identifier == identifier).first()

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
    return db_note

def update_note_by_id(db: Session, note_id: int, note):
    db_note = db.query(Note).filter(Note.id == note_id).first()
    if not db_note:
        return None
    db_note.note = note.note
    db_note.author = note.author
    db.commit()
    db.refresh(db_note)
    return db_note

def delete_note_by_id(db: Session, note_id: int):
    db_note = db.query(Note).filter(Note.id == note_id).first()
    if not db_note:
        return False
    db.delete(db_note)
    db.commit()
    return True
