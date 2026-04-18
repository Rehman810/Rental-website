import os
from pinecone import Pinecone, ServerlessSpec
from dotenv import load_dotenv

load_dotenv()

PINECONE_API_KEY = os.getenv("PINECONE_API_KEY", "your-pinecone-api-key")
PINECONE_ENV = os.getenv("PINECONE_ENV", "us-east-1")

pc = Pinecone(api_key=PINECONE_API_KEY)

LISTING_INDEX_NAME = "listings"
USER_INDEX_NAME = "users"

def init_pinecone():
    if not PINECONE_API_KEY or PINECONE_API_KEY == "your-pinecone-api-key":
        return # Skip if no key provided
        
    existing_indexes = [index_info["name"] for index_info in pc.list_indexes()]
    
    if LISTING_INDEX_NAME not in existing_indexes:
        pc.create_index(
            name=LISTING_INDEX_NAME, 
            dimension=768, 
            metric="cosine", 
            spec=ServerlessSpec(cloud="aws", region=PINECONE_ENV)
        )
    if USER_INDEX_NAME not in existing_indexes:
        pc.create_index(
            name=USER_INDEX_NAME, 
            dimension=768, 
            metric="cosine", 
            spec=ServerlessSpec(cloud="aws", region=PINECONE_ENV)
        )

def get_listing_index():
    return pc.Index(LISTING_INDEX_NAME)

def get_user_index():
    return pc.Index(USER_INDEX_NAME)
