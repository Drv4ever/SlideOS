import { describe, it, expect } from "vitest";
import { DECK_TEMPLATES, templateToDeck } from "../../utils/deckTemplates.js";
import { CURATED_LOOKUP } from "../../utils/themes.js";

const VALID_LAYOUTS = [
  "title-slide",
  "section-divider",
  "big-stat",
  "two-column",
  "modern",
  "content-only",
  "timeline",
  "stat-grid",
  "comparison",
  "agenda",
  "quote",
  "closing",
];

const VALID_TEXT_AMOUNTS = ["minimal", "concise", "detailed", "extensive"];

describe("deckTemplates", () => {
  it("exports a seeded gallery", () => {
    expect(DECK_TEMPLATES.length).toBeGreaterThanOrEqual(6);
  });

  it("every template is well-formed and renderable by the design engine", () => {
    for (const tpl of DECK_TEMPLATES) {
      expect(tpl.id, tpl.name).toBeTruthy();
      expect(tpl.name, tpl.id).toBeTruthy();
      expect(tpl.category, tpl.id).toBeTruthy();
      expect(tpl.description, tpl.id).toBeTruthy();
      expect(CURATED_LOOKUP[tpl.themeId], `${tpl.id} theme`).toBeDefined();
      expect(VALID_TEXT_AMOUNTS, `${tpl.id} textAmount`).toContain(tpl.textAmount);

      expect(Array.isArray(tpl.slides) && tpl.slides.length > 0, `${tpl.id} slides`).toBe(true);

      // First slide must be a title slide, matching the layout rules.
      expect(tpl.slides[0].layout, `${tpl.id} first layout`).toBe("title-slide");

      for (const slide of tpl.slides) {
        expect(VALID_LAYOUTS, `${tpl.id} layout ${slide.layout}`).toContain(slide.layout);
        expect(slide.heading, `${tpl.id} heading`).toBeTruthy();
        expect(
          Array.isArray(slide.content) && slide.content.length > 0,
          `${tpl.id} content`
        ).toBe(true);
      }
    }
  });

  it("templateToDeck returns the shape the preview expects", () => {
    const deck = templateToDeck(DECK_TEMPLATES[0]);
    expect(deck.title).toBe(DECK_TEMPLATES[0].name);
    expect(deck.theme).toBe(DECK_TEMPLATES[0].themeId);
    expect(deck.slidesCount).toBe(DECK_TEMPLATES[0].slides.length);
    expect(deck.content.slides).toEqual(DECK_TEMPLATES[0].slides);
    expect(deck.presentation.slides).toEqual(DECK_TEMPLATES[0].slides);
    expect(deck.content.textAmount).toBe(DECK_TEMPLATES[0].textAmount);
  });
});