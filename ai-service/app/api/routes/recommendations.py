from fastapi import APIRouter, HTTPException
from app.models.schemas import RecommendationRequest
from app.services.pinecone_service import get_user_index, get_listing_index
from app.services.embedding_service import generate_embedding
import time

router = APIRouter()

@router.post("/")
async def get_recommendations(req: RecommendationRequest):
    start_time = time.time()
    
    # 1. Try to fetch user embedding
    user_idx = get_user_index()
    user_data = user_idx.fetch(ids=[req.user_id])
    
    if hasattr(user_data, 'vectors') and req.user_id in user_data.vectors:
        user_vector = user_data.vectors[req.user_id].values
    else:
        # Fallback to an average positive embedding if user is new
        user_vector = await generate_embedding("popular safe clean comfortable modern central")

    # 2. Query Pinecone for similar listings
    listing_idx = get_listing_index()
    
    # Build filter from request if any
    filter_dict = {}
    if req.filters:
        if "location" in req.filters:
            filter_dict["location"] = {"$eq": req.filters["location"]}
        if "price_max" in req.filters:
            filter_dict["price"] = {"$lte": req.filters["price_max"]}
        if "type" in req.filters:
            filter_dict["type"] = {"$eq": req.filters["type"]}
            
    query_response = listing_idx.query(
        vector=user_vector,
        top_k=req.limit,
        include_values=False,
        include_metadata=True,
        filter=filter_dict if filter_dict else None
    )
    
    listings = [match.id for match in query_response.matches]
    latency_ms = int((time.time() - start_time) * 1000)
    
    return {"listings": listings, "latency_ms": latency_ms}
