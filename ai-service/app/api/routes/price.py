from fastapi import APIRouter
from app.models.schemas import PricePredictionRequest

router = APIRouter()

@router.post("/predict")
async def predict_price(req: PricePredictionRequest):
    # Stub: Normally we'd load our XGBoost model here.
    # For now, let's create a deterministic output based on inputs to simulate the model.
    base_price = 50.0
    
    # Simple heuristics to mock pricing
    price = base_price + (req.bedrooms * 20.0)
    
    if req.property_type.lower() == "villa":
        price *= 2.5
    elif req.property_type.lower() == "apartment":
        price *= 1.2
        
    # Slightly vary price based on lat/lng (mock factor)
    location_factor = 1 + (abs(req.lat + req.lng) % 100) / 100.0
    
    suggested = round(price * location_factor, 2)
    upper = round(suggested * 1.2, 2)
    lower = round(suggested * 0.8, 2)
    
    return {"suggested_price": suggested, "range": [lower, upper]}
