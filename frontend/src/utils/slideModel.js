import { CURATED_LOOKUP } from "./themes";

export { CURATED_LOOKUP };

const LEGACY_LAYOUTS = ["content-only", "bullets-image", "two-column", "section-divider", "bullets-image"];

export function normalizePresentation(data, fallbackThemeId = "cornflower") {
  if (!data) return { title: "Untitled", theme: CURATED_LOOKUP[fallbackThemeId], slides: [] };

  const rawSlides = Array.isArray(data.slides) ? data.slides : [];
  const normalizedSlides = rawSlides.map((slide, i) => {
    const id = slide.id || slide._id || `slide-${Date.now()}-${i}-${Math.random().toString(36).slice(2, 8)}`;
    // New rich format with elements array (from editor)
    if (Array.isArray(slide.elements)) {
      return {
        id,
        layout: slide.layout || LEGACY_LAYOUTS[i % LEGACY_LAYOUTS.length],
        heading: slide.heading,
        image: slide.image,
        elements: slide.elements,
      };
    }
    // LLM-generated format with imageKeyword, layout, image
    const content = Array.isArray(slide.content) ? slide.content : [];
    return {
      id,
      layout: slide.layout || LEGACY_LAYOUTS[i % LEGACY_LAYOUTS.length],
      heading: slide.heading || `Slide ${i + 1}`,
      content: content,
      imageKeyword: slide.imageKeyword,
      image: slide.image || null,
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
