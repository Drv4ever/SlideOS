import { ThemeToggle } from "./theme-toggle";

export function Navbar() {
  return (
    <nav 
      style={{ 
        position: 'fixed', 
        top: 0, 
        left: 0,
        right: 0,
        zIndex: 100,
        backgroundColor: 'hsl(var(--background) / 0.95)',
        backdropFilter: 'blur(12px)',
        WebkitBackdropFilter: 'blur(12px)',
      }}
      className="border-b border-border/40"
    >
      <div className="max-w-7xl mx-auto flex items-center justify-between px-6 py-5">
        {/* Logo */}
        <div className="text-3xl font-extrabold font-serif" style={{ fontWeight: 800 }}>SlideOS</div>

        {/* Links container */}
        <div className="flex justify-between w-2/5 min-w-[300px] max-w-[500px] text-sm text-muted-foreground">
          <a href="#features" className="text-foreground no-underline hover:text-primary/70 transition-colors hover:scale-105">
            Features
          </a>
          <a href="#community" className="text-foreground no-underline hover:text-primary/70 transition-colors hover:scale-105">
            Community
          </a>
          <a href="#demo" className="text-foreground no-underline hover:text-primary/70 transition-colors hover:scale-105">
            Demo
          </a>
          <a href="#pricing" className="text-foreground no-underline hover:text-primary/70 transition-colors hover:scale-105">
            Pricing
          </a>
        </div>

        {/* Theme toggle */}
        <ThemeToggle />
      </div>
    </nav>
  );
}