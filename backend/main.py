import uuid
import asyncio
import os
import json
from typing import Dict, List, Optional
from fastapi import FastAPI, WebSocket, WebSocketDisconnect, HTTPException, Depends, Query, Request
from fastapi.middleware.cors import CORSMiddleware
from google.oauth2 import id_token
from google.auth.transport import requests
from pydantic import BaseModel
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()

# Environment variables
HOST = os.getenv("HOST", "0.0.0.0")
PORT = int(os.getenv("PORT", "8000"))
JWT_SECRET = os.getenv("JWT_SECRET", "your-secret-key")
GOOGLE_CLIENT_ID = os.getenv("GOOGLE_CLIENT_ID", "198883014921-9v5urtj62uk99vo0p67in0lkah5gpn9j.apps.googleusercontent.com")
ALLOWED_EMAIL_DOMAIN = os.getenv("ALLOWED_EMAIL_DOMAIN", "marwadiuniversity.ac.in")
DEBUG = os.getenv("DEBUG", "False").lower() == "true"

app = FastAPI()
# uvicorn main:app --reload
# Allow all origins for testing; configure CORS appropriately for production
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# In-memory storage for simplicity
# Mapping token -> email for logged-in users
users: Dict[str, str] = {}
# Set of tokens representing online users
online_users = set()
# Users who have explicitly clicked "Connect to Chat"
ready_users: List[str] = []
# Waiting queue for users waiting for a chat partner
waiting_queue: List[str] = []
# Active chat sessions: chat_id -> {"users": [token1, token2], "messages": [ {sender, message} ]}
active_chats: Dict[str, Dict] = {}
# Track typing status: token -> { timestamp, peer_token }
typing_status: Dict[str, Dict] = {}

# ---------------------
# Pydantic Models
# ---------------------
class GoogleLoginRequest(BaseModel):
    token: str

# ---------------------
# Helper: Authentication Dependency
# ---------------------
def get_current_user(token: str = Query(...)):
    if token not in users:
        raise HTTPException(status_code=401, detail="Invalid token")
    return token

# ---------------------
# REST Endpoints
# ---------------------
@app.post("/login")
async def login(email: str):
    """
    Login endpoint. Accepts an email address and if it ends with 
    'marwadiuniversity.ac.in', returns a token for further requests.
    """
    if not email.endswith(ALLOWED_EMAIL_DOMAIN):
        raise HTTPException(status_code=400, detail="Invalid email domain")
    token = str(uuid.uuid4())
    users[token] = email
    online_users.add(token)
    return {"token": token, "email": email}

@app.post("/google-login")
async def google_login(request: GoogleLoginRequest):
    """
    Handles Google OAuth login. Verifies the Google ID token and
    checks if the email domain is allowed.
    """
    try:
        # Verify the token
        idinfo = id_token.verify_oauth2_token(
            request.token, 
            requests.Request(), 
            GOOGLE_CLIENT_ID,
            # Add clock_skew_in_seconds to handle time differences
            clock_skew_in_seconds=10
        )
        
        # Check if the token is valid - expanded acceptable issuers
        if idinfo['iss'] not in [
            'accounts.google.com', 
            'https://accounts.google.com',
            'https://securetoken.google.com'
        ]:
            raise HTTPException(status_code=401, detail="Invalid issuer")
        
        # Extract email and check domain
        email = idinfo['email']
        if not email.endswith(ALLOWED_EMAIL_DOMAIN) and ALLOWED_EMAIL_DOMAIN != "*":
            return {
                "success": False,
                "message": f"Only {ALLOWED_EMAIL_DOMAIN} domain is allowed."
            }
        
        # Create a token for the user
        token = str(uuid.uuid4())
        users[token] = email
        online_users.add(token)
        
        return {
            "success": True,
            "token": token,
            "email": email
        }
    except ValueError as e:
        # Invalid token - add more detailed error logging
        print(f"Token verification error: {str(e)}")
        raise HTTPException(status_code=401, detail=f"Invalid token: {str(e)}")

