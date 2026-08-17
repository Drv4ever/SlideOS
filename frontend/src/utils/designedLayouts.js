// Shared design layout engine.
// Converts raw slide data (background + elements) into an explicit DESIGN
// description authored in PPTX-native units: inches for position/size and
// points for font sizes, on a 10 x 5.625 inch slide (LAYOUT_16x9 = widescreen
// 16:9, the same board PowerPoint uses).
//
// Both the SlideOS Presentation View (web) and the PPTX export consume the SAME
// description, so the browser stage shows the same blocks (accent bar, serif
// headings, cards, image panels, big stat, footers) as the PowerPoint file.
//
// NOTE: box heights are intentional and modest so text never bleeds into the
// element below it, and all text renders top-aligned (PowerPoint defaults to
// vertically CENTERING text, which made boxes look doubled/overlapped before).

export const SLIDE_W = 10; // inches (LAYOUT_16x9)
export const SLIDE_H = 5.625; // inches (LAYOUT_16x9)

const MARGIN_LEFT = 0.6;
const MARGIN_TOP = 0.5;
const RIGHT_PANEL_X = 6.2;
const RIGHT_PANEL_W = 3.8;
const CONTENT_W = RIGHT_PANEL_X - MARGIN_LEFT - 0.3; // 5.3 (text area beside right panel)
const FULL_W = SLIDE_W - MARGIN_LEFT * 2; // 8.8

const CARD_FILL = "F8F9FA";
const CARD_BORDER = "E8E8F0";

export function normalizeHex(hex) {
  let h = String(hex || "").replace("#", "").trim().toLowerCase();
  if (h.length === 3) h = h.split("").map((c) => c + c).join("");
  if (h.length === 4) h = h.slice(1).split("").map((c) => c + c).join("");
  if (h.length === 8) h = h.slice(0, 6);
  if (h.length !== 6 || /[^0-9a-f]/.test(h)) return "FFFFFF";
  return h;
}

export function interpolateColor(hex1, hex2, ratio) {
  const c1 = normalizeHex(hex1);
  const c2 = normalizeHex(hex2);
  const r1 = parseInt(c1.substr(0, 2), 16);
  const g1 = parseInt(c1.substr(2, 2), 16);
  const b1 = parseInt(c1.substr(4, 2), 16);
  const r2 = parseInt(c2.substr(0, 2), 16);
  const g2 = parseInt(c2.substr(2, 2), 16);
  const b2 = parseInt(c2.substr(4, 2), 16);
  const r = Math.round(r1 * (1 - ratio) + r2 * ratio).toString(16).padStart(2, "0");
  const g = Math.round(g1 * (1 - ratio) + g2 * ratio).toString(16).padStart(2, "0");
  const b = Math.round(b1 * (1 - ratio) + b2 * ratio).toString(16).padStart(2, "0");
  return `${r}${g}${b}`;
}

// Single canonical role extraction. Consumes BOTH slide schemas:
// - editor format: positioned `text`/`image` elements (+ background)
// - outline format: `heading` + `content[]` + `image` (+ heading/bullet elements)
// So every consumer (Preview, Present, thumbnails, PPTX) derives the same
// heading/bullets/image from the same slide object — one source of truth.
export function extractSlideRoles(slideData) {
  const elements = slideData.elements || [];
  const texts = elements.filter(
    (e) => e.type === "text" && e.content && String(e.content).trim()
  );
  const fgImages = elements.filter((e) => e.type === "image" && e.zIndex !== 0);
  const bgImageEl = elements.find((e) => e.type === "image" && e.zIndex === 0);
  const bg = slideData.background || {};

  const headingEl = elements.find((e) => e.type === "heading");
  const bulletEl = elements.find((e) => e.type === "bullet");
  const outlineBullets = Array.isArray(slideData.content)
    ? slideData.content.filter((c) => c && String(c).trim())
    : [];

  const heading =
    texts.find((e) => e.bold)?.content ||
    texts[0]?.content ||
    slideData.heading ||
    headingEl?.content ||
    "Untitled";

  const rest = texts.filter((t) => t.content !== heading);
  const fallbackBullets =
    outlineBullets.length > 0 ? outlineBullets : bulletEl?.items || [];
  const bullets =
    rest.length > 0
      ? rest.map((t) => t.content).filter(Boolean)
      : fallbackBullets;
  const subtitle =
    slideData.subtitle || rest[0]?.content || fallbackBullets[0] || "";

  const bgSrc =
    (bg.type === "image" && bg.value) || bgImageEl?.src || slideData.image?.url || null;
  const panelSrc = fgImages[0]?.src || slideData.image?.url || bgSrc || null;

  return { heading, subtitle, bullets, fgImages, bgSrc, panelSrc, background: bg };
}

