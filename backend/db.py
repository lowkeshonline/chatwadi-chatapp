from pymongo import MongoClient
from dotenv import load_dotenv
import os

# Load environment variables
load_dotenv()

# MongoDB Connection
client = MongoClient(os.getenv("MONGO_URI"))
db = client.chatwadi
users = db.users
