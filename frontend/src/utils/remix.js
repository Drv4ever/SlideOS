import { toOutlineSlide } from "./designedLayouts";
import { themes } from "./themes";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api";

// Resolve a theme id to its full brief (colors, fonts) so the backend can tell
// the LLM what the theme looks like instead of a bare id.
function themePayload(themeId) {
  const theme = themes.find((t) => t.id === themeId);
  return theme || themeId || "cornflower";
}

// Serialize slides into a compact outline the LLM can redesign.
// The design engine derives the same roles from this shape, so nothing is lost
// when the LLM returns a fresh layout + copy for the same content.
export function serializeForRemix(slides) {
  return (slides || [])
    .map((slide, i) => {
      const roles = extractRolesForRemix(slide);
      const bullets = roles.bullets.length
        ? roles.bullets.map((b) => `- ${b}`).join("\n")
        : "- (no points)";
      return `Slide ${i + 1} [layout: ${roles.layout}] (${roles.imageKeyword || "no image concept"}):\n${roles.heading}\n${bullets}`;
    })
    .join("\n\n");
}

// Role extraction for serialization: works on outline ({heading, content[]})
// OR editor format (elements), mirroring extractSlideRoles.
function extractRolesForRemix(slide) {
  const elements = Array.isArray(slide.elements) ? slide.elements : [];
  const texts = elements.filter(
    (e) => e.type === "text" && e.content && String(e.content).trim()
  );
  const headingEl = elements.find((e) => e.type === "heading");
  const bulletEl = elements.find((e) => e.type === "bullet");

  const heading =
    texts.find((e) => e.bold)?.content ||
    texts[0]?.content ||
    slide.heading ||
    headingEl?.content ||
    "Untitled";
  const rest = texts.filter((t) => t.content !== heading);
  const outlineBullets = Array.isArray(slide.content)
    ? slide.content.filter((c) => c && String(c).trim())
    : [];
  const bullets =
    rest.length > 0
      ? rest.map((t) => t.content).filter(Boolean)
      : outlineBullets.length > 0
        ? outlineBullets
        : bulletEl?.items || [];

  return {
    heading,
    bullets,
    layout: slide.layoutPattern || slide.layout || "content-only",
    imageKeyword: slide.imageKeyword || null,
  };
}

// Normalize remix response slides into the canonical outline shape, keeping
// stable ids so React keys and saved decks stay consistent.
function normalizeRemixSlides(rawSlides) {
  return (rawSlides || []).map((slide, i) => ({
    ...toOutlineSlide(slide),
    id:
      slide.id ||
      `slide-${Date.now()}-${i}-${Math.random().toString(36).slice(2, 8)}`,
  }));
}

// Shared POST to the existing generate pipeline with mode=remix. The controller
// keeps the exact same response shape (slides + images), so the whole render
// pipeline is reused untouched.
async function callRemix({ slides, prompt, themeId, textAmount, tone, audience, scenario }) {
  const token = localStorage.getItem("token");
  const isLikelyJwt = token && token.split(".").length === 3;
  if (!isLikelyJwt) {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    throw new Error("Please login first. Missing or invalid auth token.");
  }

  const res = await fetch(`${API_BASE_URL}/generate`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      prompt,
      slides: Math.max(1, Math.min(20, slides)),
      textAmount,
      tone: tone || "neutral",
      audience: audience || "auto",
      scenario: scenario || "auto",
      theme: themePayload(themeId),
      mode: "remix",
    }),
  });

  const data = await res.json();
  if (!res.ok) {
    if (res.status === 401) {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
    }
    throw new Error(data?.message || data?.error || "Failed to redesign presentation");
  }

  return data?.data || null;
}

// Redesign the whole deck. Returns normalized outline slides for all cards.
export async function remixDeck({ slides, themeId, textAmount, tone, audience, scenario }) {
  const result = await callRemix({
    slides: slides.length,
    prompt: serializeForRemix(slides),
    themeId,
    textAmount,
    tone,
    audience,
    scenario,
  });
  if (!result || !Array.isArray(result.slides)) {
    throw new Error("Redesign returned no slides.");
  }
  return normalizeRemixSlides(result.slides);
}

// Redesign a single slide. Returns one normalized outline slide.
export async function remixSlide({ slide, themeId, textAmount, tone, audience, scenario }) {
  const result = await callRemix({
    slides: 1,
    prompt: serializeForRemix([slide]),
    themeId,
    textAmount,
    tone,
    audience,
    scenario,
  });
  const [remixed] = normalizeRemixSlides(result?.slides || []);
  if (!remixed) {
    throw new Error("Redesign returned no slide.");
  }
  return remixed;
}