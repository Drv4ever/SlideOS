import { useEffect, useMemo, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { ChevronLeft, ChevronRight, Play, X, Loader2 } from "lucide-react";
import { toast } from "sonner";
import SlideStage from "../components/SlideStage";
import { computeSlideLayout } from "../utils/designedLayouts";
import { getPublicPresentation } from "../services/presentationService";
import { CURATED_LOOKUP } from "../utils/slideModel";

// Public, read-only viewer for shared decks (/share/:id). No editing, no
// auth required — anyone with the link can present the deck.
export default function ShareView() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [deck, setDeck] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeIndex, setActiveIndex] = useState(0);
  const [presenting, setPresenting] = useState(false);

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const res = await getPublicPresentation(id);
        if (active) setDeck(res?.data || null);
      } catch (error) {
        console.error(error);
        if (active) toast.error(error.message || "Could not load this presentation");
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => {
      active = false;
    };
  }, [id]);

  const themeId = deck?.theme || "cornflower";
  const palette = CURATED_LOOKUP[themeId] || CURATED_LOOKUP.cornflower;
  const themeColors = palette.colors || {};
  const customFonts = deck?.content?.fonts || null;
  const headingFont =
    customFonts?.heading || palette.fontFamily?.heading || "Space Grotesk";
  const bodyFont = customFonts?.body || palette.fontFamily?.body || "DM Sans";

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

  const slides = useMemo(() => {
    const content = deck?.content || {};
    if (Array.isArray(content.editorSlides) && content.editorSlides.length) {
      return content.editorSlides;
    }
    return Array.isArray(content.slides) ? content.slides : [];
  }, [deck]);

  useEffect(() => {
    if (!presenting) return;
    const handleKey = (e) => {
      switch (e.key) {
        case "ArrowRight":
        case " ":
        case "PageDown":
          e.preventDefault();
          setActiveIndex((p) => Math.min(slides.length - 1, p + 1));
          break;
        case "ArrowLeft":
        case "PageUp":
          e.preventDefault();
          setActiveIndex((p) => Math.max(0, p - 1));
          break;
        case "Home":
          e.preventDefault();
          setActiveIndex(0);
          break;
        case "End":
          e.preventDefault();
          setActiveIndex(slides.length - 1);
          break;
        case "Escape":
          e.preventDefault();
          setPresenting(false);
          break;
        default:
          break;
      }
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [presenting, slides.length]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-6 h-6 animate-spin text-orange-500" />
      </div>
    );
  }

  if (!deck || slides.length === 0) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center gap-4 p-8 text-center">
        <p className="text-muted-foreground font-medium">
          This presentation is unavailable or no longer shared.
        </p>
        <button
          onClick={() => navigate("/")}
          className="text-sm font-bold text-orange-500 hover:text-orange-600 cursor-pointer bg-transparent border-0 outline-none"
        >
          Go to SlideOS
        </button>
      </div>
    );
  }

  const activeSlide = slides[activeIndex];

  return (
    <div className="min-h-screen bg-muted/60 flex flex-col select-none">
      {/* Top bar */}
      <header className="sticky top-0 z-20 bg-card/80 backdrop-blur-md border-b border-border/60">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-6 h-6 rounded-full bg-orange-500 flex items-center justify-center shrink-0">
              <div className="w-3 h-3 rounded-full bg-white" />
            </div>
            <div className="min-w-0">
              <h1 className="text-sm font-bold text-foreground truncate">
                {deck.title || "Shared Presentation"}
              </h1>
              <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">
                Shared deck · {slides.length} slides
              </span>
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => setPresenting(true)}
              className="flex items-center gap-1.5 bg-orange-500 hover:bg-orange-600 text-white text-xs font-bold px-3 py-1.5 rounded-xl cursor-pointer active:scale-95 transition-all"
            >
              <Play className="w-3.5 h-3.5 fill-current" />
              Present
            </button>
            <Link
              to="/"
              className="text-xs font-bold text-muted-foreground hover:text-foreground px-2 py-1.5 cursor-pointer transition-colors"
            >
              Make your own
            </Link>
          </div>
        </div>
      </header>

      <main className="flex-1 flex flex-col items-center gap-6 py-8 px-4">
        {/* Current slide */}
        <div className="w-full max-w-4xl aspect-video rounded-xl overflow-hidden border border-border/60 shadow-lg bg-white">
          <div className="w-full h-full" style={{ containerType: "inline-size" }}>
            <SlideStage
              desc={computeSlideLayout(activeSlide, designTheme, {
                index: activeIndex,
                total: slides.length,
              })}
              animating={false}
              accentFont={headingFont}
              bodyFont={bodyFont}
            />
          </div>
        </div>

        {/* Controls */}
        <div className="flex items-center gap-4">
          <button
            onClick={() => setActiveIndex((p) => Math.max(0, p - 1))}
            disabled={activeIndex === 0}
            className="flex items-center gap-1.5 bg-card border border-border/80 text-foreground/80 hover:bg-muted disabled:opacity-30 text-xs font-bold px-3 py-2 rounded-xl cursor-pointer active:scale-95 transition-all"
          >
            <ChevronLeft className="w-4 h-4" />
            Prev
          </button>
          <span className="text-xs font-bold text-muted-foreground tracking-wider">
            {activeIndex + 1} / {slides.length}
          </span>
          <button
            onClick={() => setActiveIndex((p) => Math.min(slides.length - 1, p + 1))}
            disabled={activeIndex === slides.length - 1}
            className="flex items-center gap-1.5 bg-card border border-border/80 text-foreground/80 hover:bg-muted disabled:opacity-30 text-xs font-bold px-3 py-2 rounded-xl cursor-pointer active:scale-95 transition-all"
          >
            Next
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        {/* Thumbnails */}
        <div className="flex flex-wrap justify-center gap-2 max-w-4xl">
          {slides.map((slide, index) => (
            <button
              key={slide.id || index}
              onClick={() => setActiveIndex(index)}
              className={`w-28 aspect-video rounded-lg overflow-hidden border-2 transition-all cursor-pointer ${
                index === activeIndex
                  ? "border-orange-500 shadow-md"
                  : "border-border/60 hover:border-foreground/30 opacity-70 hover:opacity-100"
              }`}
              title={`Slide ${index + 1}`}
            >
              <div className="w-full h-full" style={{ containerType: "inline-size" }}>
                <SlideStage
                  desc={computeSlideLayout(slide, designTheme, {
                    index,
                    total: slides.length,
                  })}
                  animating={false}
                  accentFont={headingFont}
                  bodyFont={bodyFont}
                />
              </div>
            </button>
          ))}
        </div>
      </main>

      {/* Present overlay */}
      {presenting && (
        <div className="fixed inset-0 z-50 bg-zinc-950 flex flex-col overflow-hidden">
          <div className="flex items-center justify-between px-6 py-3.5 border-b border-white/5">
            <span className="text-xs font-bold text-zinc-400 uppercase tracking-widest">
              {deck.title || "Shared deck"}
            </span>
            <button
              onClick={() => setPresenting(false)}
              className="flex items-center gap-1.5 bg-zinc-900 border border-white/10 hover:bg-zinc-800 text-white rounded-lg px-3 py-1.5 text-xs font-semibold cursor-pointer transition-all"
            >
              <X className="w-3.5 h-3.5" />
              Exit
            </button>
          </div>
          <div className="flex-1 flex items-center justify-center p-8">
            <div
              className="w-[min(1280px,90vw)] aspect-video overflow-hidden rounded-2xl shadow-2xl"
              style={{ containerType: "inline-size" }}
            >
              <SlideStage
                desc={computeSlideLayout(slides[activeIndex] || {}, designTheme, {
                  index: activeIndex,
                  total: slides.length,
                })}
                animating={false}
                accentFont={headingFont}
                bodyFont={bodyFont}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}