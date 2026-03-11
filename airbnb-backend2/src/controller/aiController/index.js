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

Generate a high-converting Airbnb-style rental listing.

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

        const text = await generateAiReply(prompt);

        // Remove markdown block if model ignored the responseMimeType
        text = text.replace(/^```json\s*/, "").replace(/\s*```$/, "");

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