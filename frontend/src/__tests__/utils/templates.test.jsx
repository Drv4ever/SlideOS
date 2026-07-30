import {
  applyTemplate,
  applyTitleSlide,
  applyBulletsImage,
  applyTwoColumn,
  applyBigStat,
  applySectionDivider,
  applyContentOnly,
  applyComparison,
  TEMPLATE_REGISTRY,
  TEMPLATE_TYPES,
  getTemplateInfo,
  SLIDE_WIDTH,
  SLIDE_HEIGHT,
} from "../../utils/templates.js";

const mockTheme = {
  colors: {
    primary: "#2563eb",
    accent: "#f97316",
    background: "#ffffff",
    surface: "#f8fafc",
    border: "#e5e7eb",
    text: "#1e293b",
    textMuted: "#6b7280",
  },
  fontFamily: {
    heading: "Clash Display",
    body: "DM Sans",
  },
};

const mockImage = {
  url: "https://images.unsplash.com/test-image",
  thumb: "https://images.unsplash.com/test-thumb",
  alt: "Test image description",
  attribution: { name: "Test User", link: "https://unsplash.com/@test" },
};

describe("Templates", () => {
  describe("constants", () => {
    test("should export canvas dimensions", () => {
      expect(SLIDE_WIDTH).toBe(1100);
      expect(SLIDE_HEIGHT).toBe(618);
    });

    test("should export all template types", () => {
      expect(TEMPLATE_TYPES).toEqual([
        "title-slide",
        "bullets-image",
        "two-column",
        "big-stat",
        "section-divider",
        "content-only",
        "comparison",
      ]);
    });

    test("should have all template types registered", () => {
      TEMPLATE_TYPES.forEach((type) => {
        expect(TEMPLATE_REGISTRY[type]).toBeDefined();
        expect(typeof TEMPLATE_REGISTRY[type]).toBe("function");
      });
    });
  });

  describe("getTemplateInfo", () => {
    test("should return info for title-slide", () => {
      const info = getTemplateInfo("title-slide");
      expect(info.name).toBe("title-slide");
      expect(info.hasImage).toBe(true);
      expect(info.hasBackground).toBe(true);
      expect(info.description).toBeTruthy();
    });

    test("should return info for content-only", () => {
      const info = getTemplateInfo("content-only");
      expect(info.hasImage).toBe(false);
      expect(info.hasBackground).toBe(false);
    });

    test("should return info for bullets-image", () => {
      const info = getTemplateInfo("bullets-image");
      expect(info.hasImage).toBe(true);
      expect(info.hasBackground).toBe(false);
    });

    test("should return info for unknown layout", () => {
      const info = getTemplateInfo("unknown-layout");
      expect(info.name).toBe("unknown-layout");
      expect(info.hasImage).toBe(false);
      expect(info.hasBackground).toBe(false);
    });
  });

  describe("applyTitleSlide", () => {
    test("should create title slide with heading and background image", () => {
      const slide = {
        heading: "My Presentation",
        image: mockImage,
        layout: "title-slide",
      };
      const result = applyTitleSlide(slide, mockTheme);

      expect(result.background.type).toBe("image");
      expect(result.background.value).toBe(mockImage.url);
      expect(result.elements).toHaveLength(1);
      expect(result.elements[0].type).toBe("text");
      expect(result.elements[0].content).toBe("My Presentation");
      expect(result.elements[0].fontSize).toBe(56);
      expect(result.elements[0].align).toBe("center");
      expect(result.elements[0].zIndex).toBe(1);
    });

    test("should use gradient background when no image", () => {
      const slide = { heading: "No Image Slide", layout: "title-slide" };
      const result = applyTitleSlide(slide, mockTheme);

      expect(result.background.type).toBe("gradient");
      expect(result.elements[0].color).toBe(mockTheme.colors.text);
    });

    test("should include subtitle when provided", () => {
      const slide = {
        heading: "Main Title",
        subtitle: "A subtitle here",
        image: mockImage,
      };
      const result = applyTitleSlide(slide, mockTheme);

      expect(result.elements).toHaveLength(2);
      expect(result.elements[1].content).toBe("A subtitle here");
    });
  });

  describe("applyBulletsImage", () => {
    test("should position bullets left and image right without overlap", () => {
      const slide = {
        heading: "Key Points",
        content: ["Point 1", "Point 2", "Point 3"],
        image: mockImage,
        layout: "bullets-image",
      };
      const result = applyBulletsImage(slide, mockTheme);

      const heading = result.elements.find((e) => e.id === "heading");
      const bullets = result.elements.filter((e) => e.id.startsWith("bullet-"));
      const image = result.elements.find((e) => e.id === "slide-image");

      // Heading should end before image starts
      expect(heading.x + heading.width).toBeLessThanOrEqual(700);

      // Bullets should end before image starts
      bullets.forEach((bullet) => {
        expect(bullet.x + bullet.width).toBeLessThanOrEqual(700);
      });

      // Image should start after bullets end
      expect(image.x).toBe(700);
      expect(image.width).toBe(340);
    });

    test("should handle slides without images", () => {
      const slide = {
        heading: "No Image",
        content: ["Point 1"],
        layout: "bullets-image",
      };
      const result = applyBulletsImage(slide, mockTheme);

      expect(result.elements.find((e) => e.id === "slide-image")).toBeUndefined();
    });
  });

  describe("applyTwoColumn", () => {
    test("should split content into two non-overlapping columns", () => {
      const slide = {
        heading: "Comparison",
        content: ["Left item", "Right item"],
        layout: "two-column",
      };
      const result = applyTwoColumn(slide, mockTheme);

      const leftTitle = result.elements.find((e) => e.id === "left-title");
      const rightTitle = result.elements.find((e) => e.id === "right-title");

      // Right column should start after left column ends
      expect(rightTitle.x).toBeGreaterThan(leftTitle.x + leftTitle.width);
    });

    test("should use custom left/right content when provided", () => {
      const slide = {
        heading: "Custom Columns",
        leftContent: ["Left 1", "Left 2"],
        rightContent: ["Right 1"],
        leftTitle: "Pros",
        rightTitle: "Cons",
        layout: "two-column",
      };
      const result = applyTwoColumn(slide, mockTheme);

      expect(result.elements.find((e) => e.id === "left-title").content).toBe("Pros");
      expect(result.elements.find((e) => e.id === "right-title").content).toBe("Cons");
    });
  });

  describe("applyBigStat", () => {
    test("should create large stat text with optional background image", () => {
      const slide = {
        content: ["85%", "Customer Satisfaction Rate"],
        image: mockImage,
        layout: "big-stat",
      };
      const result = applyBigStat(slide, mockTheme);

      const stat = result.elements.find((e) => e.id === "stat");
      const label = result.elements.find((e) => e.id === "label");

      expect(stat.content).toBe("85%");
      expect(stat.fontSize).toBe(84);
      expect(stat.align).toBe("center");
      expect(label.content).toBe("Customer Satisfaction Rate");
    });

    test("should use default values when content is missing", () => {
      const slide = { layout: "big-stat" };
      const result = applyBigStat(slide, mockTheme);

      const stat = result.elements.find((e) => e.id === "stat");
      expect(stat.content).toBe("80%");
    });
  });

  describe("applySectionDivider", () => {
    test("should create section divider with centered heading", () => {
      const slide = {
        heading: "New Section",
        image: mockImage,
        layout: "section-divider",
      };
      const result = applySectionDivider(slide, mockTheme);

      expect(result.background.type).toBe("image");
      expect(result.elements[0].content).toBe("New Section");
      expect(result.elements[0].align).toBe("center");
      expect(result.elements[0].fontSize).toBe(52);
    });
  });

  describe("applyContentOnly", () => {
    test("should create clean heading + bullets layout", () => {
      const slide = {
        heading: "Content Only Slide",
        content: ["Point A", "Point B"],
        layout: "content-only",
      };
      const result = applyContentOnly(slide, mockTheme);

      expect(result.background.type).toBe("color");
      expect(result.elements.find((e) => e.id === "heading").content).toBe("Content Only Slide");
      expect(result.elements.filter((e) => e.id.startsWith("bullet-"))).toHaveLength(2);
    });
  });

  describe("applyComparison", () => {
    test("should create two-column comparison layout", () => {
      const slide = {
        heading: "Feature Comparison",
        content: ["Feature 1", "Feature 2", "Feature 3", "Feature 4"],
        leftTitle: "Product A",
        rightTitle: "Product B",
        layout: "comparison",
      };
      const result = applyComparison(slide, mockTheme);

      expect(result.elements.find((e) => e.id === "left-title").content).toBe("Product A");
      expect(result.elements.find((e) => e.id === "right-title").content).toBe("Product B");
    });
  });

  describe("applyTemplate (dispatcher)", () => {
    test("should dispatch to correct template based on layout", () => {
      const layouts = {
        "title-slide": applyTitleSlide,
        "bullets-image": applyBulletsImage,
        "two-column": applyTwoColumn,
        "big-stat": applyBigStat,
        "section-divider": applySectionDivider,
        "content-only": applyContentOnly,
        "comparison": applyComparison,
      };

      Object.entries(layouts).forEach(([layout, fn]) => {
        const slide = { heading: "Test", content: ["A"], layout, image: mockImage };
        const result = applyTemplate(slide, mockTheme);
        expect(result.elements.length).toBeGreaterThan(0);
      });
    });

    test("should default to content-only for unknown layout", () => {
      const slide = { heading: "Unknown", content: ["A"], layout: "unknown-layout" };
      const result = applyTemplate(slide, mockTheme);
      expect(result.background.type).toBe("color");
    });

    test("should handle editor format slides (elements array without positions)", () => {
      const slide = {
        layout: "content-only",
        elements: [
          { type: "heading", content: "Editor Heading" },
          { type: "bullet", items: ["Point 1", "Point 2"] },
        ],
      };
      const result = applyTemplate(slide, mockTheme);
      expect(result.elements.find((e) => e.type === "text").content).toBe("Editor Heading");
    });

    test("should handle editor format slides with positioned text elements", () => {
      const slide = {
        layout: "content-only",
        elements: [
          { id: "custom-1", type: "text", content: "Custom", x: 50, y: 50, width: 200, height: 40, fontSize: 24, color: "#ff0000", fontFamily: "Arial" },
        ],
      };
      // normalizeSlideForTemplate should detect positioned elements and return as-is
      // But applyTemplate still applies the template function which creates new elements
      // The actual preservation of positioned elements is handled in convertSlides in PresentationView.jsx
      const result = applyTemplate(slide, mockTheme);
      // Template creates new elements based on heading/content, not preserving editor elements
      expect(result.elements.length).toBeGreaterThan(0);
    });
  });
});
