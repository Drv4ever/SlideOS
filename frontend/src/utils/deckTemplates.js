// Seeded template decks in the canonical outline shape the design engine renders
// (same shape the LLM returns: heading + content[] + layout). "Use template"
// constructs a deck directly from these — no LLM round-trip needed.
//
// Layouts must match the computeSlideLayout builder registry:
// "title-slide" | "section-divider" | "big-stat" | "two-column" | "modern" | "content-only"

const layout = {
  title: "title-slide",
  divider: "section-divider",
  stat: "big-stat",
  columns: "two-column",
  cards: "modern",
  content: "content-only",
};

export const DECK_TEMPLATES = [
  {
    id: "pitch-deck",
    name: "Startup Pitch Deck",
    category: "Pitch",
    description: "Investor-ready story arc: problem, solution, market, traction.",
    themeId: "orbit",
    textAmount: "concise",
    tone: "enthusiastic",
    scenario: "pitch",
    audience: "investors",
    slides: [
      { heading: "Reimagining how teams ship software", content: ["A bold thesis for the next chapter"], layout: layout.title, imageKeyword: "abstract startup growth" },
      { heading: "The Problem", content: ["Teams lose weeks coordinating releases", "Tooling is fragmented and manual", "The cost of context switching is compounding"], layout: layout.content },
      { heading: "Our Solution", content: ["One platform, end to end", "Automation replaces busywork", "Built for teams that move fast"], layout: layout.cards },
      { heading: "Market Opportunity", content: ["$40B addressable market", "3x growth in adjacent spend", "Clear path to category leadership"], layout: layout.stat, imageKeyword: "growing market chart" },
      { heading: "Traction & Roadmap", content: ["120% QoQ revenue growth", "Enterprise design partners onboard", "Two flagship launches next year"], layout: layout.columns },
      { heading: "Why Now", content: ["The shift to AI-native workflows", "Customers asking for this daily", "First-mover advantage is real"], layout: layout.divider, imageKeyword: "future technology horizon" },
      { heading: "The Ask", content: ["Raising a $5M seed round", "Deploying capital into product & go-to-market", "Join us in shaping the future"], layout: layout.content },
    ],
  },
  {
    id: "product-launch",
    name: "Product Launch",
    category: "Marketing",
    description: "Hype-building launch narrative for a new product or feature.",
    themeId: "cosmos",
    textAmount: "concise",
    tone: "enthusiastic",
    scenario: "presentation",
    audience: "general",
    slides: [
      { heading: "Introducing something new", content: ["The product the world has been waiting for"], layout: layout.title, imageKeyword: "product reveal spotlight" },
      { heading: "Why Now", content: ["Customer demand is at an all-time high", "Technology has finally caught up", "The market is ready for change"], layout: layout.content },
      { heading: "What It Does", content: ["Delivers the core promise faster", "Removes the friction of the old way", "Works out of the box for everyone"], layout: layout.cards },
      { heading: "The Launch Plan", content: ["Teaser campaign begins this month", "Press and influencer partners secured", "Community beta opening soon"], layout: layout.columns },
      { heading: "Launch Day", content: ["Mark your calendars", "Sign up for early access today"], layout: layout.stat, imageKeyword: "launch event celebration" },
    ],
  },
  {
    id: "training-lesson",
    name: "Training Workshop",
    category: "Education",
    description: "Structured lesson flow with objectives, concepts, and practice.",
    themeId: "cornflower",
    textAmount: "detailed",
    tone: "professional",
    scenario: "training",
    audience: "students",
    slides: [
      { heading: "Mastering the fundamentals", content: ["Workshop objectives and what you will learn"], layout: layout.title, imageKeyword: "students in classroom" },
      { heading: "Lesson Objectives", content: ["Understand the core concepts", "Apply techniques to real examples", "Practice with guided exercises"], layout: layout.content },
      { heading: "Core Concept 1", content: ["The principle explained simply", "Why it matters in practice", "Common pitfalls to avoid"], layout: layout.cards },
      { heading: "Guided Practice", content: ["Work through the worked example", "Compare your approach", "Ask questions as we go"], layout: layout.columns },
      { heading: "Key Takeaway", content: ["Mastery comes from deliberate practice"], layout: layout.stat, imageKeyword: "learning progress concept" },
      { heading: "Next Steps", content: ["Complete the homework assignment", "Join next week's session", "Review the reading list"], layout: layout.content },
    ],
  },
  {
    id: "onboarding-guide",
    name: "Onboarding Guide",
    category: "Onboarding",
    description: "Welcome new team members with a clear first-week roadmap.",
    themeId: "fluent",
    textAmount: "concise",
    tone: "casual",
    scenario: "presentation",
    audience: "general",
    slides: [
      { heading: "Welcome to the team", content: ["Your first week, demystified"], layout: layout.title, imageKeyword: "welcome team hands together" },
      { heading: "Who We Are", content: ["Our mission and values", "How we work together", "Where you fit in"], layout: layout.content },
      { heading: "Your First Week", content: ["Day 1: Setup and introductions", "Day 2-3: Core training", "Day 4-5: First real task"], layout: layout.cards },
      { heading: "Tools & Access", content: ["Set up accounts and permissions", "Join the key channels", "Bookmark the handbook"], layout: layout.columns },
      { heading: "Who to Ask", content: ["Your onboarding buddy is here for you"], layout: layout.stat, imageKeyword: "friendly mentor guidance" },
      { heading: "You've Got This", content: ["One step at a time", "Questions are always welcome"], layout: layout.content },
    ],
  },
  {
    id: "brand-strategy",
    name: "Brand Strategy",
    category: "Marketing",
    description: "Positioning, messaging pillars, and go-to-market story.",
    themeId: "indigo",
    textAmount: "detailed",
    tone: "professional",
    scenario: "pitch",
    audience: "executives",
    slides: [
      { heading: "Building a brand people remember", content: ["Strategy, story, and systems"], layout: layout.title, imageKeyword: "brand identity design" },
      { heading: "Positioning", content: ["Own a clear, defensible space", "Speak to one core audience", "Differentiate on one bold promise"], layout: layout.content },
      { heading: "Messaging Pillars", content: ["Pillar 1: The problem we kill", "Pillar 2: The outcome we deliver", "Pillar 3: The proof we stand on"], layout: layout.cards },
      { heading: "Voice & Visuals", content: ["A tone that feels unmistakably ours", "A visual system that scales", "Guidelines everyone can follow"], layout: layout.columns },
      { heading: "The North Star", content: ["One brand. One promise. Every touchpoint."], layout: layout.stat, imageKeyword: "brand star concept" },
    ],
  },
  {
    id: "research-report",
    name: "Research Report",
    category: "Report",
    description: "Data-forward summary of findings, insights, and recommendations.",
    themeId: "noir",
    textAmount: "extensive",
    tone: "professional",
    scenario: "presentation",
    audience: "technical",
    slides: [
      { heading: "Research report: key findings", content: ["What we studied and why it matters"], layout: layout.title, imageKeyword: "research laboratory analysis" },
      { heading: "Methodology", content: ["Sample size and demographics", "Data collection approach", "Analysis and validation"], layout: layout.content },
      { heading: "Headline Finding", content: ["The single most important result", "Magnitude and significance", "What surprised us most"], layout: layout.stat, imageKeyword: "data insight highlight" },
      { heading: "Supporting Evidence", content: ["Finding 1 with data", "Finding 2 with data", "Finding 3 with data"], layout: layout.cards },
      { heading: "Limitations", content: ["Sample constraints", "Confounding factors", "Opportunities for follow-up"], layout: layout.columns },
      { heading: "Recommendations", content: ["Act on the headline finding first", "Investigate the open questions", "Track progress against baselines"], layout: layout.content },
    ],
  },
  {
    id: "team-kickoff",
    name: "Team Kickoff",
    category: "Onboarding",
    description: "Set the tone for a project with goals, roles, and milestones.",
    themeId: "midnight",
    textAmount: "concise",
    tone: "casual",
    scenario: "training",
    audience: "general",
    slides: [
      { heading: "Kicking off a great quarter", content: ["Goals, roles, and the plan ahead"], layout: layout.title, imageKeyword: "team kickoff meeting" },
      { heading: "Our Goal", content: ["One shared outcome", "Measurable success criteria", "A timeline we commit to"], layout: layout.content },
      { heading: "Who's Doing What", content: ["Owner: leading the effort", "Design: shaping the experience", "Engineering: building it", "Research: validating it"], layout: layout.cards },
      { heading: "Milestones", content: ["Week 2: Direction locked", "Week 4: First working version", "Week 8: Launch ready"], layout: layout.columns },
      { heading: "How We'll Win", content: ["Focus, feedback, and shipping"], layout: layout.stat, imageKeyword: "team achieving goal" },
    ],
  },
];

// Author a template deck into the {slides, theme, ...} shape the preview expects.
export function templateToDeck(template) {
  return {
    title: template.name,
    theme: template.themeId,
    slidesCount: template.slides.length,
    content: {
      slides: template.slides,
      editorSlides: template.slides,
      slideNotes: [],
      textAmount: template.textAmount,
    },
    presentation: {
      slides: template.slides,
      title: template.name,
    },
  };
}