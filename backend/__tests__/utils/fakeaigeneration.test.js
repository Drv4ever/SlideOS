import { fakeAIGenerate } from "../../src/utils/fakeaigeneration.js";

describe("fakeAIGenerate", () => {
  const baseParams = {
    prompt: "Machine Learning Basics",
    slides: 5,
    textAmount: "detailed",
    theme: "cornflower",
    tone: "professional",
    audience: "general",
    scenario: "educational",
  };

  describe("output structure", () => {
    test("should return an object with title, theme, and slides", () => {
      const result = fakeAIGenerate(baseParams);
      expect(result).toHaveProperty("title");
      expect(result).toHaveProperty("theme");
      expect(result).toHaveProperty("slides");
      expect(Array.isArray(result.slides)).toBe(true);
    });

    test("should use prompt as title", () => {
      const result = fakeAIGenerate(baseParams);
      expect(result.title).toBe("Machine Learning Basics");
    });

    test("should use provided theme", () => {
      const result = fakeAIGenerate(baseParams);
      expect(result.theme).toBe("cornflower");
    });

    test("should generate correct number of slides", () => {
      const result = fakeAIGenerate({ ...baseParams, slides: 3 });
      expect(result.slides).toHaveLength(3);
    });

    test("should generate slides with required fields", () => {
      const result = fakeAIGenerate(baseParams);
      result.slides.forEach((slide) => {
        expect(slide).toHaveProperty("slideNumber");
        expect(slide).toHaveProperty("heading");
        expect(slide).toHaveProperty("content");
        expect(slide).toHaveProperty("imageKeyword");
        expect(slide).toHaveProperty("layout");
        expect(Array.isArray(slide.content)).toBe(true);
      });
    });

    test("should have sequential slide numbers starting from 1", () => {
      const result = fakeAIGenerate({ ...baseParams, slides: 5 });
      result.slides.forEach((slide, i) => {
        expect(slide.slideNumber).toBe(i + 1);
      });
    });
  });

  describe("text density", () => {
    test("should generate 2 bullet points per slide for minimal", () => {
      const result = fakeAIGenerate({ ...baseParams, textAmount: "minimal" });
      result.slides.forEach((slide) => {
        expect(slide.content).toHaveLength(2);
      });
    });

    test("should generate 3 bullet points per slide for concise", () => {
      const result = fakeAIGenerate({ ...baseParams, textAmount: "concise" });
      result.slides.forEach((slide) => {
        expect(slide.content).toHaveLength(3);
      });
    });

    test("should generate 4 bullet points per slide for detailed", () => {
      const result = fakeAIGenerate({ ...baseParams, textAmount: "detailed" });
      result.slides.forEach((slide) => {
        expect(slide.content).toHaveLength(4);
      });
    });

    test("should generate 5 bullet points per slide for extensive", () => {
      const result = fakeAIGenerate({ ...baseParams, textAmount: "extensive" });
      result.slides.forEach((slide) => {
        expect(slide.content).toHaveLength(5);
      });
    });

    test("should default to 3 bullet points for unknown textAmount", () => {
      const result = fakeAIGenerate({ ...baseParams, textAmount: "unknown" });
      result.slides.forEach((slide) => {
        expect(slide.content).toHaveLength(3);
      });
    });
  });

  describe("layout and image keyword assignment", () => {
    test("should assign title-slide layout to first slide", () => {
      const result = fakeAIGenerate({ ...baseParams, slides: 5 });
      expect(result.slides[0].layout).toBe("title-slide");
    });

    test("should assign valid layout types to all slides", () => {
      const validLayouts = ["title-slide", "bullets-image", "two-column", "big-stat", "section-divider", "content-only", "comparison"];
      const result = fakeAIGenerate({ ...baseParams, slides: 10 });
      result.slides.forEach((slide) => {
        expect(validLayouts).toContain(slide.layout);
      });
    });

    test("should assign non-empty imageKeyword to all slides", () => {
      const result = fakeAIGenerate({ ...baseParams, slides: 5 });
      result.slides.forEach((slide) => {
        expect(slide.imageKeyword).toBeTruthy();
        expect(typeof slide.imageKeyword).toBe("string");
      });
    });
  });

  describe("edge cases", () => {
    test("should handle 1 slide", () => {
      const result = fakeAIGenerate({ ...baseParams, slides: 1 });
      expect(result.slides).toHaveLength(1);
      expect(result.slides[0].layout).toBe("title-slide");
    });

    test("should handle 20 slides (max)", () => {
      const result = fakeAIGenerate({ ...baseParams, slides: 20 });
      expect(result.slides).toHaveLength(20);
    });

    test("should generate unique headings for each slide", () => {
      const result = fakeAIGenerate({ ...baseParams, slides: 8 });
      const headings = result.slides.map((s) => s.heading);
      const unique = new Set(headings);
      expect(unique.size).toBeGreaterThan(1);
    });
  });
});
