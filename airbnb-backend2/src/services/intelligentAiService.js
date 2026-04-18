import axios from 'axios';

const AI_BASE_URL = process.env.AI_API_URL || 'http://localhost:8001/ai';

export const syncListingEmbedding = async (listing) => {
    try {
        const data = {
            listing_id: listing._id.toString(),
            text: `${listing.title || ''} ${listing.description || ''} ${listing.location?.address || ''}`,
            metadata: {
                price: listing.price,
                type: listing.propertyType,
                status: listing.status || 'active'
            }
        };
        const response = await axios.post(`${AI_BASE_URL}/embeddings/sync`, data);
        return response.data;
    } catch (error) {
        console.error('AI Sync Listing Error:', error?.response?.data || error.message);
        return null; 
    }
};

export const getRecommendations = async (userId, filters = {}, limit = 20) => {
    try {
        const response = await axios.post(`${AI_BASE_URL}/recommendations/`, {
            user_id: userId.toString(),
            filters,
            limit
        });
        return response.data;
    } catch (error) {
        console.error('AI Recommendations Error:', error?.response?.data || error.message);
        return { listings: [] }; 
    }
};

export const checkFraud = async (entityType, entityId, data) => {
    try {
        const response = await axios.post(`${AI_BASE_URL}/fraud/check`, {
            entity_type: entityType,
            entity_id: entityId.toString(),
            data
        });
        return response.data;
    } catch (error) {
        console.error('AI Fraud Check Error:', error?.response?.data || error.message);
        return { risk_score: 0, flagged: false, reasons: [] };
    }
};

export const getPricePrediction = async (propertyDetails) => {
    try {
        const response = await axios.post(`${AI_BASE_URL}/price/predict`, propertyDetails);
        return response.data;
    } catch (error) {
        console.error('AI Price Predict Error:', error?.response?.data || error.message);
        return null;
    }
};
