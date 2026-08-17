import { describe, it, expect } from "vitest";
import {
  computeSlideLayout,
  SLIDE_W,
  SLIDE_H,
} from "../../utils/designedLayouts.js";

const theme = {
  primary: "#f97316",
  accent: "#fb923c",
  background: "#ffffff",
  surface: "#f5f5f5",
  border: "#e5e7eb",
  text: "#111827",
  textMuted: "#6b7280",
  headingFont: "DM Sans",
  bodyFont: "DM Sans",
};

function makeSlide(layout, heading, content, opts = {}) {
  return { slideNumber: 1, heading, content, layout, image: opts.image || null };
}

// Canonical editor-format slide (what the canvas/Present consume): the outline
// roles expressed as heading + bullet elements. The legacy applyTemplate
// normalizer is NOT used here — it injects extra "Option A/B" text elements for
// comparison slides, which would skew role extraction.
function editorSlide(slide) {
  return {
    layoutPattern: slide.layout,
    heading: slide.heading,
    content: slide.content,
    elements: [
      { type: "heading", content: slide.heading },
      { type: "bullet", content: "", items: slide.content },
    ],
  };
}

function boxes(desc) {
  const out = [];
  for (const t of desc.texts || []) out.push({ content: t.text, x: t.x, y: t.y, w: t.w, h: t.h });
  for (const b of desc.bullets || []) out.push({ content: b.text, x: b.x, y: b.y, w: b.w, h: b.h });
  for (const c of desc.cards || []) {
    out.push({ content: c.title, x: c.x, y: c.y, w: c.w, h: c.h });
    if (c.body) out.push({ content: c.body, x: c.x, y: c.y, w: c.w, h: c.h });
  }
  for (const col of desc.columns || []) {
    if (col.title) out.push({ content: col.title, x: col.x, y: col.y - 0.5, w: col.w, h: 0.4 });
    (col.bullets || []).forEach((item, i) =>
      out.push({ content: item.text, x: col.x, y: col.y + i * 0.62, w: col.w, h: 0.5 })
    );
  }
  return out;
}

const overlaps = (a, b) =>
  a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y;

const offSlide = (b) =>
  b.y < -0.01 || b.y + b.h > SLIDE_H + 0.01 || b.x < -0.01 || b.x + b.w > SLIDE_W + 0.01;

const meta = (index, total) => ({ index, total });

describe("new layouts render the expected primitives", () => {
  it("timeline: milestone cards + line/dots, every bullet maps to a card", () => {
    const slide = makeSlide("timeline", "Our Roadmap", [
      "Q1: Kickoff",
      "Q2: Build",
      "Q3: Ship",
    ]);
    const desc = computeSlideLayout(editorSlide(slide), theme, meta(0, 1));
    expect(desc.layout).toBe("timeline");
    expect(desc.cards).toHaveLength(3);
    expect(desc.timeline).toBeDefined();
    expect(desc.timeline.dots).toHaveLength(3);
  });

  it("stat-grid: 2x2 stat cards with accent title color", () => {
    const slide = makeSlide("stat-grid", "Key Metrics", [
      "120% growth",
      "4.9 rating",
      "2x efficiency",
      "300+ customers",
    ]);
    const desc = computeSlideLayout(editorSlide(slide), theme, meta(0, 1));
    expect(desc.cards).toHaveLength(4);
    for (const c of desc.cards) {
      expect(c.titleColor).toBe(theme.accent);
      expect(c.titleSize).toBeGreaterThan(15);
    }
  });

  it("comparison: two titled columns", () => {
    const slide = makeSlide("comparison", "Two Paths", [
      "Fast to ship",
      "Cheap to run",
      "Harder to scale",
      "Needs more ops",
    ]);
    const desc = computeSlideLayout(editorSlide(slide), theme, meta(0, 1));
    expect(desc.columns).toHaveLength(2);
    expect(desc.columns[0].title).toBe("Option A");
    expect(desc.columns[1].title).toBe("Option B");
    expect(desc.columns[0].bullets).toHaveLength(2);
  });

  it("agenda: numbered cards with tags", () => {
    const slide = makeSlide("agenda", "What We'll Cover", [
      "Intro to the topic",
      "Fundamentals",
      "Hands-on practice",
      "Real-world cases",
    ]);
    const desc = computeSlideLayout(editorSlide(slide), theme, meta(0, 1));
    expect(desc.cards).toHaveLength(4);
    expect(desc.cards.map((c) => c.tag)).toEqual(["01", "02", "03", "04"]);
  });

  it("quote: quote text + attribution, both editable roles", () => {
    const slide = makeSlide("quote", "Stay hungry, stay foolish", [
      "Steve Jobs",
    ]);
    const desc = computeSlideLayout(editorSlide(slide), theme, meta(0, 1));
    expect(desc.texts[0].text).toBe("Stay hungry, stay foolish");
    expect(desc.texts[1].text).toContain("Steve Jobs");
    expect(desc.texts[0].align).toBe("left");
  });

  it("closing: big centered final message", () => {
    const slide = makeSlide("closing", "Thank you", ["Let's build together"]);
    const desc = computeSlideLayout(editorSlide(slide), theme, meta(0, 1));
    expect(desc.texts[0].text).toBe("Thank you");
    expect(desc.texts[0].align).toBe("center");
    expect(desc.texts[0].size).toBeGreaterThan(36);
    expect(desc.texts[1].text).toBe("Let's build together");
  });
});

