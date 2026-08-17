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

function extractRoles(slideData) {
  const elements = slideData.elements || [];
  const texts = elements.filter(
    (e) => e.type === "text" && e.content && String(e.content).trim()
  );
  const fgImages = elements.filter((e) => e.type === "image" && e.zIndex !== 0);
  const bgImageEl = elements.find((e) => e.type === "image" && e.zIndex === 0);
  const bg = slideData.background || {};

  const heading =
    texts.find((e) => e.bold)?.content ||
    texts[0]?.content ||
    slideData.heading ||
    "Untitled";
  const rest = texts.filter((t) => t.content !== heading);
  const subtitle = rest[0]?.content || "";
  const bullets = rest.map((t) => t.content).filter(Boolean);

  const bgSrc = (bg.type === "image" && bg.value) || bgImageEl?.src || null;
  const panelSrc = fgImages[0]?.src || bgSrc || null;

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
  const roles = extractRoles(slideData);
  const background = backgroundDesc(roles.background, theme);

  let layout =
    slideData.layoutPattern ||
    slideData.layout ||
    (roles.background.type === "image" ? "section-divider" : "content-only");

  const hasFgImage = roles.fgImages.length > 0;

  const builder = {
    "title-slide": () => titleSlide(roles, theme, background),
    "section-divider": () => sectionDivider(roles, theme, background),
    "big-stat": () => bigStat(roles, theme, background),
    "two-column": () => twoColumn(roles, theme, background),
    modern: () => modern(roles, theme, background),
    "content-only": () => contentOnly(roles, theme, background),
  };

  if (builder[layout]) return wrap(builder[layout](), layout, theme, meta);

  return hasFgImage
    ? wrap(modern(roles, theme, background), "modern", theme, meta)
    : wrap(contentOnly(roles, theme, background), "content-only", theme, meta);
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