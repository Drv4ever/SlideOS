// Canvas dimensions: 1100 x 618 (16:9)
// All coordinates are in pixels relative to slide canvas
// Template functions return element configs that can be used by both
// the canvas view (PresentationView.jsx) and PPTX export (pptxgenjs)

export const SLIDE_WIDTH = 1100;
export const SLIDE_HEIGHT = 618;

export const TEMPLATE_TYPES = [
  "title-slide",
  "bullets-image",
  "two-column",
  "big-stat",
  "section-divider",
  "content-only",
  "comparison",
];

// Default positioning constants
const MARGIN_LEFT = 100;
const MARGIN_TOP = 60;
const CONTENT_WIDTH = 900; // 1100 - 2*100
const BULLET_INDENT = 120; // left indent for bullets (space for bullet marker)
const BULLET_WIDTH = 800; // 900 - 120

// Layout: title-slide
// Large centered heading, optional subtitle, full background image
export function applyTitleSlide(slide, theme) {
  const elements = [];
  const heading = slide.heading || slide.title || "Untitled";

  elements.push({
    id: "title",
    type: "text",
    content: heading,
    x: MARGIN_LEFT,
    y: 180,
    width: CONTENT_WIDTH,
    height: 120,
    fontSize: 56,
    bold: true,
    color: theme.colors?.text || "#ffffff",
    fontFamily: theme.fontFamily?.heading || "Clash Display",
    align: "center",
    zIndex: 1,
  });

  if (slide.subtitle) {
    elements.push({
      id: "subtitle",
      type: "text",
      content: slide.subtitle,
      x: MARGIN_LEFT,
      y: 310,
      width: CONTENT_WIDTH,
      height: 60,
      fontSize: 24,
      bold: false,
      color: theme.colors?.textMuted || "#cbd5e1",
      fontFamily: theme.fontFamily?.body || "DM Sans",
      align: "center",
      zIndex: 1,
    });
  }

  return {
    background: slide.image?.url
      ? { type: "image", value: slide.image.url }
      : { type: "gradient", value: theme.colors?.primary || "#f97316" },
    elements,
  };
}

// Layout: bullets-image
// Heading top-left, bullets on left (60%), image on right (40%)
export function applyBulletsImage(slide, theme) {
  const elements = [];
  const points = slide.content || slide.elements?.find((e) => e.type === "bullet")?.items || [];

  elements.push({
    id: "heading",
    type: "text",
    content: slide.heading || "Slide Heading",
    x: MARGIN_LEFT,
    y: MARGIN_TOP,
    width: 580,
    height: 50,
    fontSize: 38,
    bold: true,
    color: theme.colors?.primary || "#2563eb",
    fontFamily: theme.fontFamily?.heading || "Clash Display",
    zIndex: 1,
  });

  const BULLET_MAX_X = 640; // Stop bullets before the image starts at x:700
  let currentY = 130;
  points.forEach((point, i) => {
    const lines = Math.max(1, Math.ceil((point || "").length / 45));
    const bulletHeight = Math.max(38, lines * 28);
    elements.push({
      id: `bullet-${i}`,
      type: "text",
      content: point,
      x: BULLET_INDENT,
      y: currentY,
      width: BULLET_MAX_X - BULLET_INDENT,
      height: bulletHeight,
      fontSize: 22,
      bold: false,
      color: theme.colors?.text || "#1e293b",
      fontFamily: theme.fontFamily?.body || "DM Sans",
      zIndex: 1,
    });
    currentY += bulletHeight + 10;
  });

  if (slide.image?.url) {
    elements.push({
      id: "slide-image",
      type: "image",
      src: slide.image.url,
      x: 700,
      y: 80,
      width: 340,
      height: 480,
      borderRadius: 8,
      zIndex: 1,
    });
  }

  return {
    background: { type: "color", value: theme.colors?.background || "#ffffff" },
    elements,
  };
}

