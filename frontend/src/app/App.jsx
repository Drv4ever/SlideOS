import { ThemeProvider } from './components/ThemeProvider.jsx';
import { Header } from './components/Header.jsx';
import { PresentationGenerator } from './components/PresentationGenerator.jsx';
import { Footer } from './components/Footer.jsx';
import { useState } from 'react';
import { Routes, Route, useLocation } from "react-router-dom";
import PresentationPreview from './PresentationPreview.jsx'; // for routing purpose
import PresentationView from './PresentationView.jsx';

export default function App() {
  const location = useLocation();
  const isPresentationRoute = location.pathname === "/presentation-view";

  const [presentationTheme, setPresentationTheme] = useState({
    colors: {
      primary: '#6366f1',
      secondary: '#a5b4fc',
      background: '#eef2ff',
      text: '#312e81'
    },
    fonts: {
      heading: 'Poppins',
      body: 'Source Sans Pro'
    }
  });

  return (
    <ThemeProvider>
      <div 
        className="min-h-screen transition-all duration-500 flex flex-col"
        style={{
          backgroundColor: presentationTheme.colors.background,
          fontFamily: `${presentationTheme.fonts.body}, sans-serif`,
          color: presentationTheme.colors.text,
        }}
      >
        {!isPresentationRoute && <Header themeColors={presentationTheme.colors} />}

        <main className="flex-1">
          {/*  ROUTES GO HERE */}
          <Routes>
            <Route 
              path="/" 
              element={
                <PresentationGenerator 
                  onThemeChange={setPresentationTheme} 
                />
              } 
            />

            <Route 
              path="/preview" 
              element={<PresentationPreview />} 
            />

            <Route 
            path="presentation-view" 
            element={<PresentationView/>}/>
          </Routes>
        </main>

        {!isPresentationRoute && <Footer themeColors={presentationTheme.colors} />}
      </div>
    </ThemeProvider>
  );
}
