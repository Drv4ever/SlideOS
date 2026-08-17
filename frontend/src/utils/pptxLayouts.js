// PPTX renderer.
// Consumes the design description from designedLayouts.computeSlideLayout and
// emits pptxgenjs calls using the SAME inch/point units, so the exported
// PowerPoint file (10 x 5.625 in, LAYOUT_16x9) matches the SlideOS
// Presentation View that renders the same description as HTML.
//
// Every text frame is top-aligned (valign: "top") because PowerPoint defaults
// to vertically CENTERING text — oversized boxes used to push glyphs down onto
// the element beneath them, which looked like duplicated/overlapping text.

import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import {
  TrendingUp,
  Users,
  GraduationCap,
  Rocket,
  ChartColumn,
  TriangleAlert,
  Lightbulb,
  Wallet,
  ShieldCheck,
  Target,
  Map,
  Sparkles,
} from "lucide-react";
import {
  computeSlideLayout,
  SLIDE_W,
  SLIDE_H,
  normalizeHex,
  interpolateColor,
} from "./designedLayouts";

// The decor icons the design engine emits (pickIconForRoles). Named imports keep
// tree-shaking intact — a namespace import would pull in all ~1.5k icons.
const DECOR_ICONS = {
  TrendingUp,
  Users,
  GraduationCap,
  Rocket,
  ChartColumn,
  TriangleAlert,
  Lightbulb,
  Wallet,
  ShieldCheck,
  Target,
  Map,
  Sparkles,
};

export const PPT_STYLE = "MODERN";

const BRAND = "SlideOS";
const FOOTER_Y = 5.28; // inches (slide is 5.625 tall)

export function defineMaster(pres, themeColors) {
  pres.defineSlideMaster({
    title: "MODERN_MASTER",
    background: { color: themeColors.background || "F5F5F7" },
    objects: [
      {
        rect: {
          x: 0,
          y: 0,
          w: "100%",
          h: 0.14,
          fill: { color: themeColors.primary || "6366F1" },
        },
      },
      {
        text: {
          text: BRAND,
          options: {
            x: 0.55,
            y: FOOTER_Y,
            w: 3,
            h: 0.26,
            fontSize: 10,
            color: "94A3B8",
            fontFace: "Georgia",
          },
        },
      },
      {
        text: {
          text: "Slide {SLIDE_NUMBER} of {NUM_SLIDES}",
          options: {
            x: 8.6,
            y: FOOTER_Y,
            w: 1,
            h: 0.26,
            fontSize: 10,
            color: "94A3B8",
            fontFace: "Georgia",
            align: "right",
          },
        },
      },
    ],
  });
}

function loadImage(src) {
  return new Promise((resolve) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.referrerPolicy = "no-referrer";
    img.onload = () => resolve(img);
    img.onerror = () => resolve(null);
    img.src = src;
  });
}

// Crop an image to "cover" a box (matching CSS object-cover / the editor).
async function cropToCover(src, boxW, boxH) {
  if (!src || !boxW || !boxH) return null;
  try {
    const img = await loadImage(src);
    if (!img || !img.naturalWidth || !img.naturalHeight) return null;

    const nw = img.naturalWidth;
    const nh = img.naturalHeight;
    if (Math.abs(nw / nh - boxW / boxH) < 0.005) return null;

    const scale = Math.max(nw / boxW, nh / boxH);
    const sw = boxW * scale;
    const sh = boxH * scale;

    const canvas = document.createElement("canvas");
    canvas.width = boxW;
    canvas.height = boxH;
    const ctx = canvas.getContext("2d");
    ctx.drawImage(img, (nw - sw) / 2, (nh - sh) / 2, sw, sh, 0, 0, boxW, boxH);
    return canvas.toDataURL("image/jpeg", 0.92);
  } catch (err) {
    console.warn("Image crop failed, exporting without crop:", err);
    return null;
  }
}

function addImageCover(slide, src, x, y, w, h) {
  const isData = src.startsWith("data:") || src.startsWith("blob:");
  const opts = { x, y, w, h };
  if (isData) opts.data = src;
  else opts.path = src;
  slide.addImage(opts);
}

// Rasterize a lucide icon to a PNG data URL so PowerPoint can embed it as an
// image. Pure vector paths render via renderToStaticMarkup -> canvas, so it
// works offline and never taints the canvas (no cross-origin fetch).
async function rasterizeIcon(name, color, px = 64) {
  const Icon = DECOR_ICONS[name];
  if (!Icon) return null;
  try {
    const svg = renderToStaticMarkup(
      React.createElement(Icon, { size: px, color, strokeWidth: 2 })
    );
    const svgData =
      "data:image/svg+xml;base64," +
      btoa(unescape(encodeURIComponent(svg)));
    const img = await loadImage(svgData);
    if (!img || !img.naturalWidth) return null;
    const canvas = document.createElement("canvas");
    canvas.width = px;
    canvas.height = px;
    const ctx = canvas.getContext("2d");
    ctx.drawImage(img, 0, 0, px, px);
    return canvas.toDataURL("image/png");
  } catch (err) {
    console.warn("Icon rasterize failed, exporting chip without icon:", err);
    return null;
  }
}