// Layout: two-column
// Heading top, two columns of content with sub-headings
export function applyTwoColumn(slide, theme) {
  const elements = [];

  elements.push({
    id: "heading",
    type: "text",
    content: slide.heading || "Slide Heading",
    x: MARGIN_LEFT,
    y: MARGIN_TOP,
    width: CONTENT_WIDTH,
    height: 50,
    fontSize: 38,
    bold: true,
    color: theme.colors?.primary || "#2563eb",
    fontFamily: theme.fontFamily?.heading || "Clash Display",
  });

  const leftContent = slide.leftContent || slide.content?.slice(0, Math.ceil((slide.content || []).length / 2)) || [];
  const rightContent = slide.rightContent || slide.content?.slice(Math.ceil((slide.content || []).length / 2)) || [];

  const colWidth = 420;
  const colLeftX = MARGIN_LEFT;
  const colRightX = MARGIN_LEFT + colWidth + 40;

  // Left column
  elements.push({
    id: "left-title",
    type: "text",
    content: slide.leftTitle || "Column One",
    x: colLeftX,
    y: 130,
    width: colWidth,
    height: 40,
    fontSize: 26,
    bold: true,
    color: theme.colors?.accent || "#f97316",
    fontFamily: theme.fontFamily?.heading || "Clash Display",
  });

  let leftY = 180;
  leftContent.forEach((point, i) => {
    const lines = Math.max(1, Math.ceil((point || "").length / 45));
    const bulletHeight = Math.max(36, lines * 26);
    elements.push({
      id: `left-bullet-${i}`,
      type: "text",
      content: point,
      x: colLeftX + 20,
      y: leftY,
      width: colWidth - 20,
      height: bulletHeight,
      fontSize: 20,
      bold: false,
      color: theme.colors?.text || "#334155",
      fontFamily: theme.fontFamily?.body || "DM Sans",
    });
    leftY += bulletHeight + 8;
  });

  // Right column
  elements.push({
    id: "right-title",
    type: "text",
    content: slide.rightTitle || "Column Two",
    x: colRightX,
    y: 130,
    width: colWidth,
    height: 40,
    fontSize: 26,
    bold: true,
    color: theme.colors?.accent || "#f97316",
    fontFamily: theme.fontFamily?.heading || "Clash Display",
  });

  let rightY = 180;
  rightContent.forEach((point, i) => {
    const lines = Math.max(1, Math.ceil((point || "").length / 45));
    const bulletHeight = Math.max(36, lines * 26);
    elements.push({
      id: `right-bullet-${i}`,
      type: "text",
      content: point,
      x: colRightX + 20,
      y: rightY,
      width: colWidth - 20,
      height: bulletHeight,
      fontSize: 20,
      bold: false,
      color: theme.colors?.text || "#334155",
      fontFamily: theme.fontFamily?.body || "DM Sans",
    });
    rightY += bulletHeight + 8;
  });

  return {
    background: { type: "color", value: theme.colors?.background || "#ffffff" },
    elements,
  };
}

// Layout: big-stat
// Large central number/statistic, supporting context text, optional background image
export function applyBigStat(slide, theme) {
  const elements = [];

  if (slide.image?.url) {
    elements.push({
      id: "bg-image",
      type: "image",
      src: slide.image.url,
      x: 0,
      y: 0,
      width: SLIDE_WIDTH,
      height: SLIDE_HEIGHT,
      opacity: 0.25,
      zIndex: 0,
    });
  }

  const statContent = slide.content?.[0] || slide.stat || "80%";
  const statLabel = slide.content?.[1] || slide.statLabel || "Key Metric";

  elements.push({
    id: "stat",
    type: "text",
    content: statContent,
    x: MARGIN_LEFT,
    y: 180,
    width: CONTENT_WIDTH,
    height: 140,
    fontSize: 84,
    bold: true,
    color: theme.colors?.primary || "#2563eb",
    fontFamily: theme.fontFamily?.heading || "Clash Display",
    align: "center",
    zIndex: 1,
  });

  elements.push({
    id: "label",
    type: "text",
    content: statLabel,
    x: MARGIN_LEFT,
    y: 320,
    width: CONTENT_WIDTH,
    height: 60,
    fontSize: 26,
    bold: false,
    color: theme.colors?.text || "#334155",
    fontFamily: theme.fontFamily?.body || "DM Sans",
    align: "center",
    zIndex: 1,
  });

  return {
    background: slide.image?.url
      ? { type: "color", value: theme.colors?.background || "#ffffff" }
      : { type: "color", value: theme.colors?.surface || "#f8fafc" },
    elements,
  };
}

