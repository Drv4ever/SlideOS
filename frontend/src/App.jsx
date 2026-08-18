import { Header } from './components/Header.jsx';
import { Footer } from './components/Footer.jsx';
import { useState, lazy, Suspense } from 'react';
import { Routes, Route, useLocation } from "react-router-dom";
import { ErrorBoundary } from './components/ErrorBoundary.jsx';
import { AuthForm } from './components/AuthForm.jsx';

const PresentationGenerator = lazy(() =>
  import('./components/PresentationGenerator.jsx').then((m) => ({
    default: m.PresentationGenerator,
  }))
);
const PresentationPreview = lazy(() => import('./pages/PresentationPreview.jsx'));
const PresentationView = lazy(() => import('./pages/PresentationView.jsx'));
const MyPresentations = lazy(() => import('./pages/MyPresentations.jsx'));
const LandingPage = lazy(() => import('./pages/LandingPage.jsx'));
const ShareView = lazy(() => import('./pages/ShareView.jsx'));

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

import { SidebarProvider, SidebarTrigger } from './components/ui/sidebar.jsx';
import { AppSidebar } from './components/AppSidebar.jsx';
import { themes } from './utils/themes';

const DEFAULT_THEME =
  themes.find((t) => t.id === 'cornflower') || themes[0];

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(
    () => getStoredToken() !== null
  );
  const location = useLocation();

  const isPresentationRoute = location.pathname.includes("presentation-view");

  const [presentationTheme, setPresentationTheme] = useState({
    name: DEFAULT_THEME?.name || 'Cornflower Blue',
    colors: DEFAULT_THEME?.colors || {},
    fontFamily: DEFAULT_THEME?.fontFamily || {
      heading: 'Space Grotesk',
      body: 'DM Sans'
    }
  });

  const handleAuthSuccess = () => {
    setIsAuthenticated(true);
  };

  const handleThemeChange = (nextTheme) => {
    setPresentationTheme({
      name: nextTheme?.name || presentationTheme.name,
      colors: nextTheme?.colors || presentationTheme.colors,
      fontFamily: nextTheme?.fontFamily || nextTheme?.fonts || presentationTheme.fontFamily,
    });
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setIsAuthenticated(false);
  };

  const mainContent = (
    <Suspense
      fallback={
        <div className="flex-1 flex items-center justify-center min-h-[40vh]">
          <div className="w-8 h-8 rounded-full border-2 border-border border-t-orange-500 animate-spin" />
        </div>
      }
    >
      <Routes>
      <Route 
        path="/" 
        element={
          isAuthenticated ? (
            <PresentationGenerator 
              onThemeChange={handleThemeChange} 
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
        element={
          isAuthenticated ? (
            <PresentationPreview />
          ) : (
            <AuthForm
              onAuthSuccess={handleAuthSuccess}
              theme={presentationTheme}
            />
          )
        }
      />

      <Route 
        path="presentation-view" 
        element={
          isAuthenticated ? (
            <PresentationView/>
          ) : (
            <AuthForm
              onAuthSuccess={handleAuthSuccess}
              theme={presentationTheme}
            />
          )
        }
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

      {/* Public share viewer — intentionally NOT auth-gated so anyone with a
          link can present a deck. */}
      <Route
        path="/share/:id"
        element={<ShareView />}
      />
    </Routes>
    </Suspense>
  );

  // Presentation route is fullscreen
if (isPresentationRoute) {
    return (
<ErrorBoundary>
      <div
          className="min-h-screen transition-all duration-500 bg-background"
          style={{
          fontFamily: `${presentationTheme.fontFamily?.body || 'Inter'}, sans-serif`,
          }}
        >
          {mainContent}
        </div>
      </ErrorBoundary>
    );
  }

  return (
    <ErrorBoundary>
      <div 
        className="min-h-screen transition-all duration-500 flex font-sans bg-background text-foreground"
        style={{
          fontFamily: `${presentationTheme.fontFamily?.body || 'Inter'}, sans-serif`,
        }}
      >
        {isAuthenticated ? (
          <SidebarProvider>
            <div className="print:hidden">
              <AppSidebar onLogout={handleLogout} />
            </div>
            <div className="flex flex-1 flex-col min-h-svh print:block">
              <div className="print:hidden">
                <Header
                  themeColors={presentationTheme}
                  isAuthenticated={isAuthenticated}
                />
              </div>
              <div className="flex flex-1 flex-col p-4 print:p-0">
              <div className="flex items-center gap-2 mb-2 print:hidden">
                <SidebarTrigger />
              </div>
              <main className="flex-1 overflow-y-auto bg-card rounded-2xl border border-border shadow-md p-6 md:p-8 print:overflow-visible print:bg-transparent print:border-0 print:shadow-none print:rounded-none print:p-0">
                {mainContent}
              </main>
              </div>
            </div>
          </SidebarProvider>
        ) : (
          <div className="flex-1 min-h-screen overflow-y-auto">
            <main>
              {mainContent}
            </main>
          </div>
)}
      </div>
    </ErrorBoundary>
  );
}
