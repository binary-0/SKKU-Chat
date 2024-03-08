from pydantic import BaseModel
from typing import Optional

class ChatRequestBase(BaseModel):
    userID: str
    chatID: str
    chatList: str
    lastChat: str

class ChatRequestCreate(ChatRequestBase):
    pass

class ChatRequest(ChatRequestBase):
    class Config:
        orm_mode = True

class UserCreate(BaseModel):
    userID: str
    password: str
    
class UserLogin(BaseModel):
    userID: str
    password: str
    
class FriendRequest(BaseModel):
    userID: str
    friend: str