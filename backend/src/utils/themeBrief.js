// Backend mirror of the frontend theme catalog (frontend/src/utils/themes.js).
// The generate endpoint receives the selected theme (id or full object) and
// turns it into a design brief the LLM can act on: palette, fonts and mood.
// Keeping the catalog here means the AI prompt stays meaningful even when the
// client only sends a theme id (e.g. older clients or the remix pipeline).

export const THEME_CATALOG = {
  cornflower: {
    name: "Cornflower Blue",
    colors: { primary: "#3b82f6", accent: "#22d3ee", background: "#ffffff", text: "#1e3a8a" },
    fontFamily: { heading: "Space Grotesk", body: "DM Sans" },
    mood: "clean, modern, trustworthy, tech-forward",
  },
  cosmos: {
    name: "Cosmos",
    colors: { primary: "#7c3aed", accent: "#f59e0b", background: "#ffffff", text: "#3b0764" },
    fontFamily: { heading: "Outfit", body: "DM Sans" },
    mood: "creative, bold, aspirational, slightly whimsical",
  },
  fluent: {
    name: "Microsoft Fluent",
    colors: { primary: "#0078d4", accent: "#ffb900", background: "#ffffff", text: "#201f1e" },
    fontFamily: { heading: "Outfit", body: "DM Sans" },
    mood: "corporate, crisp, accessible, product-focused",
  },
  dalibio: {
    name: "Dalibio",
    colors: { primary: "#c2410c", accent: "#22d3ee", background: "#ffffff", text: "#1e1b4b" },
    fontFamily: { heading: "Cormorant Garamond", body: "Outfit" },
    mood: "editorial, elegant, artistic, premium",
  },
  noir: {
    name: "Noir",
    colors: { primary: "#18181b", accent: "#facc15", background: "#ffffff", text: "#09090b" },
    fontFamily: { heading: "Sora", body: "DM Sans" },
    mood: "sleek, high-contrast, confident, monochrome with a yellow pop",
  },
  terra: {
    name: "Terra",
    colors: { primary: "#b45309", accent: "#0d9488", background: "#fffbf5", text: "#451a03" },
    fontFamily: { heading: "Playfair Display", body: "Source Sans 3" },
    mood: "warm, organic, earthy, grounded",
  },
  indigo: {
    name: "Indigo",
    colors: { primary: "#ea580c", accent: "#f43f5e", background: "#ffffff", text: "#7c2d12" },
    fontFamily: { heading: "Clash Display", body: "General Sans" },
    mood: "energetic, vibrant, startup-flavored",
  },
  orbit: {
    name: "Orbit",
    colors: { primary: "#7c3aed", accent: "#34d399", background: "#ffffff", text: "#2e1065" },
    fontFamily: { heading: "Space Grotesk", body: "DM Sans" },
    mood: "futuristic, dynamic, adventurous",
  },
  midnight: {
    name: "Midnight",
    colors: { primary: "#f8fafc", accent: "#22d3ee", background: "#0f172a", text: "#e2e8f0" },
    fontFamily: { heading: "Sora", body: "Inter" },
    mood: "dark, sophisticated, premium, night-sky",
  },
  cursive: {
    name: "Cursive Notes",
    colors: { primary: "#4f46e5", accent: "#f59e0b", background: "#fffdf5", text: "#312e81" },
    fontFamily: { heading: "Segoe Script", body: "Segoe Print" },
    mood: "friendly, handwritten, personal, classroom-like",
  },
  brush: {
    name: "Brush Script",
    colors: { primary: "#9a3412", accent: "#0f766e", background: "#fffaf5", text: "#431407" },
    fontFamily: { heading: "Brush Script MT", body: "Comic Sans MS" },
    mood: "playful, hand-lettered, casual, creative workshop",
  },
  handwritten: {
    name: "Handwritten",
    colors: { primary: "#be185d", accent: "#7c3aed", background: "#ffffff", text: "#500724" },
    fontFamily: { heading: "Lucida Handwriting", body: "Comic Sans MS" },
    mood: "warm, hand-written, storytelling, informal",
  },
};

// Accepts the theme as a string id or as the full theme object the frontend
// sends ({ id, name, colors, fontFamily, headingWeight }). Always returns a
// human-readable design brief for the LLM prompt.
export function buildThemeBrief(theme) {
  if (!theme) return null;
  const id = typeof theme === "string" ? theme : theme?.id;
  const catalog = THEME_CATALOG[id];

  const name =
    (typeof theme === "object" ? theme?.name : null) || catalog?.name || id || "Custom";
  const colors =
    (typeof theme === "object" ? theme?.colors : null) || catalog?.colors || null;
  const fonts =
    (typeof theme === "object" ? theme?.fontFamily : null) || catalog?.fontFamily || null;
  const mood = catalog?.mood || "modern and professional";

  const parts = [`Name: ${name}`];
  if (colors) {
    const palette = [
      colors.primary && `primary ${colors.primary}`,
      colors.accent && `accent ${colors.accent}`,
      colors.background && `background ${colors.background}`,
      colors.text && `text ${colors.text}`,
    ]
      .filter(Boolean)
      .join(", ");
    if (palette) parts.push(`palette: ${palette}`);
  }
  if (fonts) {
    const heading = fonts.heading || fonts;
    const body = fonts.body || heading;
    parts.push(`fonts: heading '${heading}', body '${body}'`);
  }
  parts.push(`mood: ${mood}`);
  return parts.join(" — ");
}