@app.get("/online")
async def get_online_users(token: str = None):
    """
    Returns the number of online accounts.
    Including both actively connected users and those with active WebSocket connections.
    """
    # Verify the token if provided (optional authentication)
    if token and token not in users:
        raise HTTPException(status_code=401, detail="Invalid token")
    
    # Count unique users with active connections
    active_connections_count = len(manager.active_connections)
    # Count users who have logged in recently
    logged_in_users_count = len(online_users)
    
    # Get total unique users (union of both sets)
    total_online = len(set(manager.active_connections.keys()).union(online_users))
    
    return {
        "online": total_online,
        "details": {
            "active_connections": active_connections_count,
            "logged_in": logged_in_users_count
        }
    }

@app.get("/download/{chat_id}")
async def download_chat(chat_id: str, token: str = Query(...)):
    """
    Download the chat history for a given chat session.
    Only users who are part of the chat may access its history.
    """
    if chat_id not in active_chats:
        raise HTTPException(status_code=404, detail="Chat not found")
    chat = active_chats[chat_id]
    if token not in chat["users"]:
        raise HTTPException(status_code=403, detail="Not authorized to access this chat")
    return {"chat_id": chat_id, "messages": chat["messages"]}

# ---------------------
# WebSocket Connection Manager
# ---------------------
class ConnectionManager:
    def __init__(self):
        # token -> WebSocket connection
        self.active_connections: Dict[str, WebSocket] = {}

    async def connect(self, token: str, websocket: WebSocket):
        await websocket.accept()
        self.active_connections[token] = websocket

    def disconnect(self, token: str):
        if token in self.active_connections:
            del self.active_connections[token]
        if token in online_users:
            online_users.remove(token)
        if token in ready_users:
            ready_users.remove(token)
        if token in waiting_queue:
            waiting_queue.remove(token)
        if token in typing_status:
            del typing_status[token]

    async def send_personal_message(self, message: dict, token: str):
        if token in self.active_connections:
            try:
                websocket = self.active_connections[token]
                await websocket.send_json(message)
            except Exception as e:
                print(f"Error sending message to {token}: {e}")

manager = ConnectionManager()

# Task to handle typing status expiration
async def handle_typing_expiration():
    while True:
        current_time = asyncio.get_event_loop().time()
        for token, info in list(typing_status.items()):
            # If typing status is more than 3 seconds old, clear it
            if current_time - info["timestamp"] > 3:
                peer_token = info.get("peer_token")
                if peer_token:
                    try:
                        await manager.send_personal_message(
                            {"event": "typing_ended"},
                            peer_token
                        )
                    except Exception:
                        pass
                del typing_status[token]
        await asyncio.sleep(1)  # Check every second

# Start the background task
@app.on_event("startup")
async def startup_event():
    asyncio.create_task(handle_typing_expiration())

