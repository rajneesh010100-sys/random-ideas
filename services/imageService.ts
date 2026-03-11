import { GoogleGenAI } from "@google/genai";

export async function generateCaricature(description: string): Promise<string | null> {
  try {
    const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: {
        parts: [
          {
            text: `A stylized, artistic caricature of a person's future self based on this life trajectory description: "${description}". 
            The style should be modern, clean, and slightly surreal, reflecting the mood of the trajectory. 
            High quality, cinematic lighting, conceptual art style.`,
          },
        ],
      },
      config: {
        imageConfig: {
          aspectRatio: "1:1",
        },
      },
    });

    for (const part of response.candidates[0].content.parts) {
      if (part.inlineData) {
        return `data:image/png;base64,${part.inlineData.data}`;
      }
    }
    return null;
  } catch (error) {
    console.error("Error generating caricature:", error);
    return null;
  }
}
