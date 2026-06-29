import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Sparkles, 
  Wand2, 
  Loader2, 
  SlidersHorizontal, 
  Palette, 
  ArrowUp, 
  Check, 
  Paperclip, 
  Image, 
  Mic, 
  Grid, 
  Layers, 
  ChevronRight, 
  ChevronLeft 
} from 'lucide-react';
import { Button } from './ui/button';
import { Label } from './ui/label';
import { Card } from './ui/card';
import { savePresentation } from '../services/presentationService';

const themes = [
  {
    name: 'Microsoft Fluent',
    fonts: 'Segoe UI / Arial',
    id: 'fluent',
    fontFamily: { heading: 'Segoe UI', body: 'Segoe UI' },
    colors: {
      primary: '#0078d4',
      secondary: '#50e4ff',
      background: '#f3f2f1',
      text: '#201f1e'
    }
  },
  {
    name: 'Dalibio',
    fonts: 'Inter / Inter',
    id: 'dalibio',
    fontFamily: { heading: 'Inter', body: 'Inter' },
    colors: {
      primary: '#6366f1',
      secondary: '#818cf8',
      background: '#f0f4ff',
      text: '#1e1b4b'
    }
  },
  {
    name: 'Noir',
    fonts: 'Inter / Inter',
    id: 'noir',
    fontFamily: { heading: 'Inter', body: 'Inter' },
    colors: {
      primary: '#18181b',
      secondary: '#3f3f46',
      background: '#f5f5f5',
      text: '#09090b'
    }
  },
  {
    name: 'Cornflower',
    fonts: 'Poppins / Source Sans Pro',
    id: 'cornflower',
    fontFamily: { heading: 'Poppins', body: 'Source Sans Pro' },
    colors: {
      primary: '#6366f1',
      secondary: '#a5b4fc',
      background: '#eef2ff',
      text: '#312e81'
    }
  },
  {
    name: 'Indigo',
    fonts: 'Poppins / Source Sans Pro',
    id: 'indigo',
    fontFamily: { heading: 'Poppins', body: 'Source Sans Pro' },
    colors: {
      primary: '#4f46e5',
      secondary: '#6366f1',
      background: '#e0e7ff',
      text: '#3730a3'
    }
  },
  {
    name: 'Orbit',
    fonts: 'Space Grotesk / IBM Plex Sans',
    id: 'orbit',
    fontFamily: { heading: 'Space Grotesk', body: 'IBM Plex Sans' },
    colors: {
      primary: '#8b5cf6',
      secondary: '#a78bfa',
      background: '#faf5ff',
      text: '#581c87'
    }
  },
  {
    name: 'Cosmos',
    fonts: 'Space Grotesk / IBM Plex Sans',
    id: 'cosmos',
    fontFamily: { heading: 'Space Grotesk', body: 'IBM Plex Sans' },
    colors: {
      primary: '#ec4899',
      secondary: '#f472b6',
      background: '#fdf4ff',
      text: '#831843'
    }
  },
];

