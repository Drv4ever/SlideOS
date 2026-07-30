import { normalizePresentation, themeToColors, CURATED_LOOKUP } from "../../utils/slideModel.js";
import { themes } from "../../utils/themes.js";

describe("slideModel", () => {
  describe("normalizePresentation", () => {
    test("should return default for null data", () => {
      const result = normalizePresentation(null, "cornflower");
      expect(result.title).toBe("Untitled");
      expect(result.theme).toEqual(CURATED_LOOKUP.cornflower);
      expect(result.slides).toEqual([]);
    });

    test("should normalize LLM-generated slides with image and layout", () => {
      const data = {
        title: "My Presentation",
        theme: "cornflower",
        slides: [
          {
            slideNumber: 1,
            heading: "Introduction",
            content: ["Point 1", "Point 2"],
            imageKeyword: "business meeting",
            layout: "title-slide",
            image: { url: "https://example.com/img.jpg", thumb: "thumb.jpg", alt: "Meeting" },
          },
        ],
      };

      const result = normalizePresentation(data, "cornflower");
      expect(result.title).toBe("My Presentation");
      expect(result.slides[0].layout).toBe("title-slide");
      expect(result.slides[0].imageKeyword).toBe("business meeting");
      expect(result.slides[0].image).toEqual({ url: "https://example.com/img.jpg", thumb: "thumb.jpg", alt: "Meeting" });
      expect(result.slides[0].content).toEqual(["Point 1", "Point 2"]);
    });

    test("should normalize editor-format slides with elements array", () => {
      const data = {
        title: "Editor Format",
        theme: "orbit",
        slides: [
          {
            layout: "content-only",
            heading: "Slide 1",
            elements: [
              { type: "heading", content: "Slide 1" },
              { type: "bullet", items: ["Point A", "Point B"] },
            ],
          },
        ],
      };

      const result = normalizePresentation(data, "orbit");
      expect(result.slides[0].layout).toBe("content-only");
      expect(result.slides[0].heading).toBe("Slide 1");
      expect(result.slides[0].elements).toHaveLength(2);
    });

    test("should assign default layout when none provided", () => {
      const data = {
        title: "No Layout",
        slides: [{ heading: "Slide 1", content: ["A"] }],
      };

      const result = normalizePresentation(data, "cornflower");
      expect(result.slides[0].layout).toBeTruthy();
    });

    test("should use fallback theme when theme is missing", () => {
      const data = { title: "No Theme", slides: [] };
      const result = normalizePresentation(data, "noir");
      expect(result.theme).toEqual(CURATED_LOOKUP.noir);
    });

    test("should use cornflower theme as ultimate fallback", () => {
      const data = { title: "Fallback", slides: [] };
      const result = normalizePresentation(data, "nonexistent");
      expect(result.theme).toEqual(CURATED_LOOKUP.cornflower);
    });
  });

  describe("themeToColors", () => {
    test("should extract colors from theme", () => {
      const theme = themes[0];
      const colors = themeToColors(theme);
      expect(colors.primary).toBe(theme.colors.primary);
      expect(colors.accent).toBe(theme.colors.accent);
      expect(colors.background).toBe(theme.colors.background);
      expect(colors.text).toBe(theme.colors.text);
    });

    test("should use defaults for missing colors", () => {
      const colors = themeToColors({});
      expect(colors.primary).toBe("#f97316");
      expect(colors.background).toBe("#ffffff");
      expect(colors.text).toBe("#111827");
    });

    test("should use defaults for null theme", () => {
      const colors = themeToColors(null);
      expect(colors.primary).toBe("#f97316");
      expect(colors.background).toBe("#ffffff");
    });
  });
});
