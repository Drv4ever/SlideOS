import { Button } from './ui/button';
import { Link, useNavigate } from 'react-router-dom';

export function Header({ themeColors, isAuthenticated, onLogout }) {
  const navigate = useNavigate();



  return (
    <header 
      className="sticky top-0 z-50 backdrop-blur-lg transition-all duration-500"
      style={{
        borderBottom: `1px solid ${themeColors?.primary}40`,
        backgroundColor: `${themeColors?.background}CC`,
      }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center gap-12">
            <button onClick={() => navigate("/")}
              type="button"
              className="text-xl font-semibold bg-gradient-to-r bg-clip-text text-transparent transition-all duration-500 cursor-pointer"
              style={{
                backgroundImage: `linear-gradient(to right, ${themeColors?.primary}, ${themeColors?.secondary})`,
              }}
            >
              SlideOS
            </button>
            <nav className="hidden md:flex items-center gap-8">
              <a
                href="#features"
                className="text-sm transition-all duration-300 hover:opacity-70"
                style={{ color: themeColors?.text }}
              >
                Features
              </a>
              <a 
                href="#community" 
                className="text-sm transition-all duration-300 hover:opacity-70"
                style={{ color: themeColors?.text }}
              >
                Community
              </a>
              <a 
                href="#demo" 
                className="text-sm transition-all duration-300 hover:opacity-70"
                style={{ color: themeColors?.text }}
              >
                Demo
              </a>
              {isAuthenticated && (
                <Link
                  to="/my-presentations"
                  className="text-sm transition-all duration-300 hover:opacity-70"
                  style={{ color: themeColors?.text }}
                >
                  My Presentations
                </Link>
              )}
            </nav>
          </div>
          <div className="flex items-center gap-2">
            {isAuthenticated && (
              <Button
                variant="outline"
                size="sm"
                onClick={onLogout}
              >
                Logout
              </Button>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