# ---------------------
# WebSocket Endpoint for Live Chat
# ---------------------
@app.websocket("/ws/chat")
async def websocket_endpoint(websocket: WebSocket, token: str = Query(...)):
    """
    WebSocket endpoint.
    
    - On connection: validates the token and waits for explicit connection request
    - Handles 'connect_to_chat' event to start pairing
    - Handles 'message' events to forward chat messages
    - Handles 'typing' events to notify the other party
    """
    if token not in users:
        await websocket.close(code=1008)
        return

    await manager.connect(token, websocket)
    paired = False
    chat_id = None

    try:
        while True:
            data = await websocket.receive_json()
            event = data.get("event")
            
            # Handle explicit connection request
            if event == "connect_to_chat":
                if token not in ready_users:
                    ready_users.append(token)
                
                # Check if there's someone else ready to chat
                other_token = None
                for t in ready_users:
                    if t != token and t in waiting_queue:
                        other_token = t
                        break
                
                if other_token:
                    # Both users are ready, create a chat
                    if token not in waiting_queue:
                        waiting_queue.append(token)
                    
                    chat_id = str(uuid.uuid4())
                    active_chats[chat_id] = {"users": [other_token, token], "messages": []}
                    
                    # Notify both users that the chat has started
                    await manager.send_personal_message(
                        {"event": "chat_started", "chat_id": chat_id, "peer": users[token]},
                        other_token,
                    )
                    await manager.send_personal_message(
                        {"event": "chat_started", "chat_id": chat_id, "peer": users[other_token]},
                        token,
                    )
                    
                    # Remove from ready_users since they're now paired
                    if other_token in ready_users:
                        ready_users.remove(other_token)
                    if token in ready_users:
                        ready_users.remove(token)
                    
                    # Remove from waiting_queue
                    if other_token in waiting_queue:
                        waiting_queue.remove(other_token)
                    if token in waiting_queue:
                        waiting_queue.remove(token)
                        
                    paired = True
                else:
                    # No one else is ready, add to waiting queue
                    if token not in waiting_queue:
                        waiting_queue.append(token)
                    await manager.send_personal_message(
                        {"event": "waiting", "message": "Waiting for a chat partner..."},
                        token,
                    )
            elif event == "message":
                message_text = data.get("message")
                # Determine which chat session this token belongs to
                user_chat_id = None
                for cid, chat in active_chats.items():
                    if token in chat["users"]:
                        user_chat_id = cid
                        break
                
                if not user_chat_id:
                    await manager.send_personal_message(
                        {"event": "error", "message": "Chat session not started"},
                        token,
                    )
                    continue
                
                chat = active_chats[user_chat_id]
                
                # Find peer if exists
                peer = None
                for t in chat["users"]:
                    if t != token:
                        peer = t
                        break
                
                if not peer:
                    await manager.send_personal_message(
                        {"event": "error", "message": "No chat partner found"},
                        token,
                    )
                    continue
                
                message_obj = {"sender": users[token], "message": message_text}
                chat["messages"].append(message_obj)
                
                # Send message to the other user
                await manager.send_personal_message(
                    {"event": "message", "message": message_text, "sender": users[token]},
                    peer,
                )
                
                # Clear typing status for this user
                if token in typing_status:
                    del typing_status[token]
                    await manager.send_personal_message(
                        {"event": "typing_ended"},
                        peer,
                    )
            elif event == "typing":
                # Notify the peer that the user is typing
                user_chat_id = None
                for cid, chat in active_chats.items():
                    if token in chat["users"]:
                        user_chat_id = cid
                        break
                
                if user_chat_id:
                    chat = active_chats[user_chat_id]
                    
                    # Find peer if exists
                    peer = None
                    for t in chat["users"]:
                        if t != token:
                            peer = t
                            break
                    
                    if peer:
                        # Update typing status with current timestamp
                        current_time = asyncio.get_event_loop().time()
                        typing_status[token] = {
                            "timestamp": current_time,
                            "peer_token": peer
                        }
                        
                        await manager.send_personal_message(
                            {"event": "typing", "message": f"{users[token]} is typing..."},
                            peer,
                        )
            else:
                await manager.send_personal_message(
                    {"event": "error", "message": "Unknown event"},
                    token,
                )
    except WebSocketDisconnect:
        manager.disconnect(token)
        # If user disconnects and was in an active chat, notify the peer and remove the chat
        for cid, chat in list(active_chats.items()):
            if token in chat["users"]:
                # Find peer if exists
                peer = None
                for t in chat["users"]:
                    if t != token:
                        peer = t
                        break
                
                if peer:
                    await manager.send_personal_message(
                        {"event": "chat_ended", "message": f"User {users[token]} disconnected"},
                        peer,
                    )
                
                del active_chats[cid]
                break

# ---------------------
# Run the application
# ---------------------
if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host=HOST, port=PORT, reload=DEBUG)
