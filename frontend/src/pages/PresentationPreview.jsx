import { useLocation, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  ArrowLeft, 
  Play, 
  Save, 
  Plus, 
  Trash2, 
  X, 
  PlusCircle,
  Loader2
} from "lucide-react";
import { Button } from "../components/ui/button";
import { updatePresentation } from "../services/presentationService";

const themePalette = {
  fluent: {
    primary: "#0078d4",
    secondary: "#50e4ff",
    background: "#f3f2f1",
    text: "#201f1e",
  },
  dalibio: {
    primary: "#6366f1",
    secondary: "#818cf8",
    background: "#f0f4ff",
    text: "#1e1b4b",
  },
  noir: {
    primary: "#18181b",
    secondary: "#3f3f46",
    background: "#f5f5f5",
    text: "#09090b",
  },
  cornflower: {
    primary: "#6366f1",
    secondary: "#a5b4fc",
    background: "#eef2ff",
    text: "#312e81",
  },
  indigo: {
    primary: "#4f46e5",
    secondary: "#6366f1",
    background: "#e0e7ff",
    text: "#3730a3",
  },
  orbit: {
    primary: "#8b5cf6",
    secondary: "#a78bfa",
    background: "#faf5ff",
    text: "#581c87",
  },
  cosmos: {
    primary: "#ec4899",
    secondary: "#f472b6",
    background: "#fdf4ff",
    text: "#831843",
  },
};

