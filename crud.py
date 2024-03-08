from sqlalchemy.orm import Session
from models import ChatList, LoginList, FriendList
from schema import ChatRequest

def get_chatlist(db: Session):
    return db.query(ChatList).all()

def set_chatlist(db: Session, item: ChatRequest):
    existing_item = db.query(ChatList).filter(ChatList.userID == item.userID).filter(ChatList.chatID == item.chatID).first()

    if existing_item:
        existing_item.chatList = item.chatList
        existing_item.lastChat = item.lastChat
        
        db.commit()
    else:
        db_item = ChatList(userID=item.userID, chatID=item.chatID, chatList=item.chatList, lastChat=item.lastChat)
        db.add(db_item)
        db.commit()
        db.refresh(db_item)
    
    return db.query(ChatList).all()

def create_user(db: Session, userID: str, password: str):
    db_user = LoginList(userID=userID, password=password)
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user

def get_user(db: Session, userID: str):
    return db.query(LoginList).filter(LoginList.userID == userID).first()

def authenticate_user(db: Session, userID: str, password: str):
    user = get_user(db, userID)
    if user and user.password == password:
        return user

def get_friend(db: Session, userID: str):
    return db.query(FriendList).filter(FriendList.userID == userID).all()

def is_friend(db: Session, userID: str, friend: str):
    return db.query(FriendList).filter(FriendList.userID == userID).filter(FriendList.friend == friend).first()

def add_friend(db: Session, userID: str, friend: str):
    db_friend = FriendList(userID=userID, friend=friend)
    db.add(db_friend)
    db.commit()
    db.refresh(db_friend)
    
    return db_friend
    