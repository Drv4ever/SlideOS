const GENRE_KEYWORDS = {
  business: [
    "business", "corporate", "company", "startup", "enterprise", "strategy",
    "pitch", "revenue", "sales", "b2b", "saas", "roi", "stakeholder", "quarterly",
  ],
  finance: [
    "finance", "financial", "investment", "invest", "money", "budget", "banking",
    "stock", "crypto", "bitcoin", "trading", "economy", "economic", "fintech",
  ],
  tech: [
    "tech", "technology", "software", "app", "ai", "artificial intelligence",
    "machine learning", "data", "cloud", "cyber", "code", "programming",
    "developer", "api", "digital", "robot", "blockchain", "web3", "iot",
  ],
  creative: [
    "creative", "design", "art", "brand", "branding", "portfolio", "photography",
    "fashion", "music", "film", "movie", "aesthetic", "illustration", "studio",
  ],
  education: [
    "education", "learning", "school", "student", "teach", "course", "training",
    "workshop", "lesson", "academic", "university", "college", "study", "class",
  ],
  science: [
    "science", "scientific", "research", "biology", "chemistry", "physics",
    "space", "astronomy", "climate", "environment", "experiment", "lab", "quantum",
  ],
  health: [
    "health", "medical", "medicine", "fitness", "wellness", "hospital", "doctor",
    "nutrition", "mental", "healthcare", "therapy", "disease", "diet", "yoga",
  ],
  marketing: [
    "marketing", "advertis", "campaign", "growth", "social media", "seo",
    "content", "audience", "engagement", "funnel", "conversion", "influencer",
  ],
  nature: [
    "nature", "travel", "adventure", "wildlife", "ocean", "forest", "mountain",
    "eco", "sustainab", "green", "planet", "earth", "tourism", "outdoor",
  ],
  food: [
    "food", "recipe", "cooking", "restaurant", "cuisine", "chef", "baking",
    "coffee", "cafe", "drink", "meal", "kitchen", "dining", "culinary",
  ],
};

const GENRE_PROFILES = {
  business: { heading: "Clash Display", body: "General Sans", accent: "#1d4ed8" },
  finance: { heading: "Sora", body: "DM Sans", accent: "#047857" },
  tech: { heading: "Space Grotesk", body: "DM Sans", accent: "#7c3aed" },
  creative: { heading: "Playfair Display", body: "Outfit", accent: "#db2777" },
  education: { heading: "Outfit", body: "Source Sans 3", accent: "#0d9488" },
  science: { heading: "Cormorant Garamond", body: "DM Sans", accent: "#0891b2" },
  health: { heading: "Outfit", body: "General Sans", accent: "#059669" },
  marketing: { heading: "Sora", body: "Outfit", accent: "#ea580c" },
  nature: { heading: "Playfair Display", body: "Source Sans 3", accent: "#16a34a" },
  food: { heading: "Cormorant Garamond", body: "Outfit", accent: "#d97706" },
  default: { heading: "Clash Display", body: "DM Sans", accent: null },
};

export function detectGenre(text = "") {
  const haystack = String(text).toLowerCase();
  const scores = {};

  for (const [genre, keywords] of Object.entries(GENRE_KEYWORDS)) {
    for (const kw of keywords) {
      if (haystack.includes(kw)) {
        scores[genre] = (scores[genre] || 0) + 1;
      }
    }
  }

  const best = Object.entries(scores).sort((a, b) => b[1] - a[1])[0];
  return best ? best[0] : "default";
}

function shadeColor(hex, percent) {
  if (!hex || hex[0] !== "#" || hex.length < 7) return hex;
  const num = parseInt(hex.slice(1), 16);
  const amt = Math.round(2.55 * percent);
  const clamp = (v) => Math.min(255, Math.max(0, v));
  const r = clamp(((num >> 16) & 0xff) + amt);
  const g = clamp(((num >> 8) & 0xff) + amt);
  const b = clamp((num & 0xff) + amt);
  return `#${((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1)}`;
}

export function getSlideStyle({ topic = "", theme = {}, sizes = {} } = {}) {
  const genre = detectGenre(topic); 
  const profile = GENRE_PROFILES[genre] || GENRE_PROFILES.default;

  const themeColors = theme?.colors || {};
  const themeFonts = theme?.fontFamily || theme?.fonts || {};

  const headingColor = profile.accent || themeColors.primary || "#312e81";
  const bulletColor = themeColors.text || shadeColor(headingColor, -20) || "#334155";
  const accentColor = profile.accent || themeColors.accent || headingColor;

  const headingFont = profile.heading || themeFonts.heading || "Clash Display";
  const bodyFont = profile.body || themeFonts.body || "DM Sans";

  const baseHeading = sizes.headingSize || 34;
  const baseBullet = sizes.bulletSize || 18;

  return {
    genre,
    headingFont,
    bodyFont,
    headingColor,
    bulletColor,
    accentColor,
    headingSize: baseHeading,
    titleSlideHeadingSize: Math.round(baseHeading * 1.5),
    bulletSize: baseBullet,
    headingWeight: 800,
  };
}
