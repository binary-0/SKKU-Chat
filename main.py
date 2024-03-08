from fastapi import FastAPI, WebSocket, Request, Depends
from fastapi.responses import HTMLResponse
from fastapi.templating import Jinja2Templates
from fastapi.logger import logger
from fastapi.staticfiles import StaticFiles
from sqlalchemy.orm import Session
from typing import List
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm

from schema import ChatRequest, ChatRequestCreate, UserCreate, UserLogin, FriendRequest
from crud import get_chatlist, set_chatlist, get_user, create_user, authenticate_user, add_friend, get_friend, is_friend
from models import Base, ChatList, LoginList, FriendList
from database import SessionLocal, engine

Base.metadata.create_all(bind=engine)
app = FastAPI()

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="token")

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

app.mount("/static", StaticFiles(directory="static"), name="static")
templates =Jinja2Templates(directory="templates")

class ConnectionManager:
    def __init__(self):
            self.active_connections=[]
    async def connect(self, websocket: WebSocket):
        await websocket.accept()
        self.active_connections.append(websocket)
    async def disconnect(self, websocket: WebSocket):
        self.active_connections.remove(websocket)
    async def broadcast(self, message: str):
        for connection in self.active_connections:
            await connection.send_text(message)
            
manager = ConnectionManager()

@app.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket):
    await manager.connect(websocket)
    try:
        while True:
            data = await websocket.receive_text()
            await manager.broadcast(f"{data}")
    except Exception as e:
        pass
    finally:
        await manager.disconnect(websocket)

@app.get("/")
async def client(request: Request):
    return templates.TemplateResponse("login.html", {"request": request})

@app.get("/chat")
async def client(request: Request):
    return templates.TemplateResponse("chat.html", {"request": request})

@app.get("/groupChat")
async def client(request: Request):
    return templates.TemplateResponse("groupChat.html", {"request": request})

@app.get("/friendList")
async def client(request: Request):
    return templates.TemplateResponse("friendList.html", {"request": request})

@app.get("/chatList")
async def client(request: Request):
    return templates.TemplateResponse("chatList.html", {"request": request})

@app.get("/getchatlist", response_model=List[ChatRequest])
def get_data(db: Session = Depends(get_db)):
    return get_chatlist(db)

@app.post("/setchatlist", response_model=List[ChatRequest])
def set_data(chat_req: ChatRequestCreate, db: Session = Depends(get_db)):
    return set_chatlist(db, chat_req)

@app.post("/register")
def register_user(user: UserCreate, db: Session = Depends(get_db)):
    isUser = get_user(db, user.userID)
    
    if isUser is None:  # Only when that user is not registered
        db_user = create_user(db, user.userID, user.password)
        return db_user

@app.post("/token")
def login_user(
    form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)
):
    # print('Form data:', form_data)
    user = authenticate_user(db, form_data.username, form_data.password)
    if user is None:
        return {"access_token": "-1", "token_type": "bearer", "isFailed": "1"}
    else:
        return {"access_token": user.userID, "token_type": "bearer", "isFailed": "0"} 
    
@app.post("/addFriend")
def register_friend(friend: FriendRequest, db: Session = Depends(get_db)):
    isFriend = is_friend(db, friend.userID, friend.friend)
    
    if isFriend is None:
        db_friend = add_friend(db, friend.userID, friend.friend)
        return db_friend
    else:
        return -1;

@app.post("/getFriend")
def retrieve_friend(friend: FriendRequest, db: Session = Depends(get_db)):
    friendList = get_friend(db, friend.userID)
    return friendList

def run():
    import uvicorn
    uvicorn.run(app)

if __name__=="__main__":
    run()