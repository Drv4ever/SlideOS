import { CURATED_LOOKUP } from "./themes";

export { CURATED_LOOKUP };

const LEGACY_LAYOUTS = ["stripe", "split", "card", "header", "plain"];

export function normalizePresentation(data, fallbackThemeId = "cornflower") {
  if (!data) return { title: "Untitled", theme: CURATED_LOOKUP[fallbackThemeId], slides: [] };

  const rawSlides = Array.isArray(data.slides) ? data.slides : [];
  const normalizedSlides = rawSlides.map((slide, i) => {
    // New rich format
    if (Array.isArray(slide.elements)) {
      return { layout: slide.layout || "header", heading: slide.heading, elements: slide.elements };
    }
    // Legacy format { heading, content: string[] }
    const content = Array.isArray(slide.content) ? slide.content : [];
    return {
      layout: LEGACY_LAYOUTS[i % LEGACY_LAYOUTS.length],
      heading: slide.heading || `Slide ${i + 1}`,
      elements: [{ type: "heading", content: slide.heading || "" }, { type: "bullet", content: "", items: content }],
    };
  });

  let theme = data.theme;
  if (!theme || !theme.colors) {
    theme = CURATED_LOOKUP[fallbackThemeId] || CURATED_LOOKUP.cornflower;
  }

  return {
    title: data.title || "Untitled Presentation",
    theme,
    slides: normalizedSlides,
  };
}

export function themeToColors(theme) {
  return {
    primary: theme?.colors?.primary || "#f97316",
    accent: theme?.colors?.accent || "#fb923c",
    background: theme?.colors?.background || "#ffffff",
    surface: theme?.colors?.surface || "#f5f5f5",
    border: theme?.colors?.border || "#e5e7eb",
    text: theme?.colors?.text || "#111827",
    textMuted: theme?.colors?.textMuted || "#6b7280",
  };
}
