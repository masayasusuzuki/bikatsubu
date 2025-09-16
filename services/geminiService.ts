import { GoogleGenAI } from "@google/genai";

// Ensure the API key is available in the environment variables
const API_KEY = process.env.API_KEY;

if (!API_KEY) {
  // In a real app, you might want to handle this more gracefully.
  // For this context, we assume it's always provided.
  console.warn("API_KEY environment variable not set. Gemini API calls will fail.");
}

const ai = new GoogleGenAI({ apiKey: API_KEY! });

export const generateBeautyTip = async (): Promise<string> => {
  try {
    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: 'Provide a short, insightful beauty tip for general consumers interested in skincare and makeup. Keep it under 50 words and format it as a single paragraph.',
        config: {
            temperature: 0.8,
            topP: 0.95,
        }
    });

    return response.text;
  } catch (error) {
    console.error("Error generating beauty tip:", error);
    return "Failed to generate a beauty tip. Please check your connection and API key.";
  }
};