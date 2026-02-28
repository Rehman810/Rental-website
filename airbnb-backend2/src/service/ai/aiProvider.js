import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const ai = new GoogleGenAI({
    apiKey: process.env.GEMINI_API_KEY,
});

export const generateAiReply = async (prompt) => {
    const startTime = Date.now();
    try {
        const response = await ai.models.generateContent({
            model: process.env.AI_MODEL || "gemini-1.5-flash",
            contents: [
                {
                    role: "user",
                    parts: [{ text: prompt }],
                },
            ],
            generationConfig: {
                temperature: 0.5,
                maxOutputTokens: 300,
            },
        });

        const text = response.text;

        const latency = Date.now() - startTime;
        console.log(`[AI Latency]: ${latency}ms`);

        return text;
    } catch (error) {
        console.error("Gemini API Error:", error);
        throw error;
    }
};