function backgroundDesc(bg, theme) {
  const base = {
    kind: "color",
    fill: theme.background,
    css: theme.background,
    value: theme.background,
  };
  if (!bg) return base;
  if (bg.type === "color" && bg.value) {
    return { kind: "color", fill: normalizeHex(bg.value), css: bg.value, value: bg.value };
  }
  if (bg.type === "gradient" && bg.value) {
    return { kind: "gradient", fill: null, css: bg.value, value: bg.value };
  }
  if (bg.type === "image" && bg.value) {
    return { kind: "image", fill: null, css: "transparent", value: bg.value };
  }
  return base;
}

export function computeSlideLayout(slideData, theme, meta) {
  const roles = extractSlideRoles(slideData);
  const background = backgroundDesc(roles.background, theme);

  let layout =
    slideData.layoutPattern ||
    slideData.layout ||
    (roles.background.type === "image" ? "section-divider" : "content-only");

  const hasFgImage =
    roles.fgImages.length > 0 || !!roles.panelSrc || !!roles.bgSrc;

  const builder = {
    "title-slide": () => titleSlide(roles, theme, background),
    "section-divider": () => sectionDivider(roles, theme, background),
    "big-stat": () => bigStat(roles, theme, background),
    "two-column": () => twoColumn(roles, theme, background),
    modern: () => modern(roles, theme, background),
    "content-only": () => contentOnly(roles, theme, background),
  };

  let desc;
  if (builder[layout]) {
    desc = wrap(builder[layout](), layout, theme, meta);
  } else {
    desc = hasFgImage
      ? wrap(modern(roles, theme, background), "modern", theme, meta)
      : wrap(contentOnly(roles, theme, background), "content-only", theme, meta);
  }

  // User moves/sizes from the design-aware editor win over the computed layout.
  applyOverrides(desc, slideData.design?.overrides);

  // Auto-fit: shrink every text block's font size so its content fits inside
  // its box (designed box heights are modest on purpose; long content would
  // otherwise clip through the box border). Runs AFTER overrides so even a
  // manual size is clamped to what the box can actually hold. Every consumer
  // (canvas, preview, present, thumbnails, PPTX) reads this same description.
  fitDescription(desc);

  return desc;
}

// ------------------------------------------------------------------ auto-fit

// Average glyph width as a fraction of the font size (mixed-case text).
const AVG_GLYPH_EM = 0.5;

// Estimate how many wrapped lines a text needs at a given pt size inside a box
// w inches wide. Explicit "\n" line breaks always start a new line.
function estimateLines(text, wIn, sizePt) {
  const perLine = Math.max(1, Math.floor(wIn / ((sizePt / 72) * AVG_GLYPH_EM)));
  return String(text)
    .split("\n")
    .reduce((acc, seg) => acc + Math.max(1, Math.ceil((seg.length || 1) / perLine)), 0);
}

// Fitted font size (pt) for a block of text in a w x h inch box.
function fitSize(text, wIn, hIn, sizePt, lineHeight, minSize) {
  const target = Math.max(0.25, hIn);
  let size = sizePt || 16;
  for (let pass = 0; pass < 4; pass++) {
    const needed = estimateLines(text, wIn, size) * (size / 72) * lineHeight;
    if (needed <= target || size <= minSize) break;
    size = Math.max(minSize, Math.round((size * (target / needed)) * 10) / 10);
  }
  return size;
}