export default function PresentationPreview() {
  const { state } = useLocation();
  const navigate = useNavigate();
  const initialPresentation = state?.presentation;
  const presentationId = state?.presentationId;
  const initialTitle = state?.title || "Untitled Presentation";
  const themeId = state?.themeId || "cornflower";
  const selectedTheme = state?.theme;
  const textAmount = state?.textAmount || "detailed";
  const activeTheme = selectedTheme?.colors || themePalette[themeId] || themePalette.cornflower;

  if (!initialPresentation) {
    return (
      <div className="p-10 text-center flex flex-col items-center gap-4 justify-center min-h-[50vh]">
        <p className="text-slate-500 font-medium">No presentation found.</p>
        <Button onClick={() => navigate("/")} variant="outline" className="cursor-pointer">
          Go Back
        </Button>
      </div>
    );
  }

  const [slides, setSlides] = useState(initialPresentation.slides);
  const [title, setTitle] = useState(initialTitle);
  const [isSaving, setIsSaving] = useState(false);

  // Sync title from state changes if any
  useEffect(() => {
    if (state?.title) {
      setTitle(state.title);
    }
  }, [state?.title]);

  /* ================= UPDATE FUNCTIONS ================= */

  const updateHeading = (index, value) => {
    const updated = [...slides];
    updated[index].heading = value;
    setSlides(updated);
  };

  const updateBullet = (slideIndex, bulletIndex, value) => {
    const updated = [...slides];
    updated[slideIndex].content[bulletIndex] = value;
    setSlides(updated);
  };

  const addBullet = (slideIndex) => {
    const updated = [...slides];
    updated[slideIndex].content.push("New point");
    setSlides(updated);
  };

  const deleteBullet = (slideIndex, bulletIndex) => {
    const updated = [...slides];
    updated[slideIndex].content.splice(bulletIndex, 1);
    setSlides(updated);
  };

  const addSlide = () => {
    setSlides([
      ...slides,
      {
        heading: "New Slide Title",
        content: ["New slide point 1"],
      },
    ]);
  };

  const deleteSlide = (index) => {
    const updated = slides.filter((_, i) => i !== index);
    setSlides(updated);
  };

  const handleSaveChanges = async () => {
    if (!presentationId) {
      alert("This presentation is not linked to a saved record.");
      return;
    }

    try {
      setIsSaving(true);
      await updatePresentation(presentationId, {
        title: title.trim() || "Untitled Presentation",
        theme: themeId,
        slidesCount: slides.length,
        content: {
          ...initialPresentation,
          slides,
        },
      });
      
      // Dispatch refresh event to update sidebar
      window.dispatchEvent(new CustomEvent('refresh-sidebar-decks'));
      alert("Presentation saved successfully");
    } catch (error) {
      alert(error.message || "Failed to update presentation");
    } finally {
      setIsSaving(false);
    }
  };

  /* ================= CHARACTER COUNT ================= */

  const totalCharacters = slides.reduce((acc, slide) => {
    return (
      acc +
      slide.heading.length +
      slide.content.join("").length
    );
  }, 0);

  /* ================= UI ================= */

  return (
    <div className="w-full max-w-4xl mx-auto flex flex-col min-h-screen py-4 px-2 select-none">
      
      {/* Sticky Editor Control Bar */}
      <header className="sticky top-0 z-30 bg-slate-50/90 backdrop-blur-md pb-4 pt-2 border-b border-slate-200/50 mb-6 flex items-center justify-between gap-4">
        
        {/* Left: Back Arrow + Title Input */}
        <div className="flex items-center gap-3 overflow-hidden">
          <button
            onClick={() => navigate("/")}
            title="Back to generator"
            className="p-2 rounded-lg hover:bg-slate-100 text-slate-500 active:scale-95 transition-all cursor-pointer shrink-0"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          
          <div className="flex flex-col overflow-hidden text-left">
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="text-lg font-bold text-slate-800 bg-transparent border-b border-transparent focus:border-indigo-500/80 outline-none pb-0.5 truncate max-w-md"
              placeholder="Presentation Title"
              title="Click to rename"
            />
            <span className="text-[10px] text-indigo-600 font-bold tracking-wider uppercase mt-0.5 leading-none">
              Outline Editor
            </span>
          </div>
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-2 shrink-0">
          <Button
            variant="outline"
            onClick={handleSaveChanges}
            disabled={!presentationId || isSaving}
            className="flex items-center gap-1.5 border-slate-200 text-slate-700 bg-white hover:bg-slate-50 cursor-pointer h-9 px-3 rounded-lg text-sm"
          >
            {isSaving ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Save className="w-4 h-4" />
            )}
            <span>{isSaving ? "Saving..." : "Save Changes"}</span>
          </Button>

          <Button
            onClick={() => navigate("/presentation-view", { 
              state: {
                slides, 
                theme: selectedTheme, 
                textAmount, 
                presentationId, 
                title: title.trim(), 
                themeId
              } 
            })}
            style={{
              background: `linear-gradient(135deg, ${activeTheme.primary}, ${activeTheme.secondary})`,
              color: "#fff"
            }}
            className="flex items-center gap-1.5 border-t border-white/35 border-x border-white/15 border-b-0 shadow-[inset_0_1px_0_rgba(255,255,255,0.35),0_4px_12px_rgba(99,102,241,0.25)] hover:shadow-lg h-9 px-4 rounded-lg text-sm font-semibold cursor-pointer transition-all active:scale-[0.98]"
          >
            <Play className="w-4 h-4" />
            <span>Present</span>
          </Button>
        </div>
      </header>

      {/* Slide Cards Canvas */}
      <div className="flex-1 flex flex-col gap-6 max-w-3xl mx-auto w-full pb-16">
        <AnimatePresence initial={false}>
          {slides.map((slide, slideIndex) => (
            <motion.div
              key={slideIndex}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96 }}
              transition={{ duration: 0.25 }}
              className="bg-white rounded-2xl border border-slate-200/70 p-6 flex gap-5 items-start shadow-[0_16px_40px_-12px_rgba(15,23,42,0.06),0_4px_12px_rgba(15,23,42,0.02)] relative hover:border-slate-350 hover:shadow-[0_20px_48px_-10px_rgba(15,23,42,0.1),0_4px_16px_rgba(15,23,42,0.03)] transition-all group"
            >
              {/* Slide Number Bubble */}
              <div className="w-9 h-9 rounded-xl bg-indigo-50 border border-indigo-100 text-indigo-700 flex items-center justify-center font-bold text-xs shrink-0 shadow-xs">
                {(slideIndex + 1).toString().padStart(2, '0')}
              </div>

              {/* Edit Details */}
              <div className="flex-1 flex flex-col text-left">
                
                {/* 1. Editable Title Heading */}
                <div className="flex flex-col gap-1 mb-4">
                  <label className="text-[9px] font-bold text-slate-400 uppercase tracking-widest leading-none">
                    Slide Heading
                  </label>
                  <input
                    value={slide.heading}
                    onChange={(e) => updateHeading(slideIndex, e.target.value)}
                    className="w-full text-base font-bold text-slate-800 bg-transparent outline-none border-b border-transparent focus:border-indigo-500/50 pb-0.5"
                    placeholder="Enter slide heading"
                  />
                </div>

                {/* 2. Editable Bullet Points */}
                <div className="flex flex-col gap-1">
                  <label className="text-[9px] font-bold text-slate-400 uppercase tracking-widest leading-none mb-1.5">
                    Slide Body Points
                  </label>
                  
                  <div className="flex flex-col gap-2.5">
                    {slide.content.map((point, bulletIndex) => (
                      <div key={bulletIndex} className="flex items-center gap-3 group/bullet">
                        {/* Custom Indigo Bullet Dash */}
                        <span className="w-1.5 h-1.5 rounded-full bg-indigo-500/80 shrink-0" />
                        
                        <input
                          value={point}
                          onChange={(e) => updateBullet(slideIndex, bulletIndex, e.target.value)}
                          className="flex-1 text-sm text-slate-600 bg-transparent outline-none border-b border-transparent focus:border-indigo-500/40 pb-0.5 font-sans"
                          placeholder="Bullet point item"
                        />

                        {/* Hover close icon */}
                        <button
                          onClick={() => deleteBullet(slideIndex, bulletIndex)}
                          className="text-slate-300 hover:text-red-500 hover:bg-slate-50 cursor-pointer opacity-0 group-hover/bullet:opacity-100 transition-opacity p-0.5 rounded-lg"
                          title="Remove point"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>

                {/* 3. Add Point Action */}
                <button
                  onClick={() => addBullet(slideIndex)}
                  className="mt-3 text-[11px] font-bold text-indigo-600 hover:text-indigo-700 flex items-center gap-1.5 cursor-pointer bg-indigo-50 hover:bg-indigo-100/70 border border-indigo-200/30 py-1 px-3 rounded-lg transition-all active:scale-[0.98] w-fit"
                >
                  <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
                  <span>Add point</span>
                </button>
              </div>

              {/* Delete Slide Button (Top Right of Card) */}
              <button
                onClick={() => deleteSlide(slideIndex)}
                className="absolute top-4 right-4 text-slate-300 hover:text-red-500 hover:bg-red-50 p-1.5 rounded-lg opacity-0 group-hover:opacity-100 transition-all cursor-pointer"
                title="Delete slide"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </motion.div>
          ))}
        </AnimatePresence>

        {/* Add Card dashed placeholder */}
        <button
          onClick={addSlide}
          className="w-full border-2 border-dashed border-slate-200 hover:border-indigo-400 hover:bg-white hover:shadow-xs rounded-2xl py-4 flex items-center justify-center gap-2 cursor-pointer transition-all text-slate-400 hover:text-indigo-600 text-sm font-semibold active:scale-[0.99] bg-slate-50/30"
        >
          <PlusCircle className="w-4.5 h-4.5" />
          <span>Add New Slide</span>
        </button>

        {/* Footer Statistics */}
        <div className="flex justify-between items-center text-[10px] md:text-xs text-slate-400 font-medium px-2 py-1 mt-1">
          <div>{slides.length} cards total</div>
          <div>{totalCharacters}/20000 characters</div>
        </div>
      </div>

    </div>
  );
}
