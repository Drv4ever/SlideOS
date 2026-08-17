import { applyTemplate } from "../utils/templates.js";
import {
  computeSlideLayout,
  extractSlideRoles,
  toOutlineSlide,
  updateSlideRole,
  addSlideRoleBullet,
  deleteSlideRoleBullet,
  SLIDE_W,
  SLIDE_H,
} from "../utils/designedLayouts.js";
import { exportSlideWithElements } from "../utils/pptxLayouts.js";

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
  return {
    slideNumber: opts.n || 1,
    heading,
    content,
    layout,
    imageKeyword: opts.imageKeyword,
    image: opts.image || null,
  };
}

function process(slide, index) {
  const themeObj = {
    colors: {
      primary: theme.primary,
      accent: theme.accent,
      background: theme.background,
      surface: theme.surface,
      border: theme.border,
      text: theme.text,
      textMuted: theme.textMuted,
    },
    fontFamily: { heading: theme.headingFont, body: theme.bodyFont },
  };
  const layoutResult = applyTemplate(slide, themeObj);
  return {
    background: layoutResult.background || { type: "color", value: theme.background },
    layoutPattern: slide.layout || "content-only",
    elements: layoutResult.elements.map((el) => ({ ...el })),
  };
}

function boxes(desc) {
  const out = [];
  for (const t of desc.texts || []) out.push({ content: t.text, x: t.x, y: t.y, w: t.w, h: t.h });
  for (const b of desc.bullets || []) out.push({ content: b.text, x: b.x, y: b.y, w: b.w, h: b.h });
  for (const c of desc.cards || []) {
    out.push({ content: c.title, x: c.x + 0.18, y: c.y + 0.12, w: c.w - 0.36, h: 0.34 });
    out.push({ content: c.body, x: c.x + 0.18, y: c.y + 0.46, w: c.w - 0.36, h: c.h - 0.58 });
  }
  for (const col of desc.columns || []) {
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

describe("design layout box geometry (no overlapping text)", () => {
  const cases = [
    ["title-slide", makeSlide("title-slide", "Growth in 2026", ["Key insight", "Another detail"], { imageKeyword: "business" })],
    ["content-only", makeSlide("content-only", "Our Approach", ["Point 1", "Point 2", "Point 3", "Point 4", "Point 5"])],
    ["two-column", makeSlide("two-column", "Two Pillars", ["Left A", "Left B", "Left C", "Right A", "Right B", "Right C"])],
    ["big-stat", makeSlide("big-stat", "120%", ["Revenue grew every quarter"])],
    ["section-divider", makeSlide("section-divider", "Chapter Two", ["Moving into execution"], { image: { url: "https://e.io/x.jpg", thumb: "x", alt: "x" } })],
    ["bullets-image (modern)", makeSlide("bullets-image", "Roadmap", ["Intro line here", "Build the thing", "Ship it", "Scale it"], { image: { url: "https://e.io/y.jpg", thumb: "y", alt: "y" } })],
    ["big-stat w/ image", makeSlide("big-stat", "300+", ["Customers onboard", "More context"], { image: { url: "https://e.io/z.jpg", thumb: "z", alt: "z" } })],
  ];

  cases.forEach(([name, slide]) => {
    it(`no overlapping/off-slide text boxes: ${name}`, () => {
      const processed = process(slide, 0);
      const desc = computeSlideLayout(processed, theme, { index: 0, total: cases.length });
      const list = boxes(desc);

      list.forEach((b, i) => {
        for (let j = i + 1; j < list.length; j++) {
          const other = list[j];
          if (overlaps(b, other)) {
            throw new Error(
              `OVERLAP in ${name}: "${b.content.slice(0, 20)}" @(${b.x},${b.y}) vs "${other.content.slice(0, 20)}" @(${other.x},${other.y})`
            );
          }
        }
        if (offSlide(b)) {
          throw new Error(
            `OFF-SLIDE in ${name}: "${b.content.slice(0, 20)}" @(${b.x},${b.y},${b.w},${b.h})`
          );
        }
      });
      // Right image panel (x>=6.2) must never overlap text; full-bleed images are
      // backgrounds the text is intentionally placed on top of.
      if (desc.image && desc.image.mode === "panel") {
        for (const b of list) {
          if (overlaps(b, desc.image)) {
            throw new Error(`IMAGE PANEL overlaps text in ${name}: "${b.content.slice(0, 20)}"`);
          }
        }
      }
      expect(true).toBe(true);
    });
  });
});

describe("design layout card text is never duplicated", () => {
  it("modern cards render each item once (title only when no line break)", () => {
    for (const item of ["Build the thing", "Build the thing\nLonger supporting detail", "A: with a colon", "Ship: it\nNested explanation"]) {
      const slide = makeSlide("bullets-image", "Roadmap", ["Intro line", item]);
      const desc = computeSlideLayout(process(slide, 0), theme, { index: 0, total: 1 });
      for (const c of desc.cards || []) {
        const t = String(c.title || "").trim();
        const b = String(c.body || "").trim();
        if (b && t === b) {
          throw new Error(`Card duplicates its text as title+body: "${t}"`);
        }
      }
    }
    expect(true).toBe(true);
  });
});

describe("single source of truth: every schema renders the same design", () => {
  const OUTLINE_SLIDE = {
    id: "s1",
    layout: "content-only",
    heading: "Our Approach",
    content: ["Point 1", "Point 2", "Point 3"],
    image: { url: "https://e.io/x.jpg", thumb: "x", alt: "x" },
    elements: [
      { type: "heading", content: "Our Approach" },
      { type: "bullet", content: "", items: ["Point 1", "Point 2", "Point 3"] },
    ],
  };

  const EDITOR_SLIDE = (() => {
    const themeObj = {
      colors: { primary: theme.primary, accent: theme.accent, background: theme.background, surface: theme.surface, border: theme.border, text: theme.text, textMuted: theme.textMuted },
      fontFamily: { heading: theme.headingFont, body: theme.bodyFont },
    };
    const applied = applyTemplate(OUTLINE_SLIDE, themeObj);
    return {
      background: applied.background,
      layoutPattern: OUTLINE_SLIDE.layout,
      elements: applied.elements,
    };
  })();

  it("outline slides (preview) and editor slides (present/export) produce identical descriptions", () => {
    const a = computeSlideLayout(OUTLINE_SLIDE, theme, { index: 0, total: 1 });
    const b = computeSlideLayout(EDITOR_SLIDE, theme, { index: 0, total: 1 });
    expect(a.texts.map((t) => t.text)).toEqual(b.texts.map((t) => t.text));
    expect(a.bullets.map((t) => t.text)).toEqual(b.bullets.map((t) => t.text));
    expect(a.layout).toBe(b.layout);
    expect(a.accentBar).toBe(b.accentBar);
  });

  it("toOutlineSlide round-trip is lossless (editor -> outline -> same desc)", () => {
    const outline = toOutlineSlide(EDITOR_SLIDE);
    expect(outline.heading).toBe("Our Approach");
    expect(outline.content).toEqual(["Point 1", "Point 2", "Point 3"]);
    const a = computeSlideLayout(EDITOR_SLIDE, theme, { index: 0, total: 1 });
    const b = computeSlideLayout(outline, theme, { index: 0, total: 1 });
    expect(b.texts.map((t) => t.text)).toEqual(a.texts.map((t) => t.text));
    expect(b.bullets.map((t) => t.text)).toEqual(a.bullets.map((t) => t.text));
  });

  it("updateSlideRole edits any schema and extractSlideRoles reads it back", () => {
    const editedOutline = updateSlideRole(OUTLINE_SLIDE, "heading", 0, "New Title");
    expect(extractSlideRoles(editedOutline).heading).toBe("New Title");
    const editedEditor = updateSlideRole(EDITOR_SLIDE, "heading", 0, "New Title");
    expect(extractSlideRoles(editedEditor).heading).toBe("New Title");

    const b1 = updateSlideRole(OUTLINE_SLIDE, "bullet", 1, "Edited Point");
    expect(extractSlideRoles(b1).bullets).toEqual(["Point 1", "Edited Point", "Point 3"]);
    const b2 = updateSlideRole(EDITOR_SLIDE, "bullet", 1, "Edited Point");
    expect(extractSlideRoles(b2).bullets).toEqual(["Point 1", "Edited Point", "Point 3"]);
  });

  it("add/delete bullet helpers keep every schema's canonical source in sync", () => {
    const addedOutline = addSlideRoleBullet(OUTLINE_SLIDE, "Point 4");
    expect(extractSlideRoles(addedOutline).bullets).toEqual(["Point 1", "Point 2", "Point 3", "Point 4"]);
    const addedEditor = addSlideRoleBullet(EDITOR_SLIDE, "Point 4");
    expect(extractSlideRoles(addedEditor).bullets).toEqual(["Point 1", "Point 2", "Point 3", "Point 4"]);

    const deletedOutline = deleteSlideRoleBullet(OUTLINE_SLIDE, 0);
    expect(extractSlideRoles(deletedOutline).bullets).toEqual(["Point 2", "Point 3"]);
    const deletedEditor = deleteSlideRoleBullet(EDITOR_SLIDE, 0);
    expect(extractSlideRoles(deletedEditor).bullets).toEqual(["Point 2", "Point 3"]);
  });

  it("design.overrides move blocks and change sizes for every consumer", () => {
    const overridden = {
      ...OUTLINE_SLIDE,
      design: {
        overrides: {
          heading: { x: 4.2, y: 0.9, size: 44 },
          bullets: [{ y: 2.0 }, { x: 3.5 }],
        },
      },
    };
    const desc = computeSlideLayout(overridden, theme, { index: 0, total: 1 });
    expect(desc.texts[0].x).toBe(4.2);
    expect(desc.texts[0].y).toBe(0.9);
    expect(desc.texts[0].size).toBe(44);
    expect(desc.bullets[0].y).toBe(2.0);
    expect(desc.bullets[1].x).toBe(3.5);
  });

  it("modern card titles honor the titleSize override", () => {
    const modern = {
      layout: "bullets-image",
      heading: "Roadmap",
      content: ["Intro", "Card A", "Card B"],
      image: { url: "https://e.io/y.jpg", thumb: "y", alt: "y" },
      design: { overrides: { bullets: [{}, { size: 26 }] } },
    };
    const desc = computeSlideLayout(modern, theme, { index: 0, total: 1 });
    expect(desc.cards[0].titleSize).toBe(26);
  });
});

describe("auto-fit: text always fits inside its box (no border clipping)", () => {
  // Mirrors the engine's line estimation (avg glyph ~0.5em) to verify the
  // fitted size actually keeps the content inside the box.
  const perLineAt = (wIn, size) => Math.floor(wIn / ((size / 72) * 0.5));
  const needed = (text, wIn, size, lineHeight) =>
    Math.ceil(text.length / perLineAt(wIn, size)) * (size / 72) * lineHeight;

  it("shrinks a long bullet so it fits the box height", () => {
    const slide = makeSlide("content-only", "Our Approach", [
      "This is an extremely long bullet point that keeps going and going far beyond what a single line could ever hold on this slide width",
    ]);
    const desc = computeSlideLayout(process(slide, 0), theme, { index: 0, total: 1 });
    const b = desc.bullets[0];
    expect(b.size).toBeLessThan(18);
    expect(needed(b.text, b.w, b.size, 1.2)).toBeLessThanOrEqual(b.h + 0.01);
  });

  it("shrinks a long heading to fit its box", () => {
    const slide = makeSlide("content-only", "A".repeat(160), []);
    const desc = computeSlideLayout(process(slide, 0), theme, { index: 0, total: 1 });
    const t = desc.texts[0];
    expect(needed(t.text, t.w, t.size, 1.15)).toBeLessThanOrEqual(t.h + 0.01);
  });

  it("shrinks card title+body together so both fit inside the card", () => {
    const slide = makeSlide(
      "bullets-image",
      "Roadmap",
      [
        "Intro line here",
        "Card title that is quite long\n" +
          "And a body that is also long enough to wrap over several lines inside the card keeping the text fully visible without clipping the border",
      ],
      { image: { url: "https://e.io/y.jpg", thumb: "y", alt: "y" } }
    );
    const desc = computeSlideLayout(process(slide, 0), theme, { index: 0, total: 1 });
    const card = desc.cards[0];
    const innerW = card.w - 0.36;
    const innerH = card.h - 0.24;
    expect(card.bodySize).toBeLessThan(11);
    const titleH = Math.ceil(card.title.length / perLineAt(innerW, card.titleSize)) * (card.titleSize / 72) * 1.1;
    const bodyH = Math.ceil(card.body.length / perLineAt(innerW, card.bodySize)) * (card.bodySize / 72) * 1.2 + 0.05;
    expect(titleH + bodyH).toBeLessThanOrEqual(innerH + 0.01);
  });

  it("two-column bullets fit their 0.5in rows", () => {
    const slide = makeSlide("two-column", "Two Pillars", [
      "Column A first point that is long enough to wrap onto a second row inside its column",
      "A2", "A3",
      "Column B first point also reasonably long to wrap onto a second row as well",
      "B2", "B3",
    ]);
    const desc = computeSlideLayout(process(slide, 0), theme, { index: 0, total: 1 });
    for (const col of desc.columns) {
      for (const item of col.bullets) {
        expect(needed(item.text, col.w, item.size, 1.2)).toBeLessThanOrEqual(0.5 + 0.01);
      }
    }
  });

  it("does not shrink content that already fits", () => {
    const slide = makeSlide("big-stat", "120%", ["Revenue"]);
    const desc = computeSlideLayout(process(slide, 0), theme, { index: 0, total: 1 });
    expect(desc.texts[0].size).toBe(60);
  });
});

describe("PPTX export path (shrink-to-fit + no overlap)", () => {
  // jsdom's Image never fires load/error for arbitrary URLs; stub it to resolve
  // immediately so cropToCover falls through to the safe direct-insert path.
  global.Image = class {
    constructor() {
      this.naturalWidth = 400;
      this.naturalHeight = 300;
    }
    set src(v) {
      setTimeout(() => this.onload && this.onload(), 0);
    }
  };
  const cases = [
    ["content-only long", makeSlide("content-only", "Our Approach", [
      "This is a very long first bullet point that will definitely wrap onto two lines inside its frame",
      "Short bullet",
      "Another reasonably long bullet sentence that wraps as well",
      "Fourth",
      "Fifth with a long tail that keeps going and going and going to force wrapping",
    ])],
    ["modern cards", makeSlide("bullets-image", "Roadmap", [
      "Intro sentence that is somewhat long and wraps to a second line",
      "Build: a fairly detailed body that explains a lot of detail about this card",
      "Launch: more detail about launching and what happens then",
      "Scale: detail about scaling the whole operation",
    ], { image: { url: "https://e.io/y.jpg", thumb: "y", alt: "y" } })],
    ["two-column", makeSlide("two-column", "Two Pillars", [
      "Column A first point that is long enough to wrap",
      "A2", "A3",
      "Column B first point also reasonably long to wrap",
      "B2", "B3",
    ])],
  ];

  cases.forEach(([name, slide]) => {
    it(`every text frame is shrink-to-fit, top-aligned, non-overlapping: ${name}`, async () => {
      const processed = process(slide, 0);
      const calls = { shapes: [], texts: [], images: [] };
      const fakeSlide = {
        background: null,
        addText(text, opts) {
          calls.texts.push({ text: String(text), ...opts });
        },
        addShape(shape, opts) {
          calls.shapes.push({ shape, ...opts });
        },
        addImage(opts) {
          calls.images.push(opts);
        },
      };
      const themeColors = {
        primary: "f97316",
        accent: "fb923c",
        background: "ffffff",
        text: "111827",
        textMuted: "6b7280",
      };
      await exportSlideWithElements(fakeSlide, processed, themeColors, "Arial", "Georgia");

      // Every text frame must be top-aligned and shrink-to-fit (PowerPoint centers
      // and overflows by default -> that caused the doubled/overlapping text).
      calls.texts.forEach((t, i) => {
        expect(t.valign).toBe("top");
        expect(t.fit).toBe("shrink");
      });

      // No two text frames may overlap in inches.
      for (let i = 0; i < calls.texts.length; i++) {
        const a = calls.texts[i];
        for (let j = i + 1; j < calls.texts.length; j++) {
          const b = calls.texts[j];
          const hit =
            a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y;
          if (hit) {
            throw new Error(
              `PPTX OVERLAP in ${name}: "${String(a.text).slice(0, 20)}" @(${a.x},${a.y}) vs "${String(b.text).slice(0, 20)}" @(${b.x},${b.y})`
            );
          }
        }
      }
      expect(calls.texts.length).toBeGreaterThan(0);
    });
  });
});