describe("new layouts: no overlapping or off-slide boxes", () => {
  const cases = [
    ["timeline", makeSlide("timeline", "Roadmap", ["Intro", "A", "B", "C", "D", "E"])],
    ["stat-grid", makeSlide("stat-grid", "Metrics", ["120% growth", "4.9 rating", "2x efficiency", "300+ customers"])],
    ["comparison", makeSlide("comparison", "Two Paths", ["A1", "A2", "A3", "B1", "B2", "B3"])],
    ["agenda", makeSlide("agenda", "Agenda", ["Intro", "One", "Two", "Three", "Four", "Five"])],
    ["quote", makeSlide("quote", "A very long quotation that should wrap", ["Attribution"])],
    ["closing", makeSlide("closing", "Thank you", ["Subtitle line"])],
  ];

  cases.forEach(([name, slide]) => {
    it(`boxes stay on-slide and non-overlapping: ${name}`, () => {
      const desc = computeSlideLayout(editorSlide(slide), theme, meta(0, 1));
      const list = boxes(desc);
      list.forEach((b, i) => {
        for (let j = i + 1; j < list.length; j++) {
          const other = list[j];
          if (overlaps(b, other)) {
            throw new Error(
              `OVERLAP in ${name}: "${String(b.content).slice(0, 20)}" @(${b.x},${b.y}) vs "${String(other.content).slice(0, 20)}" @(${other.x},${other.y})`
            );
          }
        }
        if (offSlide(b)) {
          throw new Error(
            `OFF-SLIDE in ${name}: "${String(b.content).slice(0, 20)}" @(${b.x},${b.y},${b.w},${b.h})`
          );
        }
      });
      expect(true).toBe(true);
    });
  });
});

describe("new layouts: outline and editor schemas render identically", () => {
  const cases = [
    ["timeline", makeSlide("timeline", "Roadmap", ["Intro", "Q1", "Q2", "Q3"])],
    ["stat-grid", makeSlide("stat-grid", "Metrics", ["120% growth", "4.9 rating", "2x efficiency", "300+ customers"])],
    ["comparison", makeSlide("comparison", "Two Paths", ["A1", "A2", "B1", "B2"])],
    ["agenda", makeSlide("agenda", "Agenda", ["One", "Two", "Three"])],
    ["quote", makeSlide("quote", "Quote here", ["Attribution"])],
    ["closing", makeSlide("closing", "Thanks", ["Subtitle"])],
  ];

  cases.forEach(([name, slide]) => {
    it(`identical descriptions: ${name}`, () => {
      const a = computeSlideLayout(slide, theme, meta(0, 1));
      const b = computeSlideLayout(editorSlide(slide), theme, meta(0, 1));
      expect(a.layout).toBe(b.layout);
      expect(a.texts.map((t) => t.text)).toEqual(b.texts.map((t) => t.text));
      expect((a.cards || []).map((c) => c.title)).toEqual((b.cards || []).map((c) => c.title));
      expect((a.columns || []).map((c) => c.title)).toEqual((b.columns || []).map((c) => c.title));
      expect((a.bullets || []).map((x) => x.text)).toEqual((b.bullets || []).map((x) => x.text));
    });
  });
});

describe("new layouts: decor eligibility", () => {
  it("stat-grid / comparison / agenda keep the icon chip", () => {
    for (const layout of ["stat-grid", "comparison", "agenda"]) {
      const desc = computeSlideLayout(
        editorSlide(makeSlide(layout, "Heading", ["A", "B", "C"])),
        theme,
        meta(0, 1)
      );
      expect(desc.decor.icon, layout).toBeDefined();
      expect(desc.decor.watermark, layout).toBeDefined();
    }
  });

  it("timeline / quote / closing skip the icon chip", () => {
    for (const layout of ["timeline", "quote", "closing"]) {
      const desc = computeSlideLayout(
        editorSlide(makeSlide(layout, "Heading", ["A", "B", "C"])),
        theme,
        meta(0, 1)
      );
      expect(desc.decor, layout).toBeDefined();
      expect(desc.decor.icon, layout).toBeUndefined();
    }
  });

it("list layouts keep the accent divider", () => {
    const desc = computeSlideLayout(
      editorSlide(makeSlide("timeline", "Roadmap", ["Q1", "Q2", "Q3"])),
      theme,
      meta(0, 1)
    );
    expect(desc.decor.divider).toBeDefined();
  });
});