// Decorative layer export: soft blob, watermark numeral and accent divider.
// Drawn BEFORE the content blocks so they sit behind the text/cards, matching
// SlideStage's z-order. The heading icon chip is exported last (see
// exportSlideWithElements) so it stays on top like the on-screen render.
async function exportDecor(slide, desc, theme) {
  const decor = desc.decor;
  if (!decor) return;

  // Watermark numeral (behind content)
  if (decor.watermark) {
    const w = decor.watermark;
    slide.addText(String(w.text), {
      x: w.x,
      y: w.y,
      w: w.w,
      h: w.h,
      fontSize: w.size,
      bold: true,
      color: normalizeHex(w.color),
      transparency: Math.round((1 - w.opacity) * 100),
      fontFace: theme.headingFont,
      align: "right",
      valign: "top",
      fit: "shrink",
      decor: "watermark",
    });
  }

  // Soft corner blob (behind content)
  for (const s of decor.shapes || []) {
    slide.addShape("ellipse", {
      x: s.x,
      y: s.y,
      w: s.w,
      h: s.h,
      fill: {
        color: normalizeHex(s.fill),
        transparency: Math.round((1 - s.opacity) * 100),
      },
      line: { type: "none", color: "FFFFFF00" },
    });
  }

  // Accent divider under the heading
  if (decor.divider) {
    const d = decor.divider;
    slide.addShape("rect", {
      x: d.x,
      y: d.y,
      w: d.w,
      h: d.h,
      fill: { color: normalizeHex(d.color) },
      line: { type: "none", color: "FFFFFF00" },
    });
  }
}

// Heading icon chip (exported on top of the content, like SlideStage).
async function exportDecorChip(slide, desc) {
  const decor = desc.decor;
  if (!decor?.icon) return;
  const chip = decor.icon.chip;
  slide.addShape("roundRect", {
    x: chip.x,
    y: chip.y,
    w: chip.w,
    h: chip.h,
    fill: { color: normalizeHex(chip.fill) },
    line: { color: normalizeHex(chip.border), width: 0.5 },
    rectRadius: 0.12,
  });
  const png = await rasterizeIcon(decor.icon.name, decor.icon.color, 64);
  if (png) {
    const inset = 0.11;
    const iconIn = chip.w - inset * 2;
    slide.addImage({
      data: png,
      x: chip.x + inset,
      y: chip.y + inset,
      w: iconIn,
      h: iconIn,
    });
  }
}

