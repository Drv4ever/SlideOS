  import { useState } from 'react';
  import { Sparkles, ChevronDown, Wand2, FileText, Loader2 } from 'lucide-react';
  import { Button } from './ui/button';
  import { Textarea } from './ui/textarea';
  import { Label } from './ui/label';
  import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
  } from './ui/select';
  import { Card } from './ui/card';

  const themes = [
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
    const [prompt, setPrompt] = useState('');
    const [slides, setSlides] = useState('5');
    const [textAmount, setTextAmount] = useState('detailed');
    const [tone, setTone] = useState('auto');
    const [audience, setAudience] = useState('auto');
    const [scenario, setScenario] = useState('auto');
    const [selectedTheme, setSelectedTheme] = useState('cornflower');
    const [isGenerating, setIsGenerating] = useState(false);
    const [currentStep, setCurrentStep] = useState(1);

    const currentTheme = themes.find(t => t.id === selectedTheme);

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

    const handleContinueFromPrompt = () => {
      if (prompt.trim()) {
        setCurrentStep(2);
      }
    };

    const handleContinueFromTheme = () => {
      setCurrentStep(3);
    };
    
    const handleGenerate = async () => {
     
      if (!prompt.trim()) return;
      
      setIsGenerating(true);
      console.log('Generating presentation with:', {
        prompt,
        slides,
        textAmount,
        tone,
        audience,
        scenario,
        theme: selectedTheme,
      });

      try{
      const res = await fetch("http://localhost:5000/api/generate",{
        method : "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          prompt,
          slides : Number(slides),
          textAmount,
          tone,
          audience,
          scenario,
          theme: selectedTheme,
        }),
        // 🔹 later: pass this to PPT renderer or preview
      // setResult(data);
      });


      if (!res.ok) {
        throw new Error("Failed to generate presentation");
      }
      const data = await res.json();

      console.log("Backend Responce: ",data);
      }catch (err) {
        console.error(err);
        alert("Something went wrong");
      } finally {
        setIsGenerating(false);
      }
    };

    return (
      <div 
        className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 transition-all duration-500"
        style={{
          '--theme-primary': currentTheme?.colors.primary,
          '--theme-secondary': currentTheme?.colors.secondary,
          '--theme-background': currentTheme?.colors.background,
          '--theme-text': currentTheme?.colors.text,
          fontFamily: `${currentTheme?.fontFamily.body}, sans-serif`,
        }}
      >
        {/* Step 1: Hero Section with Prompt */}
        <div className={`text-center mb-12 relative transition-all duration-700 ${
          currentStep > 1 ? 'opacity-50 scale-95 pointer-events-none' : 'opacity-100 scale-100'
        }`}>
          <div 
            className="absolute inset-0 -z-10 blur-3xl opacity-30 transition-all duration-500" 
            style={{
              background: `radial-gradient(circle at center, ${currentTheme?.colors.primary}, ${currentTheme?.colors.secondary}, transparent)`
            }}
          />
          <h1 
            className="text-4xl md:text-5xl font-bold mb-4 transition-all duration-500"
            style={{
              fontFamily: `${currentTheme?.fontFamily.heading}, sans-serif`,
              color: currentTheme?.colors.text,
            }}
          >
            Generate PowerPoint Presentation
            <br />
            in a Second
          </h1>
          <p 
            className="text-lg mb-8 transition-all duration-500"
            style={{ color: currentTheme?.colors.text, opacity: 0.7 }}
          >
            Transform your ideas into professional presentations instantly.
          </p>

          {/* Prompt Input */}
          <div className="mb-6">
            <Textarea
              placeholder="hello please make a ppt on html teaching"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              className="min-h-[120px] resize-none text-base bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800 focus:ring-2 transition-all duration-300"
              style={{
                '--tw-ring-color': currentTheme?.colors.primary,
              }}
            />
          </div>

          {/* Slides Selector */}
          <div className="flex items-center justify-center gap-2 mb-8">
            <Select value={slides} onValueChange={setSlides}>
              <SelectTrigger className="w-32 bg-white dark:bg-gray-900">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="3">3 slides</SelectItem>
                <SelectItem value="5">5 slides</SelectItem>
                <SelectItem value="8">8 slides</SelectItem>
                <SelectItem value="10">10 slides</SelectItem>
                <SelectItem value="15">15 slides</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Continue Button */}
          <Button
            onClick={handleContinueFromPrompt}
            size="lg"
            disabled={!prompt.trim()}
            className="px-8 text-white disabled:opacity-50 disabled:cursor-not-allowed shadow-xl hover:shadow-2xl transform hover:scale-105 transition-all duration-300"
            style={{
              backgroundColor: currentTheme?.colors.primary,
            }}
          >
            <Sparkles className="mr-2 h-5 w-5" />
            Choose Theme
          </Button>
        </div>

        {/* Step 2: Theme Selection - Reveals when step >= 2 */}
        {currentStep >= 2 && (
          <Card 
            className={`p-6 mb-8 bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800 shadow-lg shadow-gray-100 dark:shadow-gray-900/50 transition-all duration-700 ${
              currentStep === 2 ? 'opacity-100 translate-y-0' : currentStep > 2 ? 'opacity-50 scale-95' : 'opacity-0 translate-y-10'
            }`}
          >
            <div className="flex items-center justify-between mb-6">
              <h2 
                className="text-2xl font-bold transition-all duration-500"
                style={{
                  fontFamily: `${currentTheme?.fontFamily.heading}, sans-serif`,
                  color: currentTheme?.colors.text,
                }}
              >
                Choose Your Theme
              </h2>
              <span className="text-xs px-3 py-1 rounded-full" style={{
                backgroundColor: currentTheme?.colors.background,
                color: currentTheme?.colors.text,
              }}>
                Preview Active
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
              {themes.map((theme) => (
                <button
                  key={theme.id}
                  onClick={() => handleThemeChange(theme.id)}
                  className={`p-4 rounded-lg border-2 transition-all duration-300 text-left hover:scale-105 ${
                    selectedTheme === theme.id
                      ? 'shadow-xl ring-2'
                      : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 hover:shadow-lg'
                  }`}
                  style={{
                    borderColor: selectedTheme === theme.id ? theme.colors.primary : undefined,
                    '--tw-ring-color': selectedTheme === theme.id ? theme.colors.primary : undefined,
                  }}
                >
                  <div 
                    className="mb-3 p-6 rounded overflow-hidden relative"
                    style={{
                      background: `linear-gradient(135deg, ${theme.colors.primary}, ${theme.colors.secondary})`,
                    }}
                  >
                    <div 
                      className="absolute inset-0 opacity-20"
                      style={{
                        background: `radial-gradient(circle at top right, ${theme.colors.background}, transparent)`,
                      }}
                    />
                    <div className="relative">
                      <div className="text-xs font-bold text-white mb-2 drop-shadow-md">Title Slide</div>
                      <div className="text-xs text-white/90 drop-shadow">Content preview</div>
                    </div>
                  </div>
                  <div className="flex items-center justify-between mb-1">
                    <div className="text-sm font-medium text-gray-900 dark:text-white">{theme.name}</div>
                    {selectedTheme === theme.id && (
                      <span className="text-xs px-2 py-0.5 rounded" style={{
                        backgroundColor: theme.colors.primary,
                        color: 'white',
                      }}>
                        Active
                      </span>
                    )}
                  </div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">{theme.fonts}</div>
                  <div className="flex gap-1 mt-2">
                    <div className="w-4 h-4 rounded-full" style={{ backgroundColor: theme.colors.primary }} />
                    <div className="w-4 h-4 rounded-full" style={{ backgroundColor: theme.colors.secondary }} />
                    <div className="w-4 h-4 rounded-full border" style={{ backgroundColor: theme.colors.background, borderColor: theme.colors.text }} />
                  </div>
                </button>
              ))}
            </div>

            {/* Continue Button */}
            <div className="flex justify-center">
              <Button
                onClick={handleContinueFromTheme}
                size="lg"
                className="px-8 text-white shadow-xl hover:shadow-2xl transform hover:scale-105 transition-all duration-300"
                style={{
                  backgroundColor: currentTheme?.colors.primary,
                }}
              >
                <Wand2 className="mr-2 h-5 w-5" />
                Customize Content
              </Button>
            </div>
          </Card>
        )}

        {/* Step 3: Text Content Options - Reveals when step >= 3 */}
        {currentStep >= 3 && (
          <>
            <Card className="p-6 mb-8 bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800 shadow-lg shadow-gray-100 dark:shadow-gray-900/50 transition-all duration-700 opacity-100 translate-y-0">
              <div className="flex items-center gap-2 mb-6">
                <div className="flex items-center gap-1 text-gray-900 dark:text-white">
                  <span className="text-sm">☰</span>
                  <h2 
                    className="text-2xl font-bold transition-all duration-500"
                    style={{
                      fontFamily: `${currentTheme?.fontFamily.heading}, sans-serif`,
                      color: currentTheme?.colors.text,
                    }}
                  >
                    Customize Content
                  </h2>
                </div>
              </div>

              {/* Text Amount Selection */}
              <div className="mb-6">
                <Label className="text-sm text-gray-700 dark:text-gray-300 mb-3 block">
                  Amount of text per card
                </Label>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {['minimal', 'concise', 'detailed', 'extensive'].map((amount) => (
                    <button
                      key={amount}
                      onClick={() => setTextAmount(amount)}
                      className={`py-8 px-4 rounded-lg border-2 transition-all duration-300 ${
                        textAmount === amount
                          ? 'bg-gray-50 dark:bg-gray-800 shadow-md'
                          : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                      }`}
                      style={{
                        borderColor: textAmount === amount ? currentTheme?.colors.primary : undefined,
                      }}
                    >
                      <span className="text-sm font-medium text-gray-900 dark:text-white capitalize">
                        {amount}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Dropdowns Grid */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label className="text-sm text-gray-700 dark:text-gray-300 mb-2 block">Tone</Label>
                  <Select value={tone} onValueChange={setTone}>
                    <SelectTrigger className="bg-white dark:bg-gray-900">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="auto">Auto</SelectItem>
                      <SelectItem value="professional">Professional</SelectItem>
                      <SelectItem value="casual">Casual</SelectItem>
                      <SelectItem value="enthusiastic">Enthusiastic</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label className="text-sm text-gray-700 dark:text-gray-300 mb-2 block">Audience</Label>
                  <Select value={audience} onValueChange={setAudience}>
                    <SelectTrigger className="bg-white dark:bg-gray-900">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="auto">Auto</SelectItem>
                      <SelectItem value="students">Students</SelectItem>
                      <SelectItem value="professionals">Professionals</SelectItem>
                      <SelectItem value="executives">Executives</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label className="text-sm text-gray-700 dark:text-gray-300 mb-2 block">Scenario</Label>
                  <Select value={scenario} onValueChange={setScenario}>
                    <SelectTrigger className="bg-white dark:bg-gray-900">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="auto">Auto</SelectItem>
                      <SelectItem value="presentation">Presentation</SelectItem>
                      <SelectItem value="training">Training</SelectItem>
                      <SelectItem value="pitch">Pitch</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </Card>

            {/* Generate Button */}
            <div className="flex justify-center animate-fade-in">
              <Button
                onClick={handleGenerate}
                size="lg"
                disabled={!prompt.trim() || isGenerating}
                className="px-8 text-white disabled:opacity-50 disabled:cursor-not-allowed shadow-xl hover:shadow-2xl transform hover:scale-105 transition-all duration-300"
                style={{
                  backgroundColor: currentTheme?.colors.primary,
                }}
              >
                {isGenerating ? (
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                ) : (
                  <Sparkles className="mr-2 h-5 w-5" />
                )}
                {isGenerating ? 'Generating...' : 'Generate Presentation'}
              </Button>
            </div>
          </>
        )}
      </div>
    );
  }