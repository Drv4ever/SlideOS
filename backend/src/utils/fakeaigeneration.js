import { THEME_CATALOG } from "./themeBrief.js";

const IMAGE_KEYWORDS = [
  "professional workspace", "data analytics dashboard", "team collaboration",
  "innovation lightbulb", "growth chart upward", "digital transformation",
  "global network", "future technology", "strategic planning",
  "sustainable energy", "abstract geometry", "creative brainstorming"
];

// Theme-appropriate visual keywords so the fallback generator still reflects
// the selected theme's mood in its image choices.
const THEME_VISUALS = {
  cornflower: ["clean tech office", "blue abstract waves", "cloud computing"],
  cosmos: ["purple nebula", "creative studio lights", "golden geometric"],
  fluent: ["minimal product mockup", "crisp interface design", "modern office"],
  dalibio: ["art gallery", "editorial studio", "elegant serif print"],
  noir: ["high contrast portrait", "monochrome cityscape", "black gold texture"],
  terra: ["earthy landscapes", "warm wooden textures", "natural materials"],
  indigo: ["vibrant startup office", "orange gradient abstract", "energetic team"],
  orbit: ["futuristic space tech", "neon green circuits", "orbit rings"],
  midnight: ["dark night skyline", "moonlit ocean", "dark premium glass"],
  cursive: ["handwritten notes", "notebook paper", "colored pencils"],
  brush: ["paint brushes", "watercolor splash", "craft workshop"],
  handwritten: ["journal writing", "warm storybook scene", "personal letter"],
};

const LAYOUTS = ["title-slide", "bullets-image", "two-column", "section-divider", "bullets-image", "big-stat", "content-only", "bullets-image"];

function themeIdOf(theme) {
  if (!theme) return null;
  if (typeof theme === "string") return theme;
  return theme.id || null;
}

// Derive a short, readable label from the user's topic so fallback decks at
// least reference the actual subject instead of looking like a generic stub.
function topicLabelOf(prompt, maxWords = 5) {
  if (!prompt || typeof prompt !== "string") return "the topic";
  const words = prompt
    .replace(/[^a-zA-Z0-9\s-]/g, " ")
    .split(/\s+/)
    .filter(Boolean);
  if (!words.length) return "the topic";
  const label = words.slice(0, maxWords).join(" ");
  return label.charAt(0).toUpperCase() + label.slice(1);
}

export function fakeAIGenerate({ audience ,prompt,scenario, slides, textAmount, theme , tone }) {
    const topicLabel = topicLabelOf(prompt);
    const slideTemplates = [
        `Introduction to ${topicLabel}`,
        `Historical Context and Evolution of ${topicLabel}`,
        "Technical Fundamentals and Core Architecture",
        "Practical Methodologies and Workflows",
        "Key Challenges, Risks and Mitigations",
        `Strategic Advantages of ${topicLabel}`,
        "Future Outlook, Trends and Scale",
        "Summary, Takeaways and Next Steps",
    ];

    const pointsPerSlideMap = {
        minimal: 2,
        concise: 3,
        detailed: 4,
        extensive: 5,
    };
    const pointsPerSlide = pointsPerSlideMap[textAmount] || 3;

    const detailedPhrases = [
        `Analyzing the foundational building blocks of ${topicLabel} to establish a framework for scale and long-term viability.`,
        `Addressing standard industry pain points by comparing existing approaches against new models built around ${topicLabel}.`,
        `Reviewing critical case studies, implementation templates, and standard workflows used by early adopters.`,
        `Identifying common anti-patterns, potential roadblocks, and strategic mitigations when scaling ${topicLabel}.`,
        `Measuring performance metrics, operational efficiency, and ROI indicators across diverse scenarios.`,
        `Leveraging best practices and technical specifications to configure environments for optimal speed and security.`,
    ];

    const themeId = themeIdOf(theme);
    const themeVisuals = THEME_VISUALS[themeId] || IMAGE_KEYWORDS;
    const themeName = THEME_CATALOG[themeId]?.name || (typeof theme === "object" ? theme?.name : null) || themeId || "SlideOS";

    const generatedSlides = Array.from({ length: slides }, (_, i) => {
        const title = slideTemplates[i] || `${topicLabel} Analysis - Part ${i + 1}`;
        return {
            slideNumber: i + 1,
            heading: title,
            content: Array.from({ length: pointsPerSlide }, (_, j) => {
                const phraseIndex = (i + j) % detailedPhrases.length;
                return detailedPhrases[phraseIndex];
            }),
            imageKeyword: themeVisuals[i % themeVisuals.length],
            layout: LAYOUTS[i % LAYOUTS.length],
        };
    });

    return {
        title: prompt,
        theme: themeId || themeName,
        slides: generatedSlides,
        fallback: true,
    };
}