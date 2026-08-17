import PptxGenJS from "pptxgenjs";
import JSZip from "jszip";
import { exportSlideWithElements, defineMaster } from "../utils/pptxLayouts.js";
import { applyTemplate } from "../utils/templates.js";

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

function process(slide) {
  const themeObj = {
    colors: { primary: theme.primary, accent: theme.accent, background: theme.background, surface: theme.surface, border: theme.border, text: theme.text, textMuted: theme.textMuted },
    fontFamily: { heading: theme.headingFont, body: theme.bodyFont },
  };
  const layoutResult = applyTemplate(slide, themeObj);
  return {
    background: layoutResult.background || { type: "color", value: theme.background },
    layoutPattern: slide.layout || "content-only",
    elements: layoutResult.elements.map((el) => ({ ...el })),
  };
}

function escapeXmlText(s) {
  return String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}

describe("inspect real pptx XML", () => {
  it("dumps text frames for content-only + modern", async () => {
    global.Image = class {
      constructor() { this.naturalWidth = 400; this.naturalHeight = 300; }
      set src(v) { setTimeout(() => this.onload && this.onload(), 0); }
    };
    const pres = new PptxGenJS();
    pres.layout = "LAYOUT_16x9";
    defineMaster(pres, { primary: "f97316", accent: "fb923c", background: "ffffff", text: "111827", textMuted: "6b7280" });

    const slides = [
      process(makeSlide("content-only", "Our Approach", ["First bullet point here", "Second bullet with a bit more length"])),
      process(makeSlide("bullets-image", "Roadmap", ["Intro sentence here", "Build the thing", "Ship it"], { image: { url: "https://e.io/y.jpg" } })),
    ];
    slides.forEach(async (s) => {
      const slide = pres.addSlide({ masterName: "MODERN_MASTER" });
      await exportSlideWithElements(slide, s, { primary: "f97316", accent: "fb923c", background: "ffffff", text: "111827", textMuted: "6b7280" }, "Arial", "Georgia");
    });

    const buf = await pres.write({ outputType: "nodebuffer" });
    const zip = await JSZip.loadAsync(buf);
    const names = Object.keys(zip.files).filter((n) => /^ppt\/slides\/slide\d+\.xml$/.test(n));
    console.log("FILES:", names.join(", "));

    for (const n of names.slice(0, 2)) {
      const xml = await zip.file(n).async("string");
      const frames = xml.split("<p:sp>The").length - 1;
      console.log(`\n===== ${n} (sp elements: ${(xml.split("<p:sp>").length - 1)}) =====`);
      // Extract each sp with text body roughly
      const spRe = /<p:sp>.*?<\/p:sp>/gs;
      const sps = xml.match(spRe) || [];
      sps.forEach((sp, i) => {
        const hasText = sp.includes("<a:t>");
        const textEls = [...sp.matchAll(/<a:t>([\s\S]*?)<\/a:t>/g)].map((m) => m[1]);
        const szs = [...sp.matchAll(/sz="(\d+)"/g)].map((m) => m[1]);
        const fills = [...sp.matchAll(/<a:srgbClr val="([0-9A-Fa-f]{6})"/g)].map((m) => m[1].toUpperCase());
        const anchor = [...sp.matchAll(/anchor="(\w+)"/g)].map((m) => m[1]);
        const normAuto = sp.includes("normAutofit");
        if (hasText || textEls.length) {
          console.log(`[SP#${i}] anchor=${anchor.join(",")} normAutofit=${normAuto}`);
          console.log(`   runs sz=${szs.join(",")} colors=${fills.join(",")}`);
          console.log(`   text=${JSON.stringify(textEls.join(" | "))}`);
        }
      });
    }
    expect(zip.files["ppt/slides/slide1.xml"]).toBeTruthy();
  });
});