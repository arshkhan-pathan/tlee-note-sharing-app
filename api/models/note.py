from pydantic import BaseModel

class NoteBase(BaseModel):
    note: str
    author: str

class NoteCreate(NoteBase):
    identifier: str

class NoteResponse(NoteBase):
    id: int