// Shrink card title + body fonts together so both fit inside the card box
// (SlideStage pads the card 0.12 in top/bottom; body sits under the title).
function fitCard(card) {
  const text = String(card.title || "");
  const body = String(card.body || "");
  if (!text && !body) return;
  const innerW = Math.max(0.5, card.w - 0.36);
  const innerH = Math.max(0.3, card.h - 0.24);
  const startTitle = card.titleSize || 15;
  const startBody = card.bodySize || 11;
  let titleSize = startTitle;
  let bodySize = startBody;
  for (let pass = 0; pass < 4; pass++) {
    const titleH = estimateLines(text, innerW, titleSize) * (titleSize / 72) * 1.1;
    const bodyH = body
      ? estimateLines(body, innerW, bodySize) * (bodySize / 72) * 1.2 + 0.05
      : 0;
    if (titleH + bodyH <= innerH || (titleSize <= 8 && bodySize <= 7)) break;
    const scale = innerH / (titleH + bodyH);
    titleSize = Math.max(8, Math.round(titleSize * scale * 10) / 10);
    bodySize = Math.max(7, Math.round(bodySize * scale * 10) / 10);
  }
  if (titleSize !== startTitle) card.titleSize = titleSize;
  if (bodySize !== startBody) card.bodySize = bodySize;
}

function fitDescription(desc) {
  for (const t of desc.texts || []) {
    t.size = fitSize(t.text, t.w, t.h, t.size, 1.15, 10);
  }
  for (const b of desc.bullets || []) {
    b.size = fitSize(b.text, b.w, b.h, b.size, 1.2, 9);
  }
  for (const col of desc.columns || []) {
    for (const item of col.bullets || []) {
      item.size = fitSize(item.text, col.w, 0.5, item.size || 17, 1.2, 9);
    }
  }
  for (const c of desc.cards || []) {
    fitCard(c);
  }
}

// Overrides (in inches/pt) recorded by the design-aware editor canvas. Applied
// to the computed description so web, present, thumbnails and PPTX all honor
// the user's manual tweaks — one description, one source of truth.
function applyOverrides(desc, overrides) {
  if (!overrides) return;
  const heading = overrides.heading;
  if (heading && desc.texts?.[0]) {
    if (heading.x !== undefined) desc.texts[0].x = heading.x;
    if (heading.y !== undefined) desc.texts[0].y = heading.y;
    if (heading.size !== undefined) desc.texts[0].size = heading.size;
  }
  const bullets = overrides.bullets || [];
  // content-only / section-divider bullets
  (desc.bullets || []).forEach((b, i) => {
    const o = bullets[i];
    if (!o) return;
    if (o.x !== undefined) b.x = o.x;
    if (o.y !== undefined) b.y = o.y;
    if (o.size !== undefined) b.size = o.size;
  });
  // two-column bullets (left = first ceil(n/2), right = the rest — same split
  // the twoColumn builder uses)
  const mid = Math.ceil(bullets.length / 2);
  (desc.columns || []).forEach((col, k) => {
    (col.bullets || []).forEach((b, i) => {
      const o = bullets[k === 0 ? i : mid + i];
      if (!o) return;
      if (o.x !== undefined) col.x = o.x;
      if (o.y !== undefined) b.y = o.y;
      if (o.size !== undefined) b.size = o.size;
    });
  });
  // modern cards (card i -> bullet i+1, bullets[0] is the intro)
  (desc.cards || []).forEach((c, i) => {
    const o = bullets[i + 1];
    if (!o) return;
    if (o.x !== undefined) c.x = o.x;
    if (o.y !== undefined) c.y = o.y;
    if (o.size !== undefined) c.titleSize = o.size;
  });
  // subtitle / intro text block (texts[1]) is bullet 0
  if (bullets[0] && desc.texts?.[1]) {
    if (bullets[0].x !== undefined) desc.texts[1].x = bullets[0].x;
    if (bullets[0].y !== undefined) desc.texts[1].y = bullets[0].y;
    if (bullets[0].size !== undefined) desc.texts[1].size = bullets[0].size;
  }
}

