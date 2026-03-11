import { GoogleGenAI, Type } from "@google/genai";

const API_KEY = process.env.GEMINI_API_KEY;

if (!API_KEY) {
  throw new Error("GEMINI_API_KEY environment variable is not set");
}

const ai = new GoogleGenAI({ apiKey: API_KEY });

export interface TimelineData {
  yearsAhead: number;
  career: string;
  financial: string;
  mentalHealth: string;
  relationships: string;
  regretIndex: number;
  fulfillmentIndex: number;
  whyThisHappened: string;
  smallDecisionToday: string;
  majorMilestone: string;
  healthStatus: string;
  funnyDetail: string;
}

export interface Trajectory {
  title: string;
  description: string;
  timelines: TimelineData[];
}

export interface GenerationResult {
  trajectories: Trajectory[];
}

export async function generateTimelines(
  age: number,
  profession: string,
  dilemma: string,
  riskTolerance: string,
  coreValue: string,
  brutalHonesty: boolean,
  savings: string,
  relationshipStatus: string,
  healthPriority: string,
  personality: string,
  location: string,
  ambition: string
): Promise<GenerationResult> {
  const systemInstruction = `You are a world-class psychologist and life strategist with a dark, witty sense of humor. 
Your task is to generate 3 distinct, psychologically realistic life trajectories based on a user's current situation.
Each trajectory should span 20 years, with snapshots at EVERY 2 YEARS (2, 4, 6, 8, 10, 12, 14, 16, 18, 20).

Tone: Grounded, realistic, slightly confrontational but constructive. Use a witty, slightly sarcastic, and humorous tone for the 'funnyDetail' field.
${brutalHonesty ? "CRITICAL: Brutal Honesty Mode is ON. Remove all optimism bias. Be blunt about potential failures, burnout, and the harsh consequences of poor decisions or stagnation." : "Maintain a balanced, realistic perspective."}

For each trajectory, provide:
1. A title and brief description of the path taken.
2. Snapshots at 2, 4, 6, 8, 10, 12, 14, 16, 18, and 20 years.
3. For each snapshot: Career, Financial, Mental Health, Relationships, Health Status, Regret Index (0-10), Fulfillment Index (0-10), a 'Major Milestone', 'Why this happened', 'Small decision today', and 'funnyDetail' (a hilarious, gradual change or observation about their life in funny language).`;

  const prompt = `
User Profile:
- Current Age: ${age}
- Profession: ${profession}
- Major Dilemma: ${dilemma}
- Risk Tolerance: ${riskTolerance}
- Core Value: ${coreValue}
- Current Financial State: ${savings}
- Relationship Status: ${relationshipStatus}
- Health Priority: ${healthPriority}
- Personality Archetype: ${personality}
- Current/Desired Location: ${location}
- Primary Ambition: ${ambition}

Please generate the 3 trajectories in JSON format.`;

  const response = await ai.models.generateContent({
    model: "gemini-3.1-pro-preview",
    contents: prompt,
    config: {
      systemInstruction,
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          trajectories: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                title: { type: Type.STRING },
                description: { type: Type.STRING },
                timelines: {
                  type: Type.ARRAY,
                  items: {
                    type: Type.OBJECT,
                    properties: {
                      yearsAhead: { type: Type.NUMBER },
                      career: { type: Type.STRING },
                      financial: { type: Type.STRING },
                      mentalHealth: { type: Type.STRING },
                      relationships: { type: Type.STRING },
                      regretIndex: { type: Type.NUMBER },
                      fulfillmentIndex: { type: Type.NUMBER },
                      whyThisHappened: { type: Type.STRING },
                      smallDecisionToday: { type: Type.STRING },
                      majorMilestone: { type: Type.STRING },
                      healthStatus: { type: Type.STRING },
                      funnyDetail: { type: Type.STRING },
                    },
                    required: ["yearsAhead", "career", "financial", "mentalHealth", "relationships", "healthStatus", "regretIndex", "fulfillmentIndex", "whyThisHappened", "smallDecisionToday", "majorMilestone", "funnyDetail"],
                  },
                },
              },
              required: ["title", "description", "timelines"],
            },
          },
        },
        required: ["trajectories"],
      },
    },
  });

  if (!response.text) {
    throw new Error("No response from Gemini");
  }

  return JSON.parse(response.text) as GenerationResult;
}
