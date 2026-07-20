export const themes = [
  {
    name: 'Microsoft Fluent',
    fonts: 'Segoe UI / Arial',
    id: 'fluent',
    fontFamily: { heading: 'Segoe UI', body: 'Segoe UI' },
    colors: {
      primary: '#0078d4',
      secondary: '#50e4ff',
      background: '#f3f2f1',
      text: '#201f1e'
    }
  },
  {
    name: 'Dalibio',
    fonts: 'Inter / Inter',
    id: 'dalibio',
    fontFamily: { heading: 'Inter', body: 'Inter' },
    colors: {
      primary: '#6366f1',
      secondary: '#818cf8',
      background: '#f0f4ff',
      text: '#1e1b4b'
    }
  },
  {
    name: 'Noir',
    fonts: 'Inter / Inter',
    id: 'noir',
    fontFamily: { heading: 'Inter', body: 'Inter' },
    colors: {
      primary: '#18181b',
      secondary: '#3f3f46',
      background: '#f5f5f5',
      text: '#09090b'
    }
  },
  {
    name: 'Cornflower',
    fonts: 'Poppins / Source Sans Pro',
    id: 'cornflower',
    fontFamily: { heading: 'Poppins', body: 'Source Sans Pro' },
    colors: {
      primary: '#6366f1',
      secondary: '#a5b4fc',
      background: '#eef2ff',
      text: '#312e81'
    }
  },
  {
    name: 'Indigo',
    fonts: 'Poppins / Source Sans Pro',
    id: 'indigo',
    fontFamily: { heading: 'Poppins', body: 'Source Sans Pro' },
    colors: {
      primary: '#4f46e5',
      secondary: '#6366f1',
      background: '#e0e7ff',
      text: '#3730a3'
    }
  },
  {
    name: 'Orbit',
    fonts: 'Space Grotesk / IBM Plex Sans',
    id: 'orbit',
    fontFamily: { heading: 'Space Grotesk', body: 'IBM Plex Sans' },
    colors: {
      primary: '#8b5cf6',
      secondary: '#a78bfa',
      background: '#faf5ff',
      text: '#581c87'
    }
  },
  {
    name: 'Cosmos',
    fonts: 'Space Grotesk / IBM Plex Sans',
    id: 'cosmos',
    fontFamily: { heading: 'Space Grotesk', body: 'IBM Plex Sans' },
    colors: {
      primary: '#ec4899',
      secondary: '#f472b6',
      background: '#fdf4ff',
      text: '#831843'
    }
  },
];

export const CURATED_LOOKUP = Object.fromEntries(
  themes.map((t) => [t.id, { name: t.name, colors: t.colors, fontFamily: t.fontFamily }])
);
