import { generateAiReply } from './aiProvider.js';

export const generateListingSummary = async (listing) => {
    const prompt = `Generate a short, structured summary for a rental listing to be used as context for an AI assistant.
  
Title: ${listing.title}
Price: ${listing.weekdayPrice}
Location: ${listing.city}
Amenities: ${listing.amenities?.join(', ')}
Capacity: ${listing.guestCapacity}
Type: ${listing.placeType}

Provide a concise 2-3 sentence summary that highlights the best features and key information.`;

    return await generateAiReply(prompt);
};
