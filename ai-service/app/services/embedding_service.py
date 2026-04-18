import os
from google import genai
from dotenv import load_dotenv

load_dotenv()

# The Node app has the GEMINI_API_KEY in its env, ensure this service can see it
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")

def get_client():
    if not GEMINI_API_KEY:
        print("WARNING: GEMINI_API_KEY is not set.")
        return None
    return genai.Client(api_key=GEMINI_API_KEY)

async def generate_embedding(text: str) -> list[float]:
    # We will run this synchronously since the native GenAI SDK is sync by default
    # If the key is missing, return a dummy embedding so it doesn't crash
    if not GEMINI_API_KEY:
        return [0.0] * 768
        
    client = get_client()
    try:
        response = client.models.embed_content(
            model="text-embedding-004",
            contents=text
        )
        return response.embeddings[0].values
    except Exception as e:
        print(f"Embedding failed: {str(e)}")
        return [0.0] * 768
