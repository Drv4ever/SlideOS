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

  let textAmountGuideline = "";
  if (textAmount === "minimal") {
    textAmountGuideline = "Exactly 1-2 bullet points per slide. Each point must be a single short sentence (max 8 words). Very brief.";
  } else if (textAmount === "concise") {
    textAmountGuideline = "Exactly 2-3 bullet points per slide. Each point must be a clean, direct sentence (10-15 words).";
  } else if (textAmount === "detailed") {
    textAmountGuideline = "Exactly 3-4 bullet points per slide. Each point must be a complete, well-formed, highly informative sentence providing clear context.";
  } else if (textAmount === "extensive") {
    textAmountGuideline = "Exactly 4-6 rich bullet points per slide. Each point must contain 2-3 detailed, descriptive sentences with comprehensive explanations, facts, or technical details.";
  } else {
    textAmountGuideline = `Follow text density level: ${textAmount}`;
  }

  const systemPrompt = `You are a professional PowerPoint presentation generator that outputs rich, structured JSON.

Return STRICT JSON ONLY in this format:
{
  "title": string,
  "slides": [
    {
      "slideNumber": number,
      "heading": string,
      "content": string[],
      "imageKeyword": string,
      "layout": string
    }
  ]
}

Field definitions:
- "heading": Slide title (concise, 3-8 words)
- "content": Array of bullet points following the text density rules
- "imageKeyword": 2-4 word search query for a stock photo that visually enhances this slide. Extract the most visual/concrete concept from the slide content. Examples: "solar panels desert", "diverse team meeting", "city skyline night", "medical research lab", "abstract data visualization". DO NOT use generic words like "business", "technology", "concept". Be specific and concrete.
- "layout": One of these template types based on slide purpose:
  - "title-slide" → For the FIRST slide only. Large centered heading, subtitle, full background image.
  - "bullets-image" → For slides with 3+ bullet points. Heading top-left, bullets on left, image on right.
  - "two-column" → For comparing two ideas. Two columns with sub-headings and bullets side by side.
  - "big-stat" → For a single key number/statistic or impactful claim. Large central number/text with supporting context.
  - "section-divider" → For major section transitions mid-deck. Minimal text over a full background image. Should NOT be used for first/last slides.
  - "content-only" → For dense information slides. Clean heading + bullet points layout, no image needed. Use this when a slide doesn't have a strong visual concept.

Layout assignment rules:
- Slide 1 MUST use "title-slide"
- If the slide content expresses a single strong statistic, use "big-stat"
- If the slide compares two sides/approaches, use "two-column"
- If it's a section transition (usually every 3-4 slides), use "section-divider"
- If a clear visual keyword exists, prefer "bullets-image" over "content-only"
- Only use "content-only" when no good visual keyword exists

Rules:
- Slides count = ${slides}
- Text density guideline = ${textAmountGuideline}
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
         model: "openai/gpt-oss-20b",
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
    console.error("Groq API error:", err.message || err);
    throw err;
  }
}
