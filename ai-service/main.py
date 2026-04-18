from fastapi import FastAPI
from app.api.routes import embeddings, recommendations, fraud, price

app = FastAPI(title="Rental AI System", version="1.0.0")

app.include_router(embeddings.router, prefix="/ai/embeddings", tags=["embeddings"])
app.include_router(recommendations.router, prefix="/ai/recommendations", tags=["recommendations"])
app.include_router(fraud.router, prefix="/ai/fraud", tags=["fraud"])
app.include_router(price.router, prefix="/ai/price", tags=["price"])

@app.get("/health")
def health_check():
    return {"status": "healthy"}
