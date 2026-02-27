import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";
dotenv.config();

const ai = new GoogleGenAI({
    apiKey: process.env.GEMINI_API_KEY,
});

async function run() {
    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: "hi",
        });
        console.log("2.5-flash:", response.text);
    } catch (e) {
        console.error("2.5-flash error:", e.message);
    }

    try {
        const response2 = await ai.models.generateContent({
            model: "gemini-flash-latest",
            contents: "hi",
        });
        console.log("flash-latest:", response2.text);
    } catch (e) {
        console.error("flash-latest error:", e.message);
    }
}
run();
