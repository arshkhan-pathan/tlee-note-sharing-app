import sqlitecloud
from .config import DB_URL

def get_db():
    return sqlitecloud.connect(DB_URL)

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
