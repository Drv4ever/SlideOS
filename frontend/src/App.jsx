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
import LandingPage from './pages/LandingPage.jsx';

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
    const isExpired = payload.exp * 1000 < Date.now();
    return isExpired ? null : token;
  } catch (error) {
    return null;
  }
}

import { Sidebar } from './components/Sidebar.jsx';

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(
    () => getStoredToken() !== null
  );
  const location = useLocation();

  const isPresentationRoute = location.pathname.includes("presentation-view");

  const [presentationTheme, setPresentationTheme] = useState({
    name: 'Dalibio',
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

  const mainContent = (
    <Routes>
      <Route 
        path="/" 
        element={
          isAuthenticated ? (
            <PresentationGenerator 
              onThemeChange={setPresentationTheme} 
            />
          ) : (
            <LandingPage
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
        element={<PresentationView/>}
      />

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
  );

  // Presentation route is fullscreen
  if (isPresentationRoute) {
    return (
      <ThemeProvider>
        <div 
          className="min-h-screen transition-all duration-500"
          style={{
            backgroundColor: '#09090b', // Keep presentation view dark/cinematic
            fontFamily: `${presentationTheme.fonts.body}, sans-serif`,
          }}
        >
          {mainContent}
        </div>
      </ThemeProvider>
    );
  }

  return (
    <ThemeProvider>
      <div 
        className="min-h-screen transition-all duration-500 flex font-sans"
        style={{
          backgroundColor: '#f8fafc', // Sleek light background
          fontFamily: `${presentationTheme.fonts.body}, sans-serif`,
          color: '#0f172a',
        }}
      >
        {isAuthenticated ? (
          <div className="flex w-full h-screen overflow-hidden bg-slate-100/70 p-4 gap-4">
            <Sidebar onLogout={handleLogout} />
            <main className="flex-1 overflow-y-auto bg-white rounded-2xl border border-slate-200 shadow-md p-6 md:p-8">
              {mainContent}
            </main>
          </div>
        ) : (
          <div className="flex-1 min-h-screen overflow-y-auto">
            <main>
              {mainContent}
            </main>
          </div>
        )}
      </div>
    </ThemeProvider>
  );
}
