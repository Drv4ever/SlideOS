import { useLocation, useNavigate } from "react-router-dom";
import { useState, useEffect, useMemo, useCallback, memo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft,
  Play,
  Save,
  Plus,
  Trash2,
  X,
  PlusCircle,
  Loader2,
  Sparkles,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "../components/ui/button";
import { updatePresentation } from "../services/presentationService";
import { normalizePresentation, CURATED_LOOKUP } from "../utils/slideModel";
import { computeSlideLayout, toOutlineSlide, updateSlideRole, addSlideRoleBullet, deleteSlideRoleBullet } from "../utils/designedLayouts";
import { remixDeck, remixSlide } from "../utils/remix";
import SlideStage from "../components/SlideStage";

const themePalette = CURATED_LOOKUP;

function getBulletElement(slide) {
  return slide.elements?.find((el) => el.type === "bullet");
}

// Memoized slide card: renders the SAME designed slide as Present/Export
// (computeSlideLayout -> SlideStage) plus the editable inputs beneath it. Each
// card only recomputes its layout when its own slide object changes, so typing
// in one card never recomputes the whole deck.
const SlideCard = memo(function SlideCard({
  slide,
  slideIndex,
  total,
  designTheme,
  headingFont,
  bodyFont,
  onHeadingChange,
  onBulletChange,
  onAddBullet,
  onDeleteBullet,
  onDeleteSlide,
  onRemix,
  remixing,
}) {
  // Shared pipeline: the same layout engine Present/Export use, directly on the
  // slide data — no intermediate template conversion, one source of truth.
  const desc = useMemo(
    () =>
      computeSlideLayout(slide, designTheme, {
        index: slideIndex,
        total,
      }),
    [slide, designTheme, slideIndex, total]
  );

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.96, height: 0, marginBottom: 0 }}
      transition={{ duration: 0.25, layout: { duration: 0.3 } }}
      className="bg-sidebar rounded-2xl border border-border/70 p-6 shadow-[0_16px_40px_-12px_rgba(15,23,42,0.06),0_4px_12px_rgba(15,23,42,0.02)] relative hover:border-border hover:shadow-[0_20px_48px_-10px_rgba(15,23,42,0.1),0_4px_16px_rgba(15,23,42,0.03)] transition-all group"
    >
      {/* Card Header Row */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          {/* Slide Number Bubble */}
          <div className="w-9 h-9 rounded-xl bg-muted border border-border text-muted-foreground flex items-center justify-center font-bold text-xs shrink-0 shadow-xs">
            {(slideIndex + 1).toString().padStart(2, '0')}
          </div>

          {/* Layout Badge */}
          {slide.layout && (
            <span className="text-[9px] font-bold px-2 py-1 bg-muted/50 text-muted-foreground rounded-lg border border-border whitespace-nowrap">
              {slide.layout.replace(/-/g, " ")}
            </span>
          )}
        </div>

        {/* Remix + Delete Slide Buttons */}
        <div className="flex items-center gap-1">
          <button
            onClick={() => onRemix(slideIndex)}
            disabled={remixing}
            className="text-muted-foreground/70 hover:text-orange-500 hover:bg-orange-500/10 p-1.5 rounded-lg opacity-0 group-hover:opacity-100 transition-all cursor-pointer disabled:opacity-40 disabled:cursor-wait"
            title="Redesign this slide with AI"
          >
            {remixing ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Sparkles className="w-4 h-4" />
            )}
          </button>
          <button
            onClick={() => onDeleteSlide(slideIndex)}
            className="text-muted-foreground/70 hover:text-red-500 hover:bg-destructive/10 p-1.5 rounded-lg opacity-0 group-hover:opacity-100 transition-all cursor-pointer"
            title="Delete slide"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Designed slide preview — same rendering engine as Present/Export */}
      <div
        className="relative w-full aspect-video rounded-xl overflow-hidden border border-border/60"
        style={{ containerType: "inline-size" }}
      >
        <SlideStage
          desc={desc}
          animating={false}
          accentFont={headingFont}
          bodyFont={bodyFont}
        />
      </div>

      {/* Edit Details */}
      <div className="flex-1 flex flex-col text-left mt-5">
        {/* 1. Editable Title Heading */}
        <div className="flex flex-col gap-1 mb-4">
          <label className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest leading-none">
            Slide Heading
          </label>
          <input
            value={slide.heading}
            onChange={(e) => onHeadingChange(slideIndex, e.target.value)}
            className="w-full text-base font-bold text-foreground bg-transparent outline-none border-b border-transparent focus:border-orange-500/50 pb-0.5"
            placeholder="Enter slide heading"
            aria-label={`Slide ${slideIndex + 1} heading`}
          />
        </div>

        {/* 2. Editable Bullet Points */}
        <div className="flex flex-col gap-1">
          <label className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest leading-none mb-1.5">
            Slide Body Points
          </label>

          <div className="flex flex-col gap-2.5">
            {(getBulletElement(slide)?.items || slide.content || []).map((point, bulletIndex) => (
              <div key={bulletIndex} className="flex items-center gap-3 group/bullet">
                {/* Custom Indigo Bullet Dash */}
                <span className="w-1.5 h-1.5 rounded-full bg-orange-500/80 shrink-0" />

                <input
                  value={point}
                  onChange={(e) => onBulletChange(slideIndex, bulletIndex, e.target.value)}
                  className="flex-1 text-sm text-muted-foreground bg-transparent outline-none border-b border-transparent focus:border-orange-500/40 pb-0.5 font-sans"
                  placeholder="Bullet point item"
                  aria-label={`Slide ${slideIndex + 1} bullet ${bulletIndex + 1}`}
                />

                {/* Hover close icon */}
                <button
                  onClick={() => onDeleteBullet(slideIndex, bulletIndex)}
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
          onClick={() => onAddBullet(slideIndex)}
          className="mt-3 text-[11px] font-bold text-foreground flex items-center gap-1.5 cursor-pointer bg-muted hover:bg-accent border border-border/30 py-1 px-3 rounded-lg transition-all active:scale-[0.98] w-fit"
        >
          <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
          <span>Add point</span>
        </button>
      </div>
    </motion.div>
  );
});

