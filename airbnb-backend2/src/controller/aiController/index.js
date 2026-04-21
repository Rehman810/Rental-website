import { generateAiReply } from "../../service/ai/aiProvider.js";
import { buildHostAssistantPrompt } from "../../service/ai/promptBuilder.js";


export const generateListing = async (req, res) => {
    try {
        const {
            location,
            propertyType,
            bedrooms,
            bathrooms,
            guests,
            amenities,
            nearbyAttractions,
            cityAvgPrice,
            demandLevel,
        } = req.body;

        const prompt = `
You are a senior real estate marketing strategist and pricing analyst.

Generate a high-converting ${process.env.APP_NAME} listing.

Return ONLY valid JSON in this format:

{
  "title": "",
  "description": "",
  "pricing": {
    "basePrice": "",
    "weekendPrice": "",
    "recommendedRange": ""
  },
  "seoKeywords": [],
  "hostSuggestions": []
}

Location: ${location}
Property Type: ${propertyType}
Bedrooms: ${bedrooms}
Bathrooms: ${bathrooms}
Guests: ${guests}
Amenities: ${amenities}
Nearby Attractions: ${nearbyAttractions}
City Avg Price: ${cityAvgPrice}
Demand Level: ${demandLevel}
`;

        let text = await generateAiReply(prompt);

        // Remove markdown block if model ignored the responseMimeType
        if (text) {
            text = text.replace(/^```json\s*/, "").replace(/\s*```$/, "");
        }

        const parsed = JSON.parse(text);

        return res.json({
            success: true,
            data: parsed,
        });


    } catch (error) {
        console.error("REAL ERROR:", error);
        return res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

export const assistantChat = async (req, res) => {
    try {
        const { propertyData, chatHistory, guestMessage } = req.body;

        if (!propertyData || !guestMessage) {
            return res.status(400).json({
                success: false,
                message: "Missing propertyData or guestMessage"
            });
        }

        const prompt = buildHostAssistantPrompt(propertyData, chatHistory || [], guestMessage);

        const reply = await generateAiReply(prompt);

        return res.json({
            success: true,
            reply: reply.trim()
        });

    } catch (error) {
        console.error("AI Assistant Chat Error:", error);
        return res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

import { getRecommendations as fetchRecommendations, getPricePrediction as fetchPricePrediction } from '../../services/intelligentAiService.js';
import Listing from '../../model/listingModel/index.js'; // fixed import

export const getSmartRecommendations = async (req, res) => {
    try {
        const userId = req.user ? req.user._id : 'guest';

        const filters = { ...req.query };
        if (filters.price_max) filters.price_max = parseFloat(filters.price_max);

        const recommendations = await fetchRecommendations(userId, filters, 20);

        if (!recommendations || recommendations.listings.length === 0) {
            // Fetch default latest listings
            const defaultListings = await Listing.find({ status: 'active' }).limit(10);
            return res.json({ success: true, message: "Fallback listings fetched", data: { results: defaultListings } });
        }

        // Fetch full listing documents from MongoDB
        const listings = await Listing.find({ _id: { $in: recommendations.listings } });

        return res.json({ success: true, message: "AI Recommendations fetched successfully", data: { results: listings } });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
};

export const getSmartPricing = async (req, res) => {
    try {
        const { lat, lng, bedrooms, property_type, date } = req.body;
        const pricePrediction = await fetchPricePrediction({ lat, lng, bedrooms, property_type, date });
        return res.json({ success: true, message: "Smart pricing predicted successfully", data: pricePrediction });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
};