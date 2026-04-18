from fastapi import APIRouter
from app.models.schemas import ListingData
from app.services.embedding_service import generate_embedding
from app.services.pinecone_service import get_listing_index

router = APIRouter()

@router.post("/sync")
async def sync_embedding(data: ListingData):
    # Generate the embedding vector using OpenAI
    vector = await generate_embedding(data.text)
    
    # Store the vector in Pinecone
    index = get_listing_index()
    index.upsert(
        vectors=[
            {
                "id": data.listing_id,
                "values": vector,
                "metadata": data.metadata or {}
            }
        ]
    )
    
    return {"status": "success", "vector_id": data.listing_id}
