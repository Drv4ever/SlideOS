
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
      console.warn("Groq failed, using fake AI");
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