// Layout: section-divider
// Minimal text over full background image
export function applySectionDivider(slide, theme) {
  const elements = [];
  const heading = slide.heading || "Section Title";

  elements.push({
    id: "heading",
    type: "text",
    content: heading,
    x: MARGIN_LEFT,
    y: 220,
    width: CONTENT_WIDTH,
    height: 100,
    fontSize: 52,
    bold: true,
    color: theme.colors?.background || "#ffffff",
    fontFamily: theme.fontFamily?.heading || "Clash Display",
    align: "center",
    zIndex: 1,
  });

  return {
    background: slide.image?.url
      ? { type: "image", value: slide.image.url }
      : { type: "gradient", value: theme.colors?.primary || "#f97316" },
    elements,
  };
}

// Layout: content-only
// Clean heading + bullet points, no image
export function applyContentOnly(slide, theme) {
  const elements = [];
  const points = slide.content || slide.elements?.find((e) => e.type === "bullet")?.items || [];

  elements.push({
    id: "heading",
    type: "text",
    content: slide.heading || "Slide Heading",
    x: MARGIN_LEFT,
    y: MARGIN_TOP,
    width: CONTENT_WIDTH,
    height: 50,
    fontSize: 38,
    bold: true,
    color: theme.colors?.primary || "#2563eb",
    fontFamily: theme.fontFamily?.heading || "Clash Display",
  });

  let currentY = 130;
  points.forEach((point, i) => {
    const lines = Math.max(1, Math.ceil((point || "").length / 65));
    const bulletHeight = Math.max(36, lines * 26);
    elements.push({
      id: `bullet-${i}`,
      type: "text",
      content: point,
      x: BULLET_INDENT,
      y: currentY,
      width: BULLET_WIDTH,
      height: bulletHeight,
      fontSize: 22,
      bold: false,
      color: theme.colors?.text || "#334155",
      fontFamily: theme.fontFamily?.body || "DM Sans",
    });
    currentY += bulletHeight + 10;
  });

  return {
    background: { type: "color", value: theme.colors?.background || "#ffffff" },
    elements,
  };
}

// Layout: comparison
// Two columns with sub-headings and bullets
export function applyComparison(slide, theme) {
  const elements = [];

  elements.push({
    id: "heading",
    type: "text",
    content: slide.heading || "Slide Heading",
    x: MARGIN_LEFT,
    y: MARGIN_TOP,
    width: CONTENT_WIDTH,
    height: 50,
    fontSize: 38,
    bold: true,
    color: theme.colors?.primary || "#2563eb",
    fontFamily: theme.fontFamily?.heading || "Clash Display",
  });

  const leftContent = slide.leftContent || (slide.content || []).slice(0, Math.ceil((slide.content || []).length / 2));
  const rightContent = slide.rightContent || (slide.content || []).slice(Math.ceil((slide.content || []).length / 2));

  const colWidth = 420;
  const colLeftX = MARGIN_LEFT;
  const colRightX = MARGIN_LEFT + colWidth + 40;

  elements.push({
    id: "left-title",
    type: "text",
    content: slide.leftTitle || "Option A",
    x: colLeftX,
    y: 130,
    width: colWidth,
    height: 40,
    fontSize: 26,
    bold: true,
    color: theme.colors?.accent || "#f97316",
    fontFamily: theme.fontFamily?.heading || "Clash Display",
  });

  let leftY = 180;
  leftContent.forEach((point, i) => {
    const lines = Math.max(1, Math.ceil((point || "").length / 45));
    const bulletHeight = Math.max(36, lines * 26);
    elements.push({
      id: `left-bullet-${i}`,
      type: "text",
      content: point,
      x: colLeftX + 20,
      y: leftY,
      width: colWidth - 20,
      height: bulletHeight,
      fontSize: 20,
      bold: false,
      color: theme.colors?.text || "#334155",
      fontFamily: theme.fontFamily?.body || "DM Sans",
    });
    leftY += bulletHeight + 8;
  });

  elements.push({
    id: "right-title",
    type: "text",
    content: slide.rightTitle || "Option B",
    x: colRightX,
    y: 130,
    width: colWidth,
    height: 40,
    fontSize: 26,
    bold: true,
    color: theme.colors?.accent || "#f97316",
    fontFamily: theme.fontFamily?.heading || "Clash Display",
  });

  let rightY = 180;
  rightContent.forEach((point, i) => {
    const lines = Math.max(1, Math.ceil((point || "").length / 45));
    const bulletHeight = Math.max(36, lines * 26);
    elements.push({
      id: `right-bullet-${i}`,
      type: "text",
      content: point,
      x: colRightX + 20,
      y: rightY,
      width: colWidth - 20,
      height: bulletHeight,
      fontSize: 20,
      bold: false,
      color: theme.colors?.text || "#334155",
      fontFamily: theme.fontFamily?.body || "DM Sans",
    });
    rightY += bulletHeight + 8;
  });

  return {
    background: { type: "color", value: theme.colors?.background || "#ffffff" },
    elements,
  };
}

