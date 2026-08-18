import { describe, it, expect } from "vitest";
import { themes, CURATED_LOOKUP } from "../../utils/themes.js";

const HEX = /^#[0-9a-fA-F]{6}$/;

describe("themes", () => {
  it("every theme is well-formed", () => {
    expect(themes.length).toBeGreaterThanOrEqual(9);
    for (const t of themes) {
      expect(t.id, t.name).toBeTruthy();
      expect(t.name, t.id).toBeTruthy();
      expect(t.fontFamily.heading, t.id).toBeTruthy();
      expect(t.fontFamily.body, t.id).toBeTruthy();
      for (const [key, val] of Object.entries(t.colors)) {
        expect(val, `${t.id}.${key}`).toMatch(HEX);
      }
    }
  });

  it("CURATED_LOOKUP covers every theme id", () => {
    for (const t of themes) {
      expect(CURATED_LOOKUP[t.id]).toBeDefined();
      expect(CURATED_LOOKUP[t.id].name).toBe(t.name);
    }
  });

  it("ships the handwriting/cursive themes", () => {
    const byId = Object.fromEntries(themes.map((t) => [t.id, t]));
    // Windows + Mac Office fonts (cursive / handwriting style)
    expect(byId.cursive.fontFamily.heading).toBe("Segoe Script");
    expect(byId.brush.fontFamily.heading).toBe("Brush Script MT");
    expect(byId.handwritten.fontFamily.heading).toBe("Lucida Handwriting");
    // Body fonts are also handwriting-safe so PPTX keeps the style throughout.
    for (const id of ["cursive", "brush", "handwritten"]) {
      expect(byId[id].fontFamily.body, id).toBeTruthy();
    }
  });
});