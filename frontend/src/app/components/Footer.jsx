export function Footer({ themeColors }) {
  return (
    <footer 
      className="mt-20 transition-all duration-500"
      style={{
        borderTop: `1px solid ${themeColors?.primary}40`,
        backgroundColor: `${themeColors?.background}EE`,
      }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <p 
            className="text-sm transition-all duration-300"
            style={{ color: themeColors?.text, opacity: 0.7 }}
          >
            © 2026 SlideOS. Transform your ideas into presentations.
          </p>
          <div className="flex items-center gap-6">
            <a 
              href="#privacy" 
              className="text-sm transition-all duration-300 hover:opacity-100"
              style={{ color: themeColors?.text, opacity: 0.7 }}
            >
              Privacy
            </a>
            <a 
              href="#terms" 
              className="text-sm transition-all duration-300 hover:opacity-100"
              style={{ color: themeColors?.text, opacity: 0.7 }}
            >
              Terms
            </a>
            <a 
              href="#contact" 
              className="text-sm transition-all duration-300 hover:opacity-100"
              style={{ color: themeColors?.text, opacity: 0.7 }}
            >
              Contact
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}