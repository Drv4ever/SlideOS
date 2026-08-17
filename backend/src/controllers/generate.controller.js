
import { fakeAIGenerate } from "../utils/fakeaigeneration.js";
import { validateGenerateInput } from "../validaters/generate.validator.js";
import { generateWithGroq } from "../services/groq.service.js";
import { fetchSlideImages } from "../services/image.service.js";

export const generatePresentation = async (req, res) => {
  try {
    const data = req.body;

    const error = validateGenerateInput(data);
    if (error) {
      return res.status(400).json({ success: false, error });
    }

    let presentation;

    try {
      presentation = await generateWithGroq(data);
    } catch (aiError) {
      console.error("Groq API error:", aiError.message);
      const errMsg = aiError.message;
      if (
        errMsg.includes("GROQ_API_KEY") ||
        errMsg.includes("401") ||
        errMsg.includes("403") ||
        errMsg.includes("400") ||
        errMsg.includes("billing") ||
        errMsg.includes("Unauthorized") ||
        errMsg.includes("invalid_api_key") ||
        errMsg.includes("rate limit") ||
        errMsg.includes("Rate limit") ||
        errMsg.includes("insufficient_quota")
      ) {
        throw new Error(`Groq API failed: ${errMsg}`);
      }
      console.warn("Groq failed, using fallback generation");
      presentation = fakeAIGenerate(data);
    }

    const images = await fetchSlideImages(presentation.slides);

    presentation.slides = presentation.slides.map((slide, i) => ({
      ...slide,
      image: images[i],
    }));

    return res.status(200).json({
      success: true,
      data: presentation,
    });

  } catch (error) {
    console.error("GENERATION ERROR:", error);
    return res.status(500).json({ success: false, error: "An unexpected error occurred.", details: error.message });
  }
};

// the basic flow
// Button Click
//  ↓
// POST /api/generate
//  ↓
// Controller
//  ↓
// Fake AI Logic (rules)
//  ↓
// Structured JSON
//  ↓
// Frontend renders
