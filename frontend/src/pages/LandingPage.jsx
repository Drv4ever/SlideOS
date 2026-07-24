import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Sparkles, 
  ArrowRight, 
  Play, 
  Layout, 
  Layers, 
  ShieldCheck, 
  Star,
  X,
  Palette,
  SlidersHorizontal
} from 'lucide-react';
import { AuthForm } from '../components/AuthForm';

export default function LandingPage({ onAuthSuccess, theme }) {
  const [promptText, setPromptText] = useState('');
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authTab, setAuthTab] = useState('login'); // 'login' or 'register'
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Mock Slide Slide Show State
  const [activeMockIndex, setActiveMockIndex] = useState(0);
  const mockSlides = [
    {
      title: "Structure Effortlessly",
      body: "Let LLMs do the heavy lifting of researching, organizing, and outlining your key concepts.",
      color: "from-orange-600 to-cyan-400",
      accent: "stripe"
    },
    {
      title: "Microsoft Fluent Design",
      body: "Enjoy stunning master slide styling with gradient waves and clean Segoe UI alignments.",
      color: "from-purple-500 to-orange-500",
      accent: "fluent"
    },
    {
      title: "Interactive Workspace",
      body: "Fine-tune elements inside a flexible drafting table. Drag, edit text, and present in full screen.",
      color: "from-pink-500 to-rose-500",
      accent: "card"
    }
  ];

  // Rotate mock slides automatically
  useEffect(() => {
    const interval = setInterval(() => {
      setActiveMockIndex((prev) => (prev + 1) % mockSlides.length);
    }, 4500);
    return () => clearInterval(interval);
  }, []);

  const handleStartGenerate = (e) => {
    e.preventDefault();
    if (!promptText.trim()) return;
    setIsSubmitting(true);
    setShowAuthModal(true);
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col justify-between font-sans relative overflow-hidden select-none font-jakarta">
      
      {/* Dynamic Font Styling Imports */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Caveat:wght@600;700&family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');
        .font-cursive {
          font-family: 'Caveat', cursive;
        }
        .font-jakarta {
          font-family: 'Plus Jakarta Sans', sans-serif;
        }
      `}</style>

      {/* Ambient glow mesh backdrops */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-orange-500/10 rounded-full blur-3xl pointer-events-none -z-10" />
      <div className="absolute bottom-12 right-1/4 w-[500px] h-[500px] bg-orange-500/5 rounded-full blur-3xl pointer-events-none -z-10" />

      {/* 1. Header Navigation Bar */}
      <header className="sticky top-0 z-50 w-full bg-slate-950/90 backdrop-blur-sm border-b border-slate-800/60">
      <div className="w-full max-w-6xl mx-auto px-6 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-6 h-6 rounded-full bg-orange-600 flex items-center justify-center shadow-sm">
            <div className="w-3 h-3 rounded-full bg-white" />
          </div>
          <span className="font-extrabold text-xl text-slate-100 tracking-tight">
            SlideOS
          </span>
        </div>

        <div className="flex items-center gap-4">
          <button 
            onClick={() => {
              setAuthTab('login');
              setShowAuthModal(true);
            }}
            className="text-sm font-bold text-slate-400 hover:text-slate-100 transition-colors cursor-pointer bg-transparent border-0 outline-none"
          >
            Sign In
          </button>
          
          <button 
            onClick={() => {
              setAuthTab('register');
              setShowAuthModal(true);
            }}
            className="bg-orange-600 hover:bg-orange-700 text-white text-xs font-bold px-4 py-2 rounded-xl transition-all cursor-pointer shadow-xs border-t border-white/20 border-x border-white/10"
          >
            Get Started
          </button>
        </div>
      </div>
      </header>

      {/* 2. Hero Section */}
      <main className="flex-1 w-full max-w-6xl mx-auto px-6 pb-12 md:pb-20 pt-8 flex flex-col lg:flex-row items-center gap-16 relative z-10 justify-center">
        
        {/* Left Side Hero Copy */}
        <div className="flex-1 flex flex-col text-left gap-6 lg:max-w-xl">
          
          {/* Release Badge */}
          <div className="inline-flex items-center gap-2 bg-orange-500/20 border border-orange-500/30 text-orange-400 rounded-full py-1.5 px-4 w-fit shadow-2xs">
            <Sparkles className="w-3.5 h-3.5" />
            <span className="text-[10px] font-bold uppercase tracking-wider">Next-Gen Presentation Engine</span>
          </div>

          {/* Hero Headings with Cursive accents */}
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight text-slate-100 leading-[1.1]">
            Structure your slides{' '}
            <span className="font-cursive text-orange-600 font-medium lowercase text-[1.15em] relative inline-block pr-1">
              beautifully
            </span>{' '}
            in seconds.
          </h1>

          <p className="text-sm sm:text-base text-slate-400 font-medium leading-relaxed max-w-md">
            Tell SlideOS your topic, choose a curated style, and get a fully formatted presentation deck.
            <br className="hidden sm:block" />
            Ready to edit, present, or export.
          </p>

          {/* Interactive Spotlight Prompt input */}
          <form 
            onSubmit={handleStartGenerate}
            className="w-full bg-slate-950 border border-slate-700 rounded-2xl p-2 flex items-center shadow-[0_20px_48px_-12px_rgba(0,0,0,0.3),0_4px_16px_rgba(0,0,0,0.1)] focus-within:border-orange-500/80 focus-within:shadow-[0_20px_48px_-12px_rgba(234,88,12,0.3)] transition-all"
          >
            <input
              type="text"
              value={promptText}
              onChange={(e) => setPromptText(e.target.value)}
              placeholder="e.g. History of Space Exploration..."
              aria-label="Presentation topic"
              required
              minLength={2}
              className="flex-1 bg-transparent border-0 px-3 text-slate-100 placeholder-slate-500 outline-none text-sm font-medium"
            />
            <button
              type="submit"
              disabled={!promptText.trim() || isSubmitting}
              className="bg-orange-600 hover:bg-orange-700 text-white font-bold text-xs py-2.5 px-5 rounded-xl transition-all cursor-pointer flex items-center gap-1.5 shadow-sm border-t border-white/20 border-x border-white/10 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? (
                <span>Please wait...</span>
              ) : (
                <>
                  <span>Generate Deck</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </>
              )}
            </button>
          </form>

          {/* Core highlights */}
          <div className="flex items-center gap-6 mt-2 text-slate-500 text-xs font-bold uppercase tracking-wider">
            <div className="flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-orange-500" />
              <span>No CC Required</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Star className="w-4 h-4 text-amber-500 fill-current" />
              <span>Microsoft Fluent Themes</span>
            </div>
          </div>
        </div>

        {/* Right Side Visual Deck Mockup Preview */}
        <div className="flex-1 w-full max-w-lg lg:max-w-none relative flex justify-center">
          
          {/* Card backdrop glowing rings */}
          <div className="absolute inset-0 bg-gradient-to-r from-orange-500/10 to-cyan-500/10 blur-3xl rounded-full scale-110 pointer-events-none" />

          {/* The visual deck screen */}
          <div className="w-full max-w-md aspect-video bg-slate-950 rounded-2xl shadow-[0_32px_80px_rgba(0,0,0,0.35)] border border-slate-700/80 p-5 flex flex-col justify-between relative overflow-hidden group select-none">
            
            {/* Interactive master slide design elements */}
            {mockSlides[activeMockIndex].accent === "fluent" && (
              <>
                <div className="absolute -top-12 -right-12 w-48 h-48 rounded-full bg-gradient-to-br from-cyan-400/20 to-orange-600/20 blur-xl pointer-events-none z-0" />
                <div className="absolute -bottom-16 -left-16 w-60 h-60 rounded-full bg-gradient-to-tr from-purple-500/10 to-orange-500/10 blur-xl pointer-events-none z-0" />
                <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-orange-600 to-cyan-400 pointer-events-none z-0" />
              </>
            )}

            {mockSlides[activeMockIndex].accent === "stripe" && (
              <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-orange-600 to-cyan-400 pointer-events-none z-0" />
            )}

            {mockSlides[activeMockIndex].accent === "card" && (
              <div className="absolute inset-4 rounded-xl border border-white/10 bg-slate-800/60 z-0 pointer-events-none shadow-2xs" />
            )}

            {/* Slide Header preview */}
            <div className="flex items-center justify-between border-b border-slate-800/50 pb-3 relative z-10">
              <span className="text-[9px] font-extrabold text-orange-600 uppercase tracking-widest">
                SLIDE {(activeMockIndex + 1).toString().padStart(2, '0')} OF 03
              </span>
              <div className="flex gap-1">
                <div className="w-2.5 h-2.5 rounded-full bg-red-400/40" />
                <div className="w-2.5 h-2.5 rounded-full bg-amber-400/40" />
                <div className="w-2.5 h-2.5 rounded-full bg-emerald-400/40" />
              </div>
            </div>

            {/* Slide content preview */}
            <div className="my-auto flex flex-col gap-2 relative z-10 text-left">
              <h3 className="text-xl font-bold text-slate-100 tracking-tight font-sans">
                {mockSlides[activeMockIndex].title}
              </h3>
              <p className="text-xs text-slate-400 font-medium leading-relaxed max-w-sm">
                {mockSlides[activeMockIndex].body}
              </p>
            </div>

            {/* Slide footer preview */}
            <div className="flex items-center justify-between pt-3 border-t border-slate-800/50 relative z-10">
              <span className="text-[8px] font-bold text-slate-500 uppercase tracking-wider">SlideOS Core Visuals</span>

              {/* Play demo badge */}
              <div className="flex items-center gap-1.5 bg-slate-950 px-2 py-1 rounded-lg border border-slate-700 text-[8px] font-bold text-slate-300 uppercase">
                <span className="w-1.5 h-1.5 rounded-full bg-orange-600 animate-pulse" />
                <span>Auto Play</span>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* 3. Footer branding details */}
      <footer className="w-full py-6 border-t border-slate-800/60 bg-slate-950/60 relative z-10">
        <div className="max-w-6xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-4 text-xs font-semibold text-slate-500">
          <span>&copy; 2026 SlideOS Presentation builder. All rights reserved.</span>
          <div className="flex gap-4">
            <a href="#" className="hover:text-slate-300 transition-colors">Privacy Policy</a>
            <a href="#" className="hover:text-slate-300 transition-colors">Terms of Service</a>
          </div>
        </div>
      </footer>

      {/* 4. Floating glassmorphic authentication modal */}
      <AnimatePresence>
        {showAuthModal && (
          <div className="fixed inset-0 z-999 flex items-center justify-center p-4">
            
            {/* Dark glass overlay backdrop */}
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => { setShowAuthModal(false); setIsSubmitting(false); }}
              className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            />

            {/* Modal Card content */}
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              transition={{ duration: 0.25 }}
              className="relative w-full max-w-md bg-slate-950/95 backdrop-blur-md rounded-2xl shadow-[0_30px_90px_rgba(0,0,0,0.4)] border border-slate-800 overflow-hidden flex flex-col p-6 text-center select-none"
            >
              {/* Close Button */}
              <button 
                onClick={() => { setShowAuthModal(false); setIsSubmitting(false); }}
                aria-label="Close authentication dialog"
                className="absolute top-4 right-4 text-slate-500 hover:text-slate-100 transition-colors cursor-pointer bg-transparent border-0 outline-none"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="mb-4">
                <div className="w-9 h-9 rounded-xl bg-orange-500/20 border border-orange-500/30 text-orange-400 flex items-center justify-center mx-auto mb-3 shadow-xs">
                  <Sparkles className="w-5 h-5" />
                </div>
                <h3 className="text-lg font-bold text-slate-100">
                  {authTab === 'login' ? 'Sign in to SlideOS' : 'Create your account'}
                </h3>
                <span className="text-xs text-slate-500 font-medium">
                  {authTab === 'login' ? "Access your outlines and build presentations" : "Start structuring decks with AI tools"}
                </span>
              </div>

              {/* Injected AuthForm */}
              <div className="text-left">
                <AuthForm 
                  onAuthSuccess={() => {
                    setShowAuthModal(false);
                    onAuthSuccess();
                  }}
                  theme={theme}
                  isModal={true}
                />
              </div>

              {/* Footer Switch Tab link */}
              <div className="mt-4 pt-3 border-t border-slate-800 text-xs font-semibold text-slate-400">
                {authTab === 'login' ? (
                  <span>
                    New to SlideOS?{' '}
                    <button 
                      onClick={() => setAuthTab('register')}
                      className="text-orange-600 hover:underline cursor-pointer bg-transparent border-0 p-0 outline-none font-bold"
                    >
                      Sign Up
                    </button>
                  </span>
                ) : (
                  <span>
                    Already have an account?{' '}
                    <button 
                      onClick={() => setAuthTab('login')}
                      className="text-orange-600 hover:underline cursor-pointer bg-transparent border-0 p-0 outline-none font-bold"
                    >
                      Login
                    </button>
                  </span>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
