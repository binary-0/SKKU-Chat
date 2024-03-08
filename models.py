from sqlalchemy import Column, Integer, String

from database import Base

class ChatList(Base):
    __tablename__ = "chatlist"

    idx = Column(Integer, primary_key=True, index=True)
    userID = Column(String)
    chatID = Column(String)
    chatList = Column(String)
    lastChat = Column(String)
    
class LoginList(Base):
    __tablename__ = "loginlist"
    
    idx = Column(Integer, primary_key=True, index=True)
    userID = Column(String, unique=True, index=True)
    password = Column(String)
    
class FriendList(Base):
    __tablename__ = "friendlist"
    
    idx = Column(Integer, primary_key=True, index=True)
    userID = Column(String, index=True)
    friend = Column(String)