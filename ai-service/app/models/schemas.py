from pydantic import BaseModel
from typing import Optional, Dict, Any, List

class ListingData(BaseModel):
    listing_id: str
    text: str
    metadata: Optional[Dict[str, Any]] = None

class RecommendationRequest(BaseModel):
    user_id: str
    filters: Optional[Dict[str, Any]] = None
    limit: int = 20

class FraudCheckRequest(BaseModel):
    entity_type: str
    entity_id: str
    data: Dict[str, Any]

class PricePredictionRequest(BaseModel):
    lat: float
    lng: float
    bedrooms: int
    property_type: str
    date: str
