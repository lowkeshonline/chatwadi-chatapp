from bson import ObjectId
from datetime import datetime

def create_user(email, username, password):
    user = {
        "email": email,
        "username": username,
        "password": password,  # Store hashed password in production
        "created_at": datetime.utcnow()
    }
    return user

def create_chat(sender_id, receiver_id, message):
    chat = {
        "sender_id": sender_id,
        "receiver_id": receiver_id,
        "message": message,
        "timestamp": datetime.utcnow()
    }
    return chat