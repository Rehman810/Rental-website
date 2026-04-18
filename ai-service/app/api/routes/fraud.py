from fastapi import APIRouter
from app.models.schemas import FraudCheckRequest

router = APIRouter()

@router.post("/check")
async def check_fraud(req: FraudCheckRequest):
    reasons = []
    risk_score = 0.0
    data = req.data
    
    if req.entity_type == "listing":
        # 1. Price Anomaly Check
        price = data.get("price")
        if price is not None:
            if price > 5000:
                reasons.append("price_exceptionally_high")
                risk_score += 0.4
            elif price < 10:
                reasons.append("price_suspiciously_low")
                risk_score += 0.3
                
        # 2. Description keyword flags
        description = str(data.get("description", "")).lower()
        flagged_phrases = ["pay outside", "crypto only", "wire transfer", "send money to"]
        for phrase in flagged_phrases:
            if phrase in description:
                reasons.append(f"flagged_keyword_found_{phrase.replace(' ', '_')}")
                risk_score += 0.6
                
    elif req.entity_type == "user":
        # Check burst activity, etc. (simplified for now)
        pass

    flagged = risk_score >= 0.7
    risk_score = min(risk_score, 1.0) # Cap at 1.0
    
    return {"risk_score": risk_score, "flagged": flagged, "reasons": reasons}