export function PresentationGenerator({ onThemeChange }) {
  const navigate = useNavigate();
  const [prompt, setPrompt] = useState('');
  const [slides, setSlides] = useState('5');
  const [textAmount, setTextAmount] = useState('detailed');
  const [tone, setTone] = useState('auto');
  const [audience, setAudience] = useState('auto');
  const [scenario, setScenario] = useState('auto');
  const [selectedTheme, setSelectedTheme] = useState('cornflower');
  const [isGenerating, setIsGenerating] = useState(false);
  const [turboMode, setTurboMode] = useState(true);
  
  // Controls which dashboard layout is displayed:
  // 'generate' (home prompt overview), 'theme' (theme selector stack), 'layout' (options grid)
  const [activeMode, setActiveMode] = useState('generate');
  
  // Theme Selector Stack settings
  const [stackIndex, setStackIndex] = useState(2); // Start with cornflower (index 2)
  const [themeSelectorView, setThemeSelectorView] = useState('stack'); // 'stack' or 'grid'

  const promptInputRef = useRef(null);
  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api";
  const currentTheme = themes.find(t => t.id === selectedTheme);

  // Auto-focus prompt input
  useEffect(() => {
    if (promptInputRef.current) {
      promptInputRef.current.focus();
    }
  }, []);

  // Listen for reset triggers from sidebar
  useEffect(() => {
    const handleReset = () => {
      setPrompt('');
      setActiveMode('generate');
      setSlides('5');
      setTextAmount('detailed');
      setTone('auto');
      setAudience('auto');
      setScenario('auto');
      setSelectedTheme('cornflower');
    };
    window.addEventListener('reset-generator-state', handleReset);
    return () => window.removeEventListener('reset-generator-state', handleReset);
  }, []);

  // Listen for preset engine styles selected from the sidebar
  useEffect(() => {
    const handlePresetEngine = (e) => {
      const engineType = e.detail;
      if (engineType === 'cinematic') {
        setSelectedTheme('orbit');
        setTextAmount('minimal');
        setTone('enthusiastic');
        setSlides('8');
      } else if (engineType === 'poster') {
        setSelectedTheme('cosmos');
        setTextAmount('concise');
        setScenario('pitch');
        setSlides('5');
      } else if (engineType === 'realism') {
        setSelectedTheme('noir');
        setTextAmount('minimal');
        setTone('professional');
        setSlides('10');
      }
      // Focus prompt and go to generate view
      setActiveMode('generate');
      if (promptInputRef.current) {
        promptInputRef.current.focus();
      }
    };
    window.addEventListener('select-preset-engine', handlePresetEngine);
    return () => window.removeEventListener('select-preset-engine', handlePresetEngine);
  }, []);

  const handleThemeChange = (themeId) => {
    setSelectedTheme(themeId);
    const theme = themes.find(t => t.id === themeId);
    if (theme && onThemeChange) {
      onThemeChange({
        colors: theme.colors,
        fonts: theme.fontFamily
      });
    }
  };

  const cycleThemeStack = (direction = 1) => {
    let nextIndex = stackIndex + direction;
    if (nextIndex >= themes.length) nextIndex = 0;
    if (nextIndex < 0) nextIndex = themes.length - 1;
    setStackIndex(nextIndex);
    handleThemeChange(themes[nextIndex].id);
  };

  const handleGenerate = async () => {
    if (!prompt.trim() || isGenerating) return;

    const token = localStorage.getItem("token");
    const isLikelyJwt = token && token.split(".").length === 3;
    if (!isLikelyJwt) {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      alert("Please login first. Missing or invalid auth token.");
      return;
    }

    setIsGenerating(true);

    try {
      const res = await fetch(`${API_BASE_URL}/generate`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
        body: JSON.stringify({
          prompt,
          slides: Number(slides),
          textAmount,
          tone,
          audience,
          scenario,
          theme: selectedTheme,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        if (res.status === 401) {
          localStorage.removeItem("token");
          localStorage.removeItem("user");
        }
        throw new Error(data?.message || data?.error || "Failed to generate presentation");
      }

      let savedPresentationId = null;
      try {
        const generatedPresentation = data.data;
        const saveResponse = await savePresentation({
          title: prompt.trim().slice(0, 60) || "Untitled Presentation",
          prompt,
          content: generatedPresentation,
          theme: selectedTheme,
          slidesCount: Array.isArray(generatedPresentation?.slides)
            ? generatedPresentation.slides.length
            : Number(slides),
        });
        savedPresentationId = saveResponse?.data?._id || null;
        
        // Notify sidebar to refresh its decks list immediately
        window.dispatchEvent(new CustomEvent('refresh-sidebar-decks'));
      } catch (saveError) {
        console.error("Failed to save presentation:", saveError);
      }

      navigate("/preview", {
        state: {
          presentation: data.data,
          presentationId: savedPresentationId,
          title: prompt.trim().slice(0, 60) || "Untitled Presentation",
          theme: currentTheme,
          themeId: selectedTheme,
          textAmount,
        },
      });
    } catch (err) {
      console.error(err);
      alert(err.message || "Something went wrong");
    } finally {
      setIsGenerating(false);
    }
  };

  // Helper to slice 3 themes for the interactive stack rendering
  const getVisibleThemeStack = () => {
    const stack = [];
    for (let i = 0; i < 3; i++) {
      const index = (stackIndex + i) % themes.length;
      stack.push({ ...themes[index], stackIndex: i });
    }
    return stack;
  };

  return (
    <div className="relative w-full max-w-2xl mx-auto flex flex-col justify-center items-center min-h-[calc(100vh-8rem)] py-6 select-none gap-8">
      
      {/* Decorative Radial Background */}
      <div 
        className="absolute inset-0 pointer-events-none -z-10 blur-3xl opacity-30 transition-all duration-700"
        style={{
          background: `radial-gradient(circle at center, ${currentTheme?.colors.secondary}15 0%, transparent 60%)`
        }}
      />

      {/* 1. Brand Greeting Header */}
      <div className="text-center flex flex-col gap-2">
        <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-slate-850 font-sans">
          What will you present next?
        </h1>
        <p className="text-sm text-slate-500 font-medium max-w-md mx-auto leading-relaxed">
          Type a topic outline or select a quick starter pill below to generate your slide blueprint.
        </p>
      </div>

      {/* 2. Spotlight Command Bar */}
      <div className="w-full flex flex-col gap-2 relative z-20">
        <div className="w-full bg-white border border-slate-200/90 rounded-2xl shadow-[0_25px_50px_-12px_rgba(15,23,42,0.12),0_4px_16px_rgba(15,23,42,0.03)] p-2.5 flex flex-col gap-2 focus-within:border-blue-500 focus-within:shadow-[0_25px_50px_-12px_rgba(37,99,235,0.14)] transition-all">
          <textarea
            ref={promptInputRef}
            rows={2}
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleGenerate();
              }
            }}
            placeholder={`Message SlideOS... (Style: ${currentTheme?.name})`}
            className="w-full bg-transparent border-0 text-slate-800 placeholder-slate-400 px-2 py-1.5 outline-none resize-none text-base leading-relaxed"
          />

          <div className="flex items-center justify-between border-t border-slate-100 pt-2.5 px-1.5">
            {/* Left Options Buttons */}
            <div className="flex items-center gap-1.5">
              <button 
                type="button"
                onClick={() => setActiveMode(activeMode === 'theme' ? 'generate' : 'theme')}
                title="Select Theme"
                className={`p-2 rounded-xl border transition-all cursor-pointer flex items-center gap-1 text-xs font-semibold ${
                  activeMode === 'theme' 
                    ? 'text-blue-600 bg-blue-50/70 border-blue-200/40' 
                    : 'text-slate-500 hover:text-slate-850 bg-slate-50 hover:bg-slate-100 border-slate-200/50'
                }`}
              >
                <Palette className="w-3.5 h-3.5" />
                <span>Style: {currentTheme?.name}</span>
              </button>
              
              <button 
                type="button"
                onClick={() => setActiveMode(activeMode === 'layout' ? 'generate' : 'layout')}
                title="Configure Settings"
                className={`p-2 rounded-xl border transition-all cursor-pointer flex items-center gap-1 text-xs font-semibold ${
                  activeMode === 'layout' 
                    ? 'text-blue-600 bg-blue-50/70 border-blue-200/40' 
                    : 'text-slate-500 hover:text-slate-850 bg-slate-50 hover:bg-slate-100 border-slate-200/50'
                }`}
              >
                <SlidersHorizontal className="w-3.5 h-3.5" />
                <span>Layout: {slides} Slides</span>
              </button>
            </div>

            {/* Right Buttons: Turbo Toggle & Send Icon */}
            <div className="flex items-center gap-3">
              {/* Turbo Mode Toggle */}
              <button
                type="button"
                onClick={() => setTurboMode(!turboMode)}
                className={`px-2.5 py-1.5 rounded-full text-[10px] font-bold tracking-wide flex items-center gap-1 transition-all cursor-pointer ${
                  turboMode 
                    ? 'bg-amber-50 text-amber-700 border border-amber-200/50' 
                    : 'bg-slate-100 text-slate-400 border border-slate-200/60'
                }`}
              >
                <span className="w-1.5 h-1.5 rounded-full bg-current animate-pulse" />
                ⚡ Turbo Mode
              </button>

              {/* Generate Arrow Button - Polished glossy capsule look with inset top highlight border */}
              <button
                type="button"
                onClick={handleGenerate}
                disabled={!prompt.trim() || isGenerating}
                className={`w-8 h-8 rounded-full flex items-center justify-center transition-all cursor-pointer active:scale-90 ${
                  prompt.trim() && !isGenerating
                    ? 'bg-blue-600 text-white border-t border-white/35 border-x border-white/15 border-b-0 shadow-[inset_0_1px_0_rgba(255,255,255,0.35),0_4px_12px_rgba(37,99,235,0.3)] hover:bg-blue-700'
                    : 'bg-slate-100 text-slate-300 cursor-not-allowed border-0'
                }`}
              >
                {isGenerating ? (
                  <Loader2 className="w-4 h-4 animate-spin text-blue-600" />
                ) : (
                  <ArrowUp className="w-4 h-4" />
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Disclaimer Note */}
        <span className="text-[10px] md:text-xs text-slate-400 text-center font-medium">
          SlideOS is powered by AI. Double check generated layouts and key facts.
        </span>
      </div>

      {/* 3. Collapsible Settings Drawer */}
      <div className="w-full">
        <AnimatePresence mode="wait">
          
          {/* Theme Drawer */}
          {activeMode === 'theme' && (
            <motion.div
              key="theme"
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.25 }}
              className="w-full flex flex-col items-center gap-6"
            >
              <div className="flex items-center justify-between w-full border-b border-slate-200/80 pb-4">
                <div className="flex flex-col text-left">
                  <h2 className="text-xl font-bold text-slate-800">Select Presentation Theme</h2>
                  <span className="text-xs text-slate-400 font-medium">Click on a card or cycle to preview themes</span>
                </div>
                <div className="flex bg-slate-100 p-1 rounded-xl gap-1">
                  <button 
                    onClick={() => setThemeSelectorView('stack')}
                    className={`p-1.5 rounded-lg text-xs font-semibold flex items-center gap-1 transition-all cursor-pointer ${
                      themeSelectorView === 'stack' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-800'
                    }`}
                  >
                    <Layers className="w-3.5 h-3.5" />
                    <span>Stack</span>
                  </button>
                  <button 
                    onClick={() => setThemeSelectorView('grid')}
                    className={`p-1.5 rounded-lg text-xs font-semibold flex items-center gap-1 transition-all cursor-pointer ${
                      themeSelectorView === 'grid' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-800'
                    }`}
                  >
                    <Grid className="w-3.5 h-3.5" />
                    <span>Grid</span>
                  </button>
                </div>
              </div>

              {themeSelectorView === 'stack' ? (
                /* Stack view with Framer Motion stacked slide cards */
                <div className="relative w-full max-w-md h-72 flex justify-center items-center mt-4">
                  {getVisibleThemeStack().slice().reverse().map((theme) => {
                    const isTop = theme.stackIndex === 0;
                    return (
                      <motion.div
                        key={theme.id}
                        style={{
                          transformOrigin: 'top center',
                        }}
                        animate={{
                          y: theme.stackIndex * 16,
                          scale: 1 - theme.stackIndex * 0.04,
                          zIndex: 30 - theme.stackIndex,
                          opacity: 1 - theme.stackIndex * 0.2,
                        }}
                        transition={{ 
                          type: 'spring', 
                          stiffness: 280, 
                          damping: 22 
                        }}
                        onClick={() => isTop ? cycleThemeStack(1) : handleThemeChange(theme.id)}
                        className={`absolute w-full max-w-sm bg-white rounded-2xl border p-5 shadow-lg select-none cursor-pointer hover:border-indigo-400/80 hover:shadow-xl transition-colors duration-350 ${
                          selectedTheme === theme.id ? 'border-indigo-600 ring-2 ring-indigo-600/10' : 'border-slate-200/80'
                        }`}
                      >
                        {/* Slide Layout Header Preview */}
                        <div 
                          className="h-28 rounded-xl p-4 flex flex-col justify-between mb-4 relative overflow-hidden"
                          style={{
                            background: `linear-gradient(135deg, ${theme.colors.primary}, ${theme.colors.secondary})`
                          }}
                        >
                          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-white/15 to-transparent pointer-events-none" />
                          <div className="text-[10px] font-bold text-white/70 uppercase tracking-widest leading-none">
                            Slide Preview
                          </div>
                          <div>
                            <h4 className="text-white font-semibold text-lg drop-shadow-sm font-sans line-clamp-1">
                              Creating with SlideOS
                            </h4>
                            <p className="text-white/80 text-xs drop-shadow-sm line-clamp-1 mt-0.5">
                              {theme.fonts}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center justify-between">
                          <div>
                            <h3 className="font-bold text-slate-800 text-base">{theme.name}</h3>
                            <p className="text-slate-400 text-xs mt-0.5">{theme.fonts}</p>
                          </div>
                          
                          <div className="flex gap-1 bg-slate-50 p-1.5 rounded-lg border border-slate-100">
                            <div className="w-4 h-4 rounded-full border border-white" style={{ backgroundColor: theme.colors.primary }} />
                            <div className="w-4 h-4 rounded-full border border-white" style={{ backgroundColor: theme.colors.secondary }} />
                            <div className="w-4 h-4 rounded-full border border-slate-200" style={{ backgroundColor: theme.colors.background }} />
                          </div>
                        </div>
                      </motion.div>
                    );
                  })}
                  
                  {/* Overlay arrow controls */}
                  <div className="absolute -left-12 top-1/2 -translate-y-1/2 flex items-center justify-center">
                    <button 
                      onClick={() => cycleThemeStack(-1)}
                      className="w-10 h-10 rounded-full border border-slate-200 bg-white hover:bg-slate-50 flex items-center justify-center shadow-md text-slate-600 active:scale-95 transition-all cursor-pointer"
                    >
                      <ChevronLeft className="w-5 h-5" />
                    </button>
                  </div>
                  <div className="absolute -right-12 top-1/2 -translate-y-1/2 flex items-center justify-center">
                    <button 
                      onClick={() => cycleThemeStack(1)}
                      className="w-10 h-10 rounded-full border border-slate-200 bg-white hover:bg-slate-50 flex items-center justify-center shadow-md text-slate-600 active:scale-95 transition-all cursor-pointer"
                    >
                      <ChevronRight className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              ) : (
                /* Grid view of all themes */
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 w-full mt-2">
                  {themes.map((theme) => (
                    <div
                      key={theme.id}
                      onClick={() => handleThemeChange(theme.id)}
                      className={`bg-white border rounded-2xl p-4 text-left cursor-pointer hover:border-indigo-400 hover:shadow-md transition-all flex flex-col gap-3 relative ${
                        selectedTheme === theme.id ? 'border-indigo-600 ring-2 ring-indigo-600/10' : 'border-slate-200/80'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <h3 className="font-bold text-slate-800 text-sm">{theme.name}</h3>
                        <div className="flex gap-0.5">
                          <div className="w-3.5 h-3.5 rounded-full border border-white" style={{ backgroundColor: theme.colors.primary }} />
                          <div className="w-3.5 h-3.5 rounded-full border border-white" style={{ backgroundColor: theme.colors.secondary }} />
                        </div>
                      </div>
                      <p className="text-slate-400 text-2xs uppercase tracking-wider">{theme.fonts}</p>
                    </div>
                  ))}
                </div>
              )}
            </motion.div>
          )}

          {/* Layout Configuration Drawer */}
          {activeMode === 'layout' && (
            <motion.div
              key="layout"
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.25 }}
              className="w-full flex flex-col items-center gap-6"
            >
              <div className="text-left w-full border-b border-slate-200/80 pb-4">
                <h2 className="text-xl font-bold text-slate-800">Configure Layout Parameters</h2>
                <span className="text-xs text-slate-400 font-medium">Fine-tune slide count, text lengths, and target audience settings</span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full text-left bg-white p-6 rounded-2xl border border-slate-200/80 shadow-md">
                
                {/* 1. Slide Count */}
                <div className="md:col-span-2 flex flex-col gap-2.5">
                  <Label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Number of slides</Label>
                  <div className="flex flex-wrap gap-2">
                    {['3', '5', '8', '10', '15'].map((num) => (
                      <button
                        key={num}
                        onClick={() => setSlides(num)}
                        className={`px-5 py-2 rounded-xl text-sm font-semibold border transition-all cursor-pointer ${
                          slides === num 
                            ? 'bg-blue-50 border-blue-600 text-blue-700 shadow-2xs' 
                            : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                        }`}
                      >
                        {num} slides
                      </button>
                    ))}
                  </div>
                </div>

                {/* 2. Text density */}
                <div className="md:col-span-2 flex flex-col gap-2.5">
                  <Label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Text density per slide</Label>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                    {['minimal', 'concise', 'detailed', 'extensive'].map((amount) => (
                      <button
                        key={amount}
                        onClick={() => setTextAmount(amount)}
                        className={`px-4 py-3 rounded-xl text-xs font-bold border capitalize transition-all text-center cursor-pointer ${
                          textAmount === amount 
                            ? 'bg-blue-50 border-blue-600 text-blue-700 shadow-2xs' 
                            : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                        }`}
                      >
                        {amount}
                      </button>
                    ))}
                  </div>
                </div>

                {/* 3. Tone Dropdown */}
                <div className="flex flex-col gap-2">
                  <Label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Tone of writing</Label>
                  <select 
                    value={tone} 
                    onChange={(e) => setTone(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200/80 rounded-xl px-3 py-2.5 text-sm text-slate-700 focus:ring-1.5 focus:ring-blue-500/25 focus:border-blue-500 outline-none transition-all cursor-pointer"
                  >
                    <option value="auto">Auto (Context aware)</option>
                    <option value="professional">Professional</option>
                    <option value="casual">Casual</option>
                    <option value="enthusiastic">Enthusiastic</option>
                  </select>
                </div>

                {/* 4. Scenario Dropdown */}
                <div className="flex flex-col gap-2">
                  <Label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Scenario</Label>
                  <select 
                    value={scenario} 
                    onChange={(e) => setScenario(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200/80 rounded-xl px-3 py-2.5 text-sm text-slate-700 focus:ring-1.5 focus:ring-blue-500/25 focus:border-blue-500 outline-none transition-all cursor-pointer"
                  >
                    <option value="auto">Auto</option>
                    <option value="presentation">Standard Presentation</option>
                    <option value="training">Training Workshop</option>
                    <option value="pitch">Business Pitch Deck</option>
                  </select>
                </div>
              </div>

              <Button
                onClick={() => setActiveMode('generate')}
                className="mt-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-6 rounded-xl shadow-md cursor-pointer transition-all active:scale-[0.98] border-t border-white/20 border-x border-white/10"
              >
                Apply Parameters
              </Button>
            </motion.div>
          )}

          {/* Suggestions View (Only shown when drawers are closed) */}
          {activeMode === 'generate' && (
            <motion.div
              key="generate"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.25 }}
              className="flex flex-wrap items-center justify-center gap-2 max-w-lg mt-2 mx-auto"
            >
              <span className="text-xs text-slate-400 font-bold mr-1">Starters:</span>
              {[
                { tag: "#CreativePitch", label: "Creative Pitch", theme: "orbit", slides: "8", text: "minimal", tone: "enthusiastic" },
                { tag: "#SaaSOutline", label: "SaaS Blueprint", theme: "cosmos", slides: "5", text: "concise", tone: "professional" },
                { tag: "#MinimalTalk", label: "Minimalist Slides", theme: "noir", slides: "6", text: "minimal", tone: "casual" },
                { tag: "#CorporateBrief", label: "Corporate Summary", theme: "cornflower", slides: "5", text: "detailed", tone: "professional" }
              ].map((s) => (
                <button
                  key={s.tag}
                  onClick={() => {
                    setSelectedTheme(s.theme);
                    setSlides(s.slides);
                    setTextAmount(s.text);
                    setTone(s.tone);
                    setPrompt(`Outline for a ${s.label} about `);
                    if (promptInputRef.current) {
                      promptInputRef.current.focus();
                    }
                  }}
                  className="px-3.5 py-1.5 rounded-full text-xs font-bold bg-white hover:bg-slate-100 text-slate-600 border border-slate-200 transition-all cursor-pointer shadow-2xs hover:border-slate-300"
                >
                  {s.tag}
                </button>
              ))}
            </motion.div>
          )}

        </AnimatePresence>
      </div>
    </div>
  );
}
