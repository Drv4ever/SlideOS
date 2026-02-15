import { GoogleGenAI } from "@google/genai";

export async function generateWithGemini({
  audience,
  prompt,
  scenario,
  slides,
  textAmount,
  theme,
  tone = "neutral",
}) {
  // 1. Initialize inside the function to ensure process.env is ready
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) {
    throw new Error("GEMINI_API_KEY is not defined. Check your .env file.");
  }

  // 2. Pass the key explicitly to the constructor
  const ai = new GoogleGenAI({
    apiKey: apiKey,
  });

  const systemPrompt = `You are a PowerPoint presentation generator
  Return STRICT JSON ONLY in this format:
{
  "title": string,
  "slides": [
    {
      "slideNumber": number,
      "heading": string,
      "content": string[]
    }
  ]
}

Rules:
- Slides count = ${slides}
- Text detail = ${textAmount}
- Theme = ${theme}
- Tone = ${tone}
- Audience = ${audience || "general"}
- Scenario = ${scenario || "educational"}
- ABSOLUTELY NO markdown
- STRICTLY NO explanations, just the JSON object
`;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: [
        { role: "user", parts: [{ text: systemPrompt }] },
        { role: "user", parts: [{ text: `Topic: ${prompt}` }] }
      ],
      config: {
        response_mime_type: "application/json",
      }
    });

    const raw = response.text;
    const cleanRaw = raw.replace(/```json|```/gi, "").trim();
    return JSON.parse(cleanRaw);

  } catch (err) {
    console.error("Gemini 3 API error:", err);
    throw new Error("Gemini 3 generation failed.");
  }
}