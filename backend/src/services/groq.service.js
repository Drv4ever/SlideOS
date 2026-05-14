export async function generateWithGroq({
  audience,
  prompt,
  scenario,
  slides,
  textAmount,
  theme,
  tone = "neutral",
}) {
  const apiKey = process.env.GROQ_API_KEY;

  if (!apiKey) {
    throw new Error("GROQ_API_KEY is not defined. Check your .env file.");
  }

  const systemPrompt = `You are a PowerPoint presentation generator.
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
- STRICTLY NO explanations, just the JSON object`;

  try {
    const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "llama-3.3-70b-versatile",
        temperature: 0.7,
        response_format: {
          type: "json_object",
        },
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: `Topic: ${prompt}` },
        ],
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Groq API request failed: ${response.status} ${errorText}`);
    }

    const data = await response.json();
    const raw = data?.choices?.[0]?.message?.content;

    if (!raw) {
      throw new Error("Groq response did not include any content.");
    }

    const cleanRaw = raw.replace(/```json|```/gi, "").trim();
    return JSON.parse(cleanRaw);
  } catch (err) {
    console.error("Groq API error:", err);
    throw new Error("Groq generation failed.");
  }
}
