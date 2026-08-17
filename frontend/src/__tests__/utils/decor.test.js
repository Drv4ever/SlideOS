import { describe, it, expect } from "vitest";
import { computeSlideLayout, pickIconForRoles } from "../../utils/designedLayouts.js";

const theme = {
  primary: "#3b82f6",
  accent: "#22d3ee",
  background: "#ffffff",
  surface: "#eff6ff",
  border: "#dbeafe",
  text: "#1e3a8a",
  textMuted: "#64748b",
  headingFont: "Georgia",
  bodyFont: "Arial",
};

function slideFor(heading, bullets, layout, index = 0) {
  return {
    id: `s-${index}`,
    heading,
    content: bullets,
    layout,
  };
}

describe("pickIconForRoles", () => {
  const cases = [
    ["Market Growth Strategy", ["Revenue tripled"], "TrendingUp"],
    ["Our Team Culture", ["People first"], "Users"],
    ["Workshop: Learn to pitch", ["Hands-on training"], "GraduationCap"],
    ["Product Launch Day", ["Introducing the feature"], "Rocket"],
    ["Research Findings", ["Survey data analysis"], "ChartColumn"],
    ["Key Challenges", ["Pain points to solve"], "TriangleAlert"],
    ["A Bold Vision", ["The future of work"], "Lightbulb"],
    ["Budget and Costs", ["Invest in R&D"], "Wallet"],
    ["Security First", ["Protect customer data"], "ShieldCheck"],
    ["Q3 Results", ["Hit our success goals"], "Target"],
    ["Roadmap & Timeline", ["Milestone planning"], "Map"],
    ["Generic Update", ["Just a note"], "Sparkles"],
  ];

  it.each(cases)("maps %s -> %s", (heading, bullets, expected) => {
    expect(pickIconForRoles({ heading, bullets })).toBe(expected);
  });
});

describe("computeSlideLayout decor", () => {
  it("adds a full decorative layer to content-only slides", () => {
    const desc = computeSlideLayout(
      slideFor("Market Growth", ["Revenue up", "Team scaling"], "content-only", 0),
      theme,
      { index: 0, total: 4 }
    );

    expect(desc.decor).toBeDefined();
    expect(desc.decor.shapes).toHaveLength(1);
    expect(desc.decor.shapes[0].type).toBe("ellipse");
    expect(desc.decor.watermark.text).toBe("01");
    expect(desc.decor.divider).toBeDefined();
    expect(desc.decor.icon).toBeDefined();
    expect(desc.decor.icon.name).toBe("TrendingUp");
  });

  it("uses the zero-padded slide number as the watermark", () => {
    const desc = computeSlideLayout(
      slideFor("Content", ["Point"], "content-only", 3),
      theme,
      { index: 9, total: 10 }
    );
    expect(desc.decor.watermark.text).toBe("10");
  });

  it.each(["section-divider", "title-slide"])(
    "leaves %s layouts minimal (no decor)",
    (layout) => {
      const desc = computeSlideLayout(
        slideFor("Heading", ["Point"], layout, 0),
        theme,
        { index: 0, total: 1 }
      );
      expect(desc.decor).toBeUndefined();
    }
  );

  it("keeps decor geometry inside the 10 x 5.625 slide", () => {
    const desc = computeSlideLayout(
      slideFor("Growth", ["A", "B", "C"], "content-only", 0),
      theme,
      { index: 0, total: 1 }
    );
    for (const s of desc.decor.shapes) {
      expect(s.x + s.w).toBeLessThanOrEqual(10);
      expect(s.y + s.h).toBeLessThanOrEqual(5.625);
    }
    expect(desc.decor.watermark.opacity).toBeLessThan(1);
  });
});