// Registry: maps layout type string to template function
export const TEMPLATE_REGISTRY = {
  "title-slide": applyTitleSlide,
  "bullets-image": applyBulletsImage,
  "two-column": applyTwoColumn,
  "big-stat": applyBigStat,
  "section-divider": applySectionDivider,
  "content-only": applyContentOnly,
  "comparison": applyComparison,
};

// Main function: given a slide + theme, returns positioned elements using the right template
// Handles both LLM-generated format (heading, content[], image, layout) and
// editor format (elements: [{ type: "heading"/"bullet", ... }])
export function applyTemplate(slide, theme) {
  const layoutType = slide.layout || slide.layoutPattern || "content-only";
  const templateFn = TEMPLATE_REGISTRY[layoutType] || applyContentOnly;

  // Normalize slide data so templates receive a consistent format
  const normalizedSlide = normalizeSlideForTemplate(slide);

  return templateFn(normalizedSlide, theme);
}

// Convert editor format or LLM format into a consistent shape for templates
function normalizeSlideForTemplate(slide) {
  if (!slide) return {};

  // If already has heading + content, use as-is
  if (slide.heading && slide.content) {
    return slide;
  }

  // Editor format: elements array with { type: "heading", content } and { type: "bullet", items }
  if (Array.isArray(slide.elements)) {
    const headingEl = slide.elements.find((e) => e.type === "heading");
    const bulletEl = slide.elements.find((e) => e.type === "bullet");

    // Check for image elements that are foreground (zIndex !== 0)
    const imageEl = slide.elements.find((e) => e.type === "image" && e.zIndex !== 0);

    // If it's already in the editor's element format with positioned text elements,
    // return it as-is so the template doesn't override manual positioning
    if (slide.elements.some((e) => e.type === "text" && e.x !== undefined)) {
      return slide;
    }

    return {
      heading: headingEl?.content || slide.heading || "",
      content: bulletEl?.items || [],
      image: imageEl
        ? { url: imageEl.src, thumb: imageEl.src, alt: "slide image" }
        : slide.image || null,
      layout: slide.layout || slide.layoutPattern || "content-only",
      subtitle: slide.subtitle,
      stat: slide.stat,
      statLabel: slide.statLabel,
      leftContent: slide.leftContent,
      rightContent: slide.rightContent,
      leftTitle: slide.leftTitle,
      rightTitle: slide.rightTitle,
    };
  }

  // Fallback
  return {
    heading: slide.heading || "",
    content: slide.content || [],
    image: slide.image || null,
    layout: slide.layout || slide.layoutPattern || "content-only",
  };
}

export function getTemplateInfo(layoutType) {
  return {
    name: layoutType,
    hasImage: ["title-slide", "bullets-image", "big-stat", "section-divider"].includes(layoutType),
    hasBackground: ["title-slide", "big-stat", "section-divider"].includes(layoutType),
    description: {
      "title-slide": "Large title with background image",
      "bullets-image": "Bullets on left, image on right",
      "two-column": "Two columns with sub-headings",
      "big-stat": "Large central statistic with context",
      "section-divider": "Minimal text over full image",
      "content-only": "Clean heading and bullets",
      "comparison": "Two-column comparison with sub-headings",
    }[layoutType] || "",
  };
}
