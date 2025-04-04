from core.db import get_db

def get_all_notes():
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("SELECT id, note, author FROM notes")
    rows = cursor.fetchall()
    conn.close()
    return [{"id": r[0], "note": r[1], "author": r[2]} for r in rows]

def get_note_by_identifier(identifier):
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("SELECT id, note, author FROM notes WHERE identifier = ?", (identifier,))
    note = cursor.fetchone()
    conn.close()
    return note

def create_or_update_note(note):
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("SELECT id FROM notes WHERE identifier = ?", (note.identifier,))
    exists = cursor.fetchone()

    if exists:
        cursor.execute("UPDATE notes SET note = ?, author = ? WHERE identifier = ?",
                       (note.note, note.author, note.identifier))
    else:
        cursor.execute("INSERT INTO notes (note, author, identifier) VALUES (?, ?, ?)",
                       (note.note, note.author, note.identifier))

    conn.commit()
    cursor.execute("SELECT id, note, author FROM notes WHERE identifier = ?", (note.identifier,))
    result = cursor.fetchone()
    conn.close()
    return result

def update_note_by_id(note_id, note):
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("SELECT id FROM notes WHERE id = ?", (note_id,))
    exists = cursor.fetchone()
    if not exists:
        return None

    cursor.execute("UPDATE notes SET note = ?, author = ? WHERE id = ?", (note.note, note.author, note_id))
    conn.commit()
    cursor.execute("SELECT id, note, author FROM notes WHERE id = ?", (note_id,))
    result = cursor.fetchone()
    conn.close()
    return result

def delete_note_by_id(note_id):
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("SELECT id FROM notes WHERE id = ?", (note_id,))
    exists = cursor.fetchone()
    if not exists:
        return False
    cursor.execute("DELETE FROM notes WHERE id = ?", (note_id,))
    conn.commit()
    conn.close()
    return True