// Canonical outline shape for editors that work in {heading, content[]}.
// Lossless for the design engine: roles are derived from the SAME extractSlideRoles
// every renderer uses, so converting back and forth never changes the look.
export function toOutlineSlide(slide) {
  const roles = extractSlideRoles(slide || {});
  const panelSrc = roles.panelSrc;
  return {
    id: slide?.id || slide?._id,
    layout: slide?.layoutPattern || slide?.layout || "content-only",
    heading: roles.heading,
    content: roles.bullets,
    image:
      slide?.image ||
      (panelSrc
        ? { url: panelSrc, thumb: panelSrc, alt: "slide image" }
        : null),
    elements: [
      { type: "heading", content: roles.heading },
      { type: "bullet", content: "", items: roles.bullets },
    ],
  };
}

// Write one role (heading or bullet[ index ]) back to the slide, regardless of
// which schema it uses (positioned text elements, heading/bullet elements, or
// plain {heading, content[]}). Mirrors extractSlideRoles, so any edit made in
// the canvas or preview is seen identically by every renderer.
export function updateSlideRole(slide, role, index, value) {
  const next = { ...slide };
  const elements = Array.isArray(slide.elements) ? [...slide.elements] : [];

  const textEls = elements.filter(
    (e) => e.type === "text" && e.content !== undefined
  );

  if (role === "heading") {
    if (textEls.length > 0) {
      const headingEl = textEls.find((e) => e.bold) || textEls[0];
      next.elements = elements.map((el) =>
        el.id === headingEl.id ? { ...el, content: value } : el
      );
      return next;
    }
    const headingEl = elements.find((e) => e.type === "heading");
    if (headingEl) {
      next.elements = elements.map((el) =>
        el.type === "heading" ? { ...el, content: value } : el
      );
    }
    next.heading = value;
    return next;
  }

  if (textEls.length > 0) {
    const headingText = textEls.find((e) => e.bold) || textEls[0];
    const rest = textEls.filter((el) => el.id !== headingText.id);
    const target = rest[index];
    if (!target) return next;
    next.elements = elements.map((el) =>
      el.id === target.id ? { ...el, content: value } : el
    );
    return next;
  }

  const bulletEl = elements.find((e) => e.type === "bullet");
  if (bulletEl) {
    const items = [...(bulletEl.items || [])];
    items[index] = value;
    next.elements = elements.map((el) =>
      el.type === "bullet" ? { ...el, items } : el
    );
    // Keep the content[] mirror in sync (extractSlideRoles prefers it).
    const content = Array.isArray(slide.content) ? [...slide.content] : [];
    if (content.length || index < content.length) {
      content[index] = value;
      next.content = content;
    }
    return next;
  }

  const content = Array.isArray(slide.content) ? [...slide.content] : [];
  content[index] = value;
  next.content = content;
  return next;
}

// Append a bullet to the canonical bullet source of any schema.
export function addSlideRoleBullet(slide, value = "New point") {
  const next = { ...slide };
  const elements = Array.isArray(slide.elements) ? [...slide.elements] : [];
  const textEls = elements.filter(
    (e) => e.type === "text" && e.content !== undefined
  );
  if (textEls.length > 0) {
    next.elements = [
      ...elements,
      {
        id: `bullet-${Date.now()}`,
        type: "text",
        content: value,
        x: 120,
        y: 0,
        width: 800,
        height: 36,
        fontSize: 22,
        bold: false,
      },
    ];
    return next;
  }
  const bulletEl = elements.find((e) => e.type === "bullet");
  if (bulletEl) {
    next.elements = elements.map((el) =>
      el.type === "bullet"
        ? { ...el, items: [...(el.items || []), value] }
        : el
    );
    next.content = [...(Array.isArray(slide.content) ? slide.content : []), value];
    return next;
  }
  next.content = [...(Array.isArray(slide.content) ? slide.content : []), value];
  return next;
}

