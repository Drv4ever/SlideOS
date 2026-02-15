import { Moon, Sun } from 'lucide-react';
import { useTheme } from './ThemeProvider';
import { Button } from './ui/button';

export function Header({ themeColors }) {
  const { theme, toggleTheme } = useTheme();

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
            <h1 
              className="text-xl font-semibold bg-gradient-to-r bg-clip-text text-transparent transition-all duration-500"
              style={{
                backgroundImage: `linear-gradient(to right, ${themeColors?.primary}, ${themeColors?.secondary})`,
              }}
            >
              SlideOS
            </h1>
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
             
            </nav>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleTheme}
            className="rounded-full transition-all duration-300"
            style={{
              color: themeColors?.text,
            }}
          >
            {theme === 'light' ? (
              <Moon className="h-5 w-5" />
            ) : (
              <Sun className="h-5 w-5" />
            )}
          </Button>
        </div>
      </div>
    </header>
  );
}