// Main entry: render one slide. Signature kept for the caller.
export async function exportSlideWithElements(slide, slideData, themeColors, bodyFont, headingFont, meta = { index: 0, total: 1 }) {
  const theme = {
    primary: normalizeHex(themeColors.primary || "6366F1"),
    accent: normalizeHex(themeColors.accent || "818CF8"),
    background: normalizeHex(themeColors.background || "F5F5F7"),
    text: normalizeHex(themeColors.text || "111827"),
    textMuted: normalizeHex(themeColors.textMuted || "6B7280"),
    headingFont: headingFont || "Georgia",
    bodyFont: bodyFont || "Arial",
  };

  const desc = computeSlideLayout(slideData, theme, meta);

  // 1) Background
  if (desc.background.kind === "color" && desc.background.fill) {
    slide.background = { color: desc.background.fill };
  } else if (desc.background.kind === "gradient") {
    const stops = String(desc.background.value).match(/#[0-9a-fA-F]{3,8}/g);
    if (Array.isArray(stops) && stops.length >= 2) {
      slide.background = { color: interpolateColor(stops[0], stops[1], 0.5) };
    }
  }

  // 1b) Decorative background layer (watermark, blob, divider — behind content)
  await exportDecor(slide, desc, theme);

  // 1c) Timeline (vertical line + milestone dots, behind the cards)
  if (desc.timeline) {
    const tl = desc.timeline;
    slide.addShape("line", {
      x: tl.x,
      y: tl.yTop,
      w: 0,
      h: tl.yBottom - tl.yTop,
      line: { color: normalizeHex(tl.color) + "59", width: 2.5 },
    });
    for (const dy of tl.dots || []) {
      slide.addShape("ellipse", {
        x: tl.x - 0.045,
        y: dy - 0.045,
        w: 0.09,
        h: 0.09,
        fill: { color: normalizeHex(tl.dotColor) },
        line: { color: "FFFFFF", width: 1.5 },
      });
    }
  }

  // 2) Cover image (full-bleed or right panel)
  if (desc.image && desc.image.src) {
    const boxW = Math.round(desc.image.w * 96);
    const boxH = Math.round(desc.image.h * 96);
    const cover = await cropToCover(desc.image.src, boxW, boxH);
    if (cover) {
      slide.addImage({ data: cover, x: desc.image.x, y: desc.image.y, w: desc.image.w, h: desc.image.h });
    } else {
      addImageCover(slide, desc.image.src, desc.image.x, desc.image.y, desc.image.w, desc.image.h);
    }
  }

  // 3) Dark overlay (section dividers over full-bleed images)
  if (desc.overlay) {
    const alpha = Math.round(desc.overlay.opacity * 255).toString(16).padStart(2, "0");
    slide.addShape("rect", {
      x: desc.overlay.x,
      y: desc.overlay.y,
      w: desc.overlay.w,
      h: desc.overlay.h,
      fill: { color: (desc.overlay.hex || "0F172A") + alpha },
      line: { color: "FFFFFF00" },
    });
  }

  // 4) Text blocks (top-aligned — prevents the "doubled/overlap" look)
  for (const t of desc.texts || []) {
    if (!t.text || !String(t.text).trim()) continue;
    const hasOpacity = t.opacity !== undefined && t.hexColor;
    slide.addText(String(t.text), {
      x: t.x,
      y: t.y,
      w: t.w,
      h: t.h,
      fontSize: t.size,
      bold: t.bold || false,
      color: normalizeHex(t.hexColor || t.color || theme.text),
      ...(hasOpacity
        ? { transparency: Math.round((1 - t.opacity) * 100) }
        : {}),
      fontFace: t.font || theme.bodyFont,
      align: t.align || "left",
      valign: "top",
      fit: "shrink",
    });
  }

  // 5) Cards
  for (const c of desc.cards || []) {
    slide.addShape("roundRect", {
      x: c.x,
      y: c.y,
      w: c.w,
      h: c.h,
      fill: { color: normalizeHex(c.fill || "F8F9FA") },
      line: { color: normalizeHex(c.border || "E8E8F0"), width: 0.5 },
      rectRadius: 0.08,
    });
    const titleX = c.x + (c.tag ? 0.62 : 0.18);
    const titleW = c.w - (c.tag ? 0.8 : 0.36);
    if (c.tag) {
      slide.addShape("roundRect", {
        x: c.x + 0.14,
        y: c.y + 0.14,
        w: 0.38,
        h: 0.38,
        fill: { color: normalizeHex(c.tagFill || "111827") },
        line: { type: "none", color: "FFFFFF00" },
        rectRadius: 0.08,
      });
      slide.addText(String(c.tag), {
        x: c.x + 0.14,
        y: c.y + 0.14,
        w: 0.38,
        h: 0.38,
        fontSize: c.tagSize || 11,
        bold: true,
        color: "FFFFFF",
        align: "center",
        valign: "ctr",
      });
    }
    if (c.title) {
      slide.addText(String(c.title), {
        x: titleX,
        y: c.y + 0.12,
        w: titleW,
        h: 0.34,
        fontFace: theme.headingFont,
        fontSize: c.titleSize || 15,
        bold: true,
        color: normalizeHex(c.titleColor || theme.text),
        valign: "top",
        fit: "shrink",
      });
    }
    if (c.body) {
      slide.addText(String(c.body), {
        x: titleX,
        y: c.y + 0.46,
        w: titleW,
        h: c.h - 0.58,
        fontSize: c.bodySize || 11,
        color: normalizeHex("3A3A3A"),
        fontFace: theme.bodyFont,
        valign: "top",
        fit: "shrink",
      });
    }
  }

  // 6) Bullet lists (content-only)
  for (const b of desc.bullets || []) {
    slide.addText(String(b.text), {
      x: b.x,
      y: b.y,
      w: b.w,
      h: b.h,
      fontSize: b.size,
      color: normalizeHex(b.color || theme.text),
      fontFace: b.font || theme.bodyFont,
      bullet: { code: "2022", indent: 12 },
      valign: "top",
      fit: "shrink",
    });
  }

  // 7) Two-column bullets
  for (const col of desc.columns || []) {
    if (col.title) {
      slide.addText(String(col.title), {
        x: col.x,
        y: col.y - 0.5,
        w: col.w,
        h: 0.4,
        fontSize: col.titleSize || 18,
        bold: true,
        color: normalizeHex(col.titleColor || theme.text),
        fontFace: theme.headingFont,
        valign: "top",
        fit: "shrink",
      });
    }
    let yCursor = col.y;
    for (const item of col.bullets || []) {
      slide.addText(String(item.text), {
        x: col.x,
        y: yCursor,
        w: col.w,
        h: 0.5,
        fontSize: item.size || 17,
        color: normalizeHex(item.color || theme.text),
        fontFace: item.font || theme.bodyFont,
        bullet: { code: "2022", indent: 12 },
        valign: "top",
        fit: "shrink",
      });
      yCursor += 0.62;
    }
  }

  // 8) Heading icon chip (on top of content, matching SlideStage z-order)
  await exportDecorChip(slide, desc);
}