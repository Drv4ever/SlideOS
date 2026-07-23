export const themes = [
  {
    name: 'Microsoft Fluent',
    id: 'fluent',
    fontFamily: { heading: 'Segoe UI', body: 'Segoe UI' },
    headingWeight: 600,
    colors: {
      primary: '#0078d4',
      accent: '#ffb900',       // amber pop for stats/highlights, distinct from blue
      background: '#ffffff',
      surface: '#f3f2f1',
      border: '#e1dfdd',
      text: '#201f1e',
      textMuted: '#605e5c',
    },
  },
  {
    name: 'Dalibio',
    id: 'dalibio',
    fontFamily: { heading: 'Inter', body: 'Inter' },
    headingWeight: 700,
    colors: {
      primary: '#c2410c',
      accent: '#22d3ee',       // cyan pop, real hue contrast vs indigo primary
      background: '#ffffff',
      surface: '#f5f5ff',
      border: '#e0e0f5',
      text: '#1e1b4b',
      textMuted: '#6b6b9a',
    },
  },
  {
    name: 'Noir',
    id: 'noir',
    fontFamily: { heading: 'Space Grotesk', body: 'Inter' },
    headingWeight: 700,
    colors: {
      primary: '#18181b',
      accent: '#facc15',       // yellow pop against near-black/white, high contrast
      background: '#ffffff',
      surface: '#f4f4f5',
      border: '#e4e4e7',
      text: '#09090b',
      textMuted: '#71717a',
    },
  },
  {
    name: 'Terra',
    id: 'terra',
    fontFamily: { heading: 'Poppins', body: 'Source Sans Pro' },
    headingWeight: 600,
    colors: {
      primary: '#b45309',       // warm amber/clay — real warm tone, not another purple
      accent: '#0d9488',        // teal pop, complementary contrast
      background: '#fffbf5',
      surface: '#fef3e2',
      border: '#f3dfc2',
      text: '#451a03',
      textMuted: '#92662f',
    },
  },
  {
    name: 'Indigo',
    id: 'indigo',
    fontFamily: { heading: 'Poppins', body: 'Source Sans Pro' },
    headingWeight: 600,
    colors: {
      primary: '#ea580c',
      accent: '#f43f5e',        // rose pop, distinct from indigo
      background: '#ffffff',
      surface: '#eef2ff',
      border: '#dce2fb',
      text: '#7c2d12',
      textMuted: '#6366a3',
    },
  },
  {
    name: 'Orbit',
    id: 'orbit',
    fontFamily: { heading: 'Space Grotesk', body: 'IBM Plex Sans' },
    headingWeight: 700,
    colors: {
      primary: '#7c3aed',
      accent: '#34d399',        // emerald pop, complementary to violet
      background: '#ffffff',
      surface: '#f5f3ff',
      border: '#e4defc',
      text: '#2e1065',
      textMuted: '#7c6a9e',
    },
  },
  {
    name: 'Midnight',
    id: 'midnight',
    fontFamily: { heading: 'Space Grotesk', body: 'IBM Plex Sans' },
    headingWeight: 700,
    colors: {
      primary: '#f8fafc',       // light text/headings on dark bg
      accent: '#22d3ee',        // cyan pop, glows on dark
      background: '#0f172a',    // true dark theme — the variety your set was missing
      surface: '#1e293b',
      border: '#334155',
      text: '#e2e8f0',
      textMuted: '#94a3b8',
    },
  },
];

export const CURATED_LOOKUP = Object.fromEntries(
  themes.map((t) => [
    t.id,
    { name: t.name, colors: t.colors, fontFamily: t.fontFamily, headingWeight: t.headingWeight },
  ])
);