// Remove a bullet from the canonical bullet source of any schema.
export function deleteSlideRoleBullet(slide, index) {
  const next = { ...slide };
  const elements = Array.isArray(slide.elements) ? [...slide.elements] : [];
  const textEls = elements.filter(
    (e) => e.type === "text" && e.content !== undefined
  );
  if (textEls.length > 0) {
    const headingText = textEls.find((e) => e.bold) || textEls[0];
    const rest = textEls.filter((el) => el.id !== headingText.id);
    const target = rest[index];
    if (!target) return next;
    next.elements = elements.filter((el) => el.id !== target.id);
    return next;
  }
  const bulletEl = elements.find((e) => e.type === "bullet");
  if (bulletEl) {
    next.elements = elements.map((el) =>
      el.type === "bullet"
        ? { ...el, items: (el.items || []).filter((_, i) => i !== index) }
        : el
    );
    next.content = (Array.isArray(slide.content) ? slide.content : []).filter(
      (_, i) => i !== index
    );
    return next;
  }
  next.content = (Array.isArray(slide.content) ? slide.content : []).filter(
    (_, i) => i !== index
  );
  return next;
}

function wrap(layout, name, theme, meta) {
  return {
    layout: name,
    accentBar: theme.primary,
    footer: {
      brand: "SlideOS",
      page: `${meta.index + 1} of ${meta.total}`,
    },
    ...layout,
  };
}

function imageBlock(roles) {
  if (!roles.panelSrc) return { image: null, overlay: null };
  return {
    image: {
      src: roles.panelSrc,
      mode: "panel",
      x: RIGHT_PANEL_X,
      y: 0,
      w: RIGHT_PANEL_W,
      h: SLIDE_H,
    },
    overlay: null,
  };
}

function fullBleedBlock(roles) {
  if (!roles.bgSrc) return { image: null, overlay: null };
  return {
    image: {
      src: roles.bgSrc,
      mode: "fullbleed",
      x: 0,
      y: 0,
      w: SLIDE_W,
      h: SLIDE_H,
    },
    overlay: {
      x: 0,
      y: 0,
      w: SLIDE_W,
      h: SLIDE_H,
      css: "rgba(15,23,42,0.55)",
      hex: "0F172A",
      opacity: 0.55,
    },
  };
}

function headingText(text, size, y, w, color, font, align) {
  return {
    text,
    x: MARGIN_LEFT,
    y,
    w,
    h: Math.round((Math.max(0.55, (size / 72) * 1.6 + 0.12)) * 100) / 100,
    size,
    font,
    bold: true,
    color,
    align: align || "left",
    valign: "top",
  };
}

// ---------------------------------------------------------------- layouts

function titleSlide(roles, theme, background) {
  const panel = imageBlock(roles);
  return {
    background,
    texts: [
      headingText(roles.heading, 44, 2.0, CONTENT_W, theme.text, theme.headingFont),
      ...(roles.subtitle
        ? [
            {
              text: roles.subtitle,
              x: MARGIN_LEFT,
              y: 4.0,
              w: CONTENT_W,
              h: 0.9,
              size: 18,
              font: theme.bodyFont,
              bold: false,
              color: theme.textMuted,
              align: "left",
              valign: "top",
            },
          ]
        : []),
    ],
    ...panel,
  };
}

function sectionDivider(roles, theme, background) {
  if (roles.bgSrc) {
    const bg = fullBleedBlock(roles);
    return {
      background,
      texts: [
        headingText(roles.heading, 44, 1.7, SLIDE_W - MARGIN_LEFT * 2 - 0.4, "#ffffff", theme.headingFont),
        ...(roles.subtitle
          ? [
              {
                text: roles.subtitle,
                x: MARGIN_LEFT + 0.2,
                y: 3.45,
                w: SLIDE_W - MARGIN_LEFT * 2 - 0.4,
                h: 0.8,
                size: 20,
                font: theme.bodyFont,
                bold: false,
                color: "rgba(255,255,255,0.85)",
                hexColor: "FFFFFF",
                opacity: 0.85,
                align: "left",
                valign: "top",
              },
            ]
          : []),
      ],
      ...bg,
    };
  }
  return {
    background,
    texts: [headingText(roles.heading, 48, 2.2, FULL_W, theme.text, theme.headingFont)],
    image: null,
    overlay: null,
  };
}

