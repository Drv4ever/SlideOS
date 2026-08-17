import { normalizePresentation } from "../utils/slideModel.js";
import { applyTemplate } from "../utils/templates.js";

describe("debug convertSlides flow", () => {
  test("should simulate PresentationPreview -> PresentationView flow", () => {
    // Step 1: AI generates slides (LLM format)
    const aiSlides = {
      title: "Test Presentation",
      theme: "cornflower",
      slides: [
        {
          slideNumber: 1,
          heading: "Introduction",
          content: ["Point 1", "Point 2"],
          imageKeyword: "business meeting",
          layout: "content-only",
          image: null,
        },
        {
          slideNumber: 2,
          heading: "Background",
          content: ["Detail 1", "Detail 2"],
          imageKeyword: "team collaboration",
          layout: "bullets-image",
          image: { url: "https://example.com/img.jpg", thumb: "thumb.jpg", alt: "Team" },
        },
      ],
    };

    // Step 2: PresentationPreview normalizes
    const normalized = normalizePresentation(aiSlides, "cornflower");
    console.log("=== Normalized slides ===");
    normalized.slides.forEach((slide, i) => {
      console.log(`Slide ${i}:`, JSON.stringify(slide, null, 2));
    });

    // Step 3: PresentationView.convertSlides processes
    // Simulate what convertSlides does
    const defaultTheme = {
      primary: "#f97316",
      accent: "#fb923c",
      background: "#ffffff",
      surface: "#f5f5f5",
      border: "#e5e7eb",
      text: "#111827",
      textMuted: "#6b7280",
    };
    const headingFont = "DM Sans";
    const bodyFont = "DM Sans";

    const processedSlides = normalized.slides.map((slide, slideIndex) => {
      // Check if slides already have positioned elements
      if (Array.isArray(slide.elements) && slide.elements.some((el) => el.type === "text" && el.x !== undefined)) {
        console.log(`Slide ${slideIndex}: Using editor format directly`);
        return {
          background: slide.background || { type: "color", value: defaultTheme.background },
          layoutPattern: slide.layout || slide.layoutPattern || "content-only",
          elements: slide.elements.map((el) => ({
            id: el.id || `el-${slideIndex}-${Math.random().toString(36).slice(2, 6)}`,
            type: el.type,
            content: el.content,
            src: el.src,
            x: el.x,
            y: el.y,
            width: el.width,
            height: el.height,
            fontSize: el.fontSize,
            bold: el.bold,
            color: el.color,
            fontFamily: el.fontFamily,
            align: el.align,
            zIndex: el.zIndex,
            opacity: el.opacity,
            borderRadius: el.borderRadius,
          })),
        };
      }

      // Otherwise, apply template
      const themeObj = {
        colors: {
          primary: defaultTheme.primary,
          accent: defaultTheme.accent,
          background: defaultTheme.background,
          surface: defaultTheme.surface,
          border: defaultTheme.border,
          text: defaultTheme.text,
          textMuted: defaultTheme.textMuted,
        },
        fontFamily: {
          heading: headingFont,
          body: bodyFont,
        },
      };

      const layoutResult = applyTemplate(slide, themeObj);

      const background = layoutResult.background || {
        type: "color",
        value: defaultTheme.background,
      };

      const elements = layoutResult.elements.map((el) => ({
        id: el.id || `el-${slideIndex}-${Math.random().toString(36).slice(2, 6)}`,
        type: el.type,
        content: el.content,
        src: el.src,
        x: el.x,
        y: el.y,
        width: el.width,
        height: el.height,
        fontSize: el.fontSize,
        bold: el.bold,
        color: el.color,
        fontFamily: el.fontFamily,
        align: el.align,
        zIndex: el.zIndex,
        opacity: el.opacity,
        borderRadius: el.borderRadius,
      }));

      return {
        background,
        layoutPattern: slide.layout || "content-only",
        elements,
      };
    });

    console.log("=== Processed slides ===");
    processedSlides.forEach((slide, i) => {
      console.log(`Slide ${i}:`, JSON.stringify(slide, null, 2));
      console.log(`  Background:`, JSON.stringify(slide.background));
      console.log(`  Elements count:`, slide.elements.length);
      console.log(`  Element types:`, slide.elements.map((el) => el.type));
    });

    // Verify elements have type: "text"
    processedSlides.forEach((slide, i) => {
      const textElements = slide.elements.filter((el) => el.type === "text");
      console.log(`Slide ${i} text elements: ${textElements.length}`);
      expect(textElements.length).toBeGreaterThan(0);
    });
  });
});
