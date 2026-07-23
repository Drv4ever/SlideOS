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
import { normalizePresentation, themeToColors, CURATED_LOOKUP } from "../utils/slideModel";

const themePalette = CURATED_LOOKUP;

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
        <p className="text-muted-foreground font-medium">No presentation found.</p>
        <Button onClick={() => navigate("/")} variant="destructive" className="cursor-pointer">
          Go Back
        </Button>
      </div>
    );
  }

  // Normalize so both legacy {heading,content} and new {elements,layout} formats work
  const normalized = normalizePresentation(
    { title: initialTitle, theme: selectedTheme, slides: initialPresentation.slides },
    themeId
  );
  const [slides, setSlides] = useState(normalized.slides);
  const [title, setTitle] = useState(normalized.title);
  const [isSaving, setIsSaving] = useState(false);

  // Sync title from state changes if any
  useEffect(() => {
    if (state?.title) {
      setTitle(state.title);
    }
  }, [state?.title]);

  /* ================= UPDATE FUNCTIONS ================= */

  const getBulletElement = (slide) =>
    slide.elements?.find((el) => el.type === "bullet");

  const updateHeading = (index, value) => {
    const updated = [...slides];
    updated[index].heading = value;
    const headingEl = updated[index].elements.find((el) => el.type === "heading");
    if (headingEl) headingEl.content = value;
    setSlides(updated);
  };

  const updateBullet = (slideIndex, bulletIndex, value) => {
    const updated = [...slides];
    let bulletEl = getBulletElement(updated[slideIndex]);
    if (!bulletEl) {
      bulletEl = { type: "bullet", content: "", items: [] };
      updated[slideIndex].elements.push(bulletEl);
    }
    bulletEl.items[bulletIndex] = value;
    setSlides(updated);
  };

  const addBullet = (slideIndex) => {
    const updated = [...slides];
    let bulletEl = getBulletElement(updated[slideIndex]);
    if (!bulletEl) {
      bulletEl = { type: "bullet", content: "", items: [] };
      updated[slideIndex].elements.push(bulletEl);
    }
    bulletEl.items.push("New point");
    setSlides(updated);
  };

  const deleteBullet = (slideIndex, bulletIndex) => {
    const updated = [...slides];
    const bulletEl = getBulletElement(updated[slideIndex]);
    if (bulletEl) bulletEl.items.splice(bulletIndex, 1);
    setSlides(updated);
  };

  const addSlide = () => {
    setSlides([
      ...slides,
      {
        layout: "header",
        heading: "New Slide Title",
        elements: [
          { type: "heading", content: "New Slide Title" },
          { type: "bullet", content: "", items: ["New slide point 1"] },
        ],
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
          slides,
          editorSlides: slides,
          slideNotes: [],
          textAmount,
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
    const elementChars = (slide.elements || []).reduce((s, el) => {
      if (el.type === "bullet") return s + (el.items?.join("")?.length || 0);
      return s + (el.content?.length || 0);
    }, 0);
    return acc + (slide.heading?.length || 0) + elementChars;
  }, 0);

  /* ================= UI ================= */

  return (
    <div className="w-full max-w-4xl mx-auto flex flex-col min-h-screen py-4 px-2 select-none rounded-2xl border border-border/50 bg-card/50">
      
      {/* Sticky Editor Control Bar */}
      <header className="sticky top-0 z-30 bg-muted/90 backdrop-blur-md py-3 border-b border-border/50 mb-6 flex items-center justify-between gap-4 rounded-2xl w-full">
        
        {/* Left: Back Arrow + Title Input */}
        <div className="flex items-center gap-3 overflow-hidden">
          <button
            onClick={() => navigate("/")}
            title="Back to generator"
            className="p-2 rounded-lg hover:bg-accent text-muted-foreground active:scale-95 transition-all cursor-pointer shrink-0"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          
          <div className="flex flex-col overflow-hidden text-left">
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="text-lg font-bold text-foreground bg-transparent border-b border-transparent focus:border-orange-500/80 outline-none pb-0.5 truncate max-w-md"
              placeholder="Presentation Title"
              title="Click to rename"
            />
            <span className="text-[10px] text-orange-600 font-bold tracking-wider uppercase mt-0.5 leading-none">
              Outline Editor
            </span>
          </div>
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-2 shrink-0 pr-1">
          <Button
            variant="destructive"
            onClick={handleSaveChanges}
            disabled={!presentationId || isSaving}
            className="flex items-center gap-1.5 cursor-pointer h-9 px-3 rounded-lg text-sm"
          >
            {isSaving ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Save className="w-4 h-4" />
            )}
            <span>{isSaving ? "Saving..." : "Save Changes"}</span>
          </Button>

          <Button
            variant="destructive"
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
            className="flex items-center gap-1.5 cursor-pointer h-9 px-4 rounded-lg text-sm mr-4"
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
              className="bg-sidebar rounded-2xl border border-border/70 p-6 flex gap-5 items-start shadow-[0_16px_40px_-12px_rgba(15,23,42,0.06),0_4px_12px_rgba(15,23,42,0.02)] relative hover:border-border hover:shadow-[0_20px_48px_-10px_rgba(15,23,42,0.1),0_4px_16px_rgba(15,23,42,0.03)] transition-all group"
            >
              {/* Slide Number Bubble */}
              <div className="w-9 h-9 rounded-xl bg-muted border border-border text-muted-foreground flex items-center justify-center font-bold text-xs shrink-0 shadow-xs">
                {(slideIndex + 1).toString().padStart(2, '0')}
              </div>

              {/* Edit Details */}
              <div className="flex-1 flex flex-col text-left">
                
                {/* 1. Editable Title Heading */}
                <div className="flex flex-col gap-1 mb-4">
                  <label className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest leading-none">
                    Slide Heading
                  </label>
                  <input
                    value={slide.heading}
                    onChange={(e) => updateHeading(slideIndex, e.target.value)}
                    className="w-full text-base font-bold text-foreground bg-transparent outline-none border-b border-transparent focus:border-orange-500/50 pb-0.5"
                    placeholder="Enter slide heading"
                  />
                </div>

                {/* 2. Editable Bullet Points */}
                <div className="flex flex-col gap-1">
                  <label className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest leading-none mb-1.5">
                    Slide Body Points
                  </label>
                  
                  <div className="flex flex-col gap-2.5">
                    {(getBulletElement(slide)?.items || []).map((point, bulletIndex) => (
                      <div key={bulletIndex} className="flex items-center gap-3 group/bullet">
                        {/* Custom Indigo Bullet Dash */}
                        <span className="w-1.5 h-1.5 rounded-full bg-orange-500/80 shrink-0" />
                        
                        <input
                          value={point}
                          onChange={(e) => updateBullet(slideIndex, bulletIndex, e.target.value)}
                          className="flex-1 text-sm text-muted-foreground bg-transparent outline-none border-b border-transparent focus:border-orange-500/40 pb-0.5 font-sans"
                          placeholder="Bullet point item"
                        />

                        {/* Hover close icon */}
                        <button
                          onClick={() => deleteBullet(slideIndex, bulletIndex)}
                          className="text-muted-foreground/70 hover:text-red-500 hover:bg-muted cursor-pointer opacity-0 group-hover/bullet:opacity-100 transition-opacity p-0.5 rounded-lg"
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
                  className="mt-3 text-[11px] font-bold text-foreground flex items-center gap-1.5 cursor-pointer bg-muted hover:bg-accent border border-border/30 py-1 px-3 rounded-lg transition-all active:scale-[0.98] w-fit"
                >
                  <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
                  <span>Add point</span>
                </button>
              </div>

              {/* Delete Slide Button (Top Right of Card) */}
              <button
                onClick={() => deleteSlide(slideIndex)}
                className="absolute top-4 right-4 text-muted-foreground/70 hover:text-red-500 hover:bg-destructive/10 p-1.5 rounded-lg opacity-0 group-hover:opacity-100 transition-all cursor-pointer"
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
          className="w-full border-2 border-dashed border-border hover:border-orange-400 hover:bg-sidebar hover:shadow-xs rounded-2xl py-4 flex items-center justify-center gap-2 cursor-pointer transition-all text-muted-foreground hover:text-orange-600 text-sm font-semibold active:scale-[0.99] bg-sidebar/30"
        >
          <PlusCircle className="w-4.5 h-4.5" />
          <span>Add New Slide</span>
        </button>

        {/* Footer Statistics */}
        <div className="flex justify-between items-center text-[10px] md:text-xs text-muted-foreground font-medium px-2 py-1 mt-1">
          <div>{slides.length} cards total</div>
          <div>{totalCharacters}/20000 characters</div>
        </div>
      </div>

    </div>
  );
}
