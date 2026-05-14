import { ThemeProvider } from './providers/ThemeProvider.jsx';
import { Header } from './components/Header.jsx';
import { PresentationGenerator } from './components/PresentationGenerator.jsx';
import { Footer } from './components/Footer.jsx';
import { useState } from 'react';
import { Routes, Route, useLocation } from "react-router-dom";
import PresentationPreview from './pages/PresentationPreview.jsx';
import PresentationView from './pages/PresentationView.jsx';
import { AuthForm } from './components/AuthForm.jsx';
import MyPresentations from './pages/MyPresentations.jsx';

function getStoredToken() {
  const token = localStorage.getItem("token");

  if (!token) {
    return null;
  }

  const parts = token.split(".");
  if (parts.length !== 3) {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    return null;
  }

  try {
    const base64 = parts[1].replace(/-/g, "+").replace(/_/g, "/");
    const paddedBase64 = base64.padEnd(Math.ceil(base64.length / 4) * 4, "=");
    const payload = JSON.parse(atob(paddedBase64));
    if (payload?.exp && payload.exp * 1000 <= Date.now()) {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      return null;
    }
  } catch {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    return null;
  }

  return token;
}

export default function App() {
  const location = useLocation();
  const isPresentationRoute = location.pathname === "/presentation-view";
  const [isAuthenticated, setIsAuthenticated] = useState(
    Boolean(getStoredToken())
  );

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

  const handleAuthSuccess = () => {
    setIsAuthenticated(true);
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setIsAuthenticated(false);
  };

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
        {!isPresentationRoute && (
          <Header
            themeColors={presentationTheme.colors}
            isAuthenticated={isAuthenticated}
            onLogout={handleLogout}
          />
        )}

        <main className="flex-1">
          {/*  ROUTES GO HERE */}
          <Routes>
            <Route 
              path="/" 
              element={
                isAuthenticated ? (
                  <PresentationGenerator 
                    onThemeChange={setPresentationTheme} 
                  />
                ) : (
                  <AuthForm
                    onAuthSuccess={handleAuthSuccess}
                    theme={presentationTheme}
                  />
                )
              } 
            />

            <Route 
              path="/preview" 
              element={<PresentationPreview />} 
            />

            <Route 
            path="presentation-view" 
            element={<PresentationView/>}/>

            <Route
              path="/my-presentations"
              element={
                isAuthenticated ? (
                  <MyPresentations />
                ) : (
                  <AuthForm
                    onAuthSuccess={handleAuthSuccess}
                    theme={presentationTheme}
                  />
                )
              }
            />
          </Routes>
        </main>

        {!isPresentationRoute && <Footer themeColors={presentationTheme.colors} />}
      </div>
    </ThemeProvider>
  );
}
