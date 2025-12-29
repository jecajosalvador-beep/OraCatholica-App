
import { GoogleGenAI } from "@google/genai";

export async function getLiturgicalExplanation(season: string, day: string, color: string) {
  try {
    // Initializing with the required named parameter and direct environment variable
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const prompt = `Explain the Roman Catholic liturgical significance of the day: "${day}" in the season of "${season}". The liturgical color is "${color}". Keep it brief (2-3 sentences), reverent, and informative for a layperson.`;
    
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
    });
    
    // Accessing .text property as per guidelines
    return response.text;
  } catch (error) {
    console.error("Gemini Error:", error);
    return "The liturgical season is a time for prayer, reflection, and spiritual growth in union with the Church's mysteries.";
  }
}