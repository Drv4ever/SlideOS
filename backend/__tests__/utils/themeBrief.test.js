import { buildThemeBrief, THEME_CATALOG } from "../../src/utils/themeBrief.js";

describe("buildThemeBrief", () => {
  test("builds a brief from a theme id string", () => {
    const brief = buildThemeBrief("cornflower");
    expect(brief).toContain("Cornflower Blue");
    expect(brief).toContain("#3b82f6");
    expect(brief).toContain("Space Grotesk");
    expect(brief).toContain("mood:");
  });

  test("builds a brief from a full theme object", () => {
    const brief = buildThemeBrief({
      id: "noir",
      name: "Noir",
      colors: { primary: "#18181b", accent: "#facc15", background: "#ffffff", text: "#09090b" },
      fontFamily: { heading: "Sora", body: "DM Sans" },
      headingWeight: 800,
    });
    expect(brief).toContain("Name: Noir");
    expect(brief).toContain("#facc15");
    expect(brief).toContain("heading 'Sora'");
    expect(brief).toContain("mood:");
  });

  test("prefers client-provided object details over the catalog", () => {
    const brief = buildThemeBrief({
      id: "cornflower",
      name: "Custom Cornflower",
      colors: { primary: "#000000" },
    });
    expect(brief).toContain("Name: Custom Cornflower");
    expect(brief).toContain("#000000");
  });

  test("falls back to the catalog when the object has no details", () => {
    const brief = buildThemeBrief({ id: "midnight" });
    expect(brief).toContain("Midnight");
    expect(brief).toContain("dark");
  });

  test("returns null for missing theme", () => {
    expect(buildThemeBrief(null)).toBeNull();
    expect(buildThemeBrief(undefined)).toBeNull();
  });

  test("every catalog theme has a name, palette and mood", () => {
    for (const [id, t] of Object.entries(THEME_CATALOG)) {
      const brief = buildThemeBrief(id);
      expect(brief).toContain(`Name: ${t.name}`);
      expect(brief).toContain("palette:");
      expect(brief).toContain("mood:");
    }
  });
});