export default function PresentationPreview() {
  const { state } = useLocation();
  const navigate = useNavigate();
  const initialPresentation = state?.presentation;
  const presentationId = state?.presentationId;
  const initialTitle = state?.title || "Untitled Presentation";
  const themeId = state?.themeId || "cornflower";
  const selectedTheme = state?.theme;
  const textAmount = state?.textAmount || "detailed";

  const fullTheme =
    selectedTheme || themePalette[themeId] || themePalette.cornflower;
  const themeColors = fullTheme?.colors || themePalette.cornflower.colors;
  const customFonts = state?.fonts || null;
  const headingFont =
    customFonts?.heading ||
    fullTheme?.fontFamily?.heading ||
    fullTheme?.fonts?.heading ||
    "Space Grotesk";
  const bodyFont =
    customFonts?.body ||
    fullTheme?.fontFamily?.body ||
    fullTheme?.fonts?.body ||
    "DM Sans";

  // Shared theme shape consumed by computeSlideLayout (same as Present/Export).
  const designTheme = useMemo(
    () => ({
      primary: themeColors.primary || "#f97316",
      accent: themeColors.accent || "#fb923c",
      background: themeColors.background || "#ffffff",
      surface: themeColors.surface || "#f5f5f5",
      border: themeColors.border || "#e5e7eb",
      text: themeColors.text || "#111827",
      textMuted: themeColors.textMuted || "#6b7280",
      headingFont: headingFont || "Georgia",
      bodyFont: bodyFont || "Arial",
    }),
    [themeColors, headingFont, bodyFont]
  );

  // Normalize so both legacy {heading,content} and new {elements,layout} formats
  // work, then canonicalize to the outline shape the editors edit. The design
  // engine derives the same roles from any shape, so nothing is lost visually.
  const normalized = normalizePresentation(
    { title: initialTitle, theme: selectedTheme, slides: initialPresentation?.slides || [] },
    themeId
  );
  const [slides, setSlides] = useState(
    normalized.slides.map((s) => toOutlineSlide(s))
  );
  const [title, setTitle] = useState(normalized.title);
  const [isSaving, setIsSaving] = useState(false);
  const [remixingDeck, setRemixingDeck] = useState(false);
  const [remixingIndex, setRemixingIndex] = useState(null);

  // Sync title from state changes if any
  useEffect(() => {
    if (state?.title) {
      setTitle(state.title);
    }
  }, [state?.title]);

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

  /* ================= UPDATE FUNCTIONS (immutable, memo-friendly) ================= */

  const updateHeading = useCallback((index, value) => {
    setSlides((prev) =>
      prev.map((s, i) => (i === index ? updateSlideRole(s, "heading", 0, value) : s))
    );
  }, []);

  const updateBullet = useCallback((slideIndex, bulletIndex, value) => {
    setSlides((prev) =>
      prev.map((s, i) =>
        i === slideIndex ? updateSlideRole(s, "bullet", bulletIndex, value) : s
      )
    );
  }, []);

  const addBullet = useCallback((slideIndex) => {
    setSlides((prev) =>
      prev.map((s, i) => (i === slideIndex ? addSlideRoleBullet(s, "New point") : s))
    );
  }, []);

  const deleteBullet = useCallback((slideIndex, bulletIndex) => {
    setSlides((prev) =>
      prev.map((s, i) =>
        i === slideIndex ? deleteSlideRoleBullet(s, bulletIndex) : s
      )
    );
  }, []);

  const addSlide = useCallback(() => {
    setSlides((prev) => [
      ...prev,
      {
        id: `slide-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
        layout: "header",
        heading: "New Slide Title",
        elements: [
          { type: "heading", content: "New Slide Title" },
          { type: "bullet", content: "", items: ["New slide point 1"] },
        ],
      },
    ]);
  }, []);

  const deleteSlide = useCallback((index) => {
    setSlides((prev) => prev.filter((_, i) => i !== index));
  }, []);

  // Redesign the entire deck: same content, fresh layout + copy from the LLM.
  const handleRemixDeck = useCallback(async () => {
    if (remixingDeck) return;
    setRemixingDeck(true);
    try {
      const remixed = await remixDeck({
        slides,
        themeId,
        textAmount,
      });
      setSlides(remixed);
      toast.success("Deck redesigned — new layout applied");
    } catch (error) {
      console.error(error);
      toast.error(error.message || "Failed to redesign deck");
    } finally {
      setRemixingDeck(false);
    }
  }, [remixingDeck, slides, themeId, textAmount]);

  // Redesign a single slide in place, keeping the rest of the deck untouched.
  const handleRemixSlide = useCallback(
    async (index) => {
      if (remixingIndex !== null) return;
      setRemixingIndex(index);
      try {
        const remixed = await remixSlide({
          slide: slides[index],
          themeId,
          textAmount,
        });
        setSlides((prev) =>
          prev.map((s, i) => (i === index ? remixed : s))
        );
        toast.success("Slide redesigned");
      } catch (error) {
        console.error(error);
        toast.error(error.message || "Failed to redesign slide");
      } finally {
        setRemixingIndex(null);
      }
    },
    [remixingIndex, slides, themeId, textAmount]
  );

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
              aria-label="Presentation title"
              title="Click to rename"
            />
            <span className="text-[10px] text-orange-500 font-bold tracking-wider uppercase mt-0.5 leading-none">
              Outline Editor
            </span>
          </div>
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-2 shrink-0 pr-1">
          <Button
            variant="ghost"
            onClick={handleRemixDeck}
            disabled={remixingDeck || isSaving}
            className="flex items-center gap-1.5 cursor-pointer h-9 px-3 rounded-lg text-sm text-orange-500 hover:text-orange-600 hover:bg-orange-500/10"
          >
            {remixingDeck ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Sparkles className="w-4 h-4" />
            )}
            <span>{remixingDeck ? "Redesigning..." : "Redesign deck"}</span>
          </Button>

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
                themeId,
                fonts: {
                  heading: headingFont,
                  body: bodyFont,
                },
              } 
            })}
            className="flex items-center gap-1.5 cursor-pointer h-9 px-4 rounded-lg text-sm mr-4"
          >
            <Play className="w-4 h-4" data-icon="inline-start" />
            <span>Present</span>
          </Button>
        </div>
      </header>

      {/* Slide Cards Canvas */}
      <div className="flex-1 flex flex-col gap-6 max-w-3xl mx-auto w-full pb-16">
        <AnimatePresence initial={false} mode="popLayout">
          {slides.map((slide, slideIndex) => (
            <SlideCard
              key={slide.id || slideIndex}
              slide={slide}
              slideIndex={slideIndex}
              total={slides.length}
              designTheme={designTheme}
              headingFont={headingFont}
              bodyFont={bodyFont}
              onHeadingChange={updateHeading}
              onBulletChange={updateBullet}
              onAddBullet={addBullet}
              onDeleteBullet={deleteBullet}
              onDeleteSlide={deleteSlide}
              onRemix={handleRemixSlide}
              remixing={remixingIndex === slideIndex}
            />
          ))}
        </AnimatePresence>

        {/* Add Card dashed placeholder */}
        <button
          onClick={addSlide}
          className="w-full border-2 border-dashed border-border hover:border-orange-400 hover:bg-sidebar hover:shadow-xs rounded-2xl py-4 flex items-center justify-center gap-2 cursor-pointer transition-all text-muted-foreground hover:text-orange-500 text-sm font-semibold active:scale-[0.99] bg-sidebar/30"
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