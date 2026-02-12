import { ThemeToggle } from "./theme-toggle";

export function Navbar() {
  return (
    <div className="fixed top-0 inset-x-0 z-50 w-full bg-background/80 backdrop-blur-xl border-b border-border/40">
      <div className="mx-auto flex items-center justify-between px-6 md:px-16 lg:px-28 xl:px-36 2xl:px-52" style={{ height: '40px' }}>
        {/* Logo */}
        <div className="font-extrabold tracking-tight font-sans select-none" style={{paddingLeft:'60px', fontSize: '30px'}}>
          SlideOS
        </div>
        
        {/* Links - Hidden on mobile */}
        <nav className=" md:flex items-center">
            <a className="text-muted-foreground hover:text-foreground cursor-pointer transition-colors" style={{ marginRight: '32px' }}>Feature</a>
          <a className="text-muted-foreground hover:text-foreground cursor-pointer transition-colors" style={{ marginRight: '32px' }}>Community</a>
          <a className="text-muted-foreground hover:text-foreground cursor-pointer transition-colors" style={{ marginRight: '32px' }}>Demo</a>
          <a className="text-muted-foreground hover:text-foreground cursor-pointer transition-colors">Pricing</a>
        </nav>
        
        {/* Theme Toggle */}
        <div className="flex items-center" style={{paddingRight:'60px'}}>
          <ThemeToggle />
        </div>
      </div>
    </div>
  );
}