function bigStat(roles, theme, background) {
  const panel = imageBlock(roles);
  return {
    background,
    texts: [
      {
        text: roles.heading,
        x: MARGIN_LEFT,
        y: 1.3,
        w: panel.image ? CONTENT_W : FULL_W,
        h: 1.6,
        size: 60,
        font: theme.headingFont,
        bold: true,
        color: theme.primary,
        align: "left",
        valign: "top",
      },
      ...(roles.subtitle
        ? [
            {
              text: roles.subtitle,
              x: MARGIN_LEFT,
              y: 3.4,
              w: panel.image ? CONTENT_W : FULL_W,
              h: 1.0,
              size: 22,
              font: theme.bodyFont,
              bold: false,
              color: theme.textMuted,
              align: "left",
              valign: "top",
            },
          ]
        : []),
    ],
    ...panel,
  };
}

function twoColumn(roles, theme, background) {
  const mid = Math.ceil(roles.bullets.length / 2);
  const left = roles.bullets.slice(0, mid);
  const right = roles.bullets.slice(mid);
  const colW = FULL_W / 2 - 0.15; // 4.25
  const gap = 0.3;

  const col = (items, x) => ({
    x,
    y: 1.5,
    w: colW,
    h: SLIDE_H - 1.7,
    bullets: items.map((b) => ({
      text: b,
      size: 17,
      font: theme.bodyFont,
      color: theme.text,
    })),
  });

  return {
    background,
    texts: [headingText(roles.heading, 32, MARGIN_TOP, FULL_W, theme.text, theme.headingFont)],
    columns: [col(left, MARGIN_LEFT), col(right, MARGIN_LEFT + colW + gap)],
    image: null,
    overlay: null,
  };
}

function contentOnly(roles, theme, background) {
  const panel = imageBlock(roles);
  const listW = panel.image ? CONTENT_W - 0.3 : FULL_W - 0.3;
  return {
    background,
    texts: [headingText(roles.heading, 32, MARGIN_TOP, panel.image ? CONTENT_W : FULL_W, theme.text, theme.headingFont)],
    bullets: roles.bullets.map((b, i) => ({
      text: b,
      x: MARGIN_LEFT + 0.15,
      y: 1.55 + i * 0.62,
      w: listW,
      h: 0.5,
      size: 18,
      font: theme.bodyFont,
      color: theme.text,
    })),
    ...panel,
  };
}

function modern(roles, theme, background) {
  const panel = imageBlock(roles);
  const hasPanel = !!panel.image;
  const areaW = hasPanel ? CONTENT_W : FULL_W;

  const intro = roles.bullets[0] || roles.subtitle || "";
  const cardSource = roles.bullets.slice(1);
  const cards = cardSource.slice(0, 4).map((item, i) => {
    // Split into title (first line) + body (remaining lines). When there is no
    // line break, body stays EMPTY so the card never shows the same text twice.
    const parts = String(item).split("\n");
    const title = parts[0] || item.slice(0, 30);
    const body = parts.slice(1).join("\n");
    const w = hasPanel ? 2.52 : 4.2;
    const x = MARGIN_LEFT + (i % 2) * (w + 0.24);
    const y = 2.45 + Math.floor(i / 2) * 1.62;
    return {
      x,
      y,
      w,
      h: 1.5,
      title,
      body,
      fill: CARD_FILL,
      border: CARD_BORDER,
    };
  });

  return {
    background,
    texts: [
      headingText(roles.heading, 30, MARGIN_TOP, areaW, theme.text, theme.headingFont),
      ...(intro
        ? [
            {
              text: intro,
              x: MARGIN_LEFT,
              y: 1.45,
              w: areaW,
              h: 0.85,
              size: 13,
              font: theme.bodyFont,
              bold: false,
              color: theme.textMuted,
              align: "left",
              valign: "top",
            },
          ]
        : []),
    ],
    cards,
    ...panel,
  };
}