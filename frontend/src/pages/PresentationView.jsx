import { useLocation, useNavigate } from "react-router-dom";
import { useState, useRef, useEffect, useMemo } from "react";
import PptxGenJS from "pptxgenjs";
import { updatePresentation } from "../services/presentationService";
import { CURATED_LOOKUP } from "../utils/slideModel";
import { FONT_CHOICES } from "../utils/themes";
import {
  defineMaster,
  exportSlideWithElements,
} from "../utils/pptxLayouts";
import {
  computeSlideLayout,
  toOutlineSlide,
  updateSlideRole,
  addSlideRoleBullet,
  extractSlideRoles,
} from "../utils/designedLayouts";
import { remixDeck, remixSlide } from "../utils/remix";
import { generateSlideImage } from "../utils/imageGen";
import { toast } from "sonner";
import {
  Copy,
  Type,
  Image as ImageIcon,
  Download,
  Sparkles,
  Wand2,
  Palette,
  Play,
  X,
  ChevronLeft,
  ChevronRight,
  ArrowLeft,
  Layers,
  Save,
  PlusCircle,
  HelpCircle,
  Plus
} from "lucide-react";
import { Button } from "../components/ui/button";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationPrevious,
  PaginationNext,
} from "../components/ui/pagination";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarProvider,
  SidebarTrigger,
} from "../components/ui/sidebar";

// Shared designed slide renderer — same engine as Present & PPTX export
// (computeSlideLayout description -> HTML). Imported from the shared component
// so the Editor/Preview, Present overlay, and export all render identically.
import SlideStage from "../components/SlideStage";

// Design-aware editing canvas — renders the designed slide and overlays the
// edit affordances (click/drag/double-click) that write back to slide roles.
import DesignCanvas from "../components/DesignCanvas";

// Compact designed thumbnail — the SAME rendering engine as the canvas,
// present overlay, and PPTX export (computeSlideLayout -> SlideStage), just
// scaled down. The 16:9 container with containerType: inline-size makes the
// cqw units scale the full design (accent bar, cards, footer, images) 1:1.
function MiniSlide({ slide, theme, index, total, headingFont, bodyFont }) {
  const desc = useMemo(
    () => computeSlideLayout(slide, theme, { index, total }),
    [slide, theme, index, total]
  );
  return (
    <SlideStage
      desc={desc}
      animating={false}
      accentFont={headingFont}
      bodyFont={bodyFont}
    />
  );
}

export default function PresentationView() {
  const { state } = useLocation();
  const navigate = useNavigate();
  const rawSlides = state?.slides || [];
  const editorSlidesFromState = state?.editorSlides || null;
  const presentationId = state?.presentationId || null;
  const themeId = state?.themeId || "custom";
  const fileInputRef = useRef();
  const presentationOverlayRef = useRef(null);
  const incomingTheme = state?.theme;
  const textAmount = state?.textAmount || "detailed";
  
  // Left Sidebar inspector tab state: 'slides' or 'design'
  const [inspectorTab, setInspectorTab] = useState('slides');

  const defaultTheme = (() => {
    const savedTheme = incomingTheme || CURATED_LOOKUP[themeId] || CURATED_LOOKUP.cornflower;
    const colors = savedTheme?.colors || {};
    return {
      primary: colors.primary || "#f97316",
      accent: colors.accent || "#fb923c",
      background: colors.background || "#ffffff",
      surface: colors.surface || "#f5f5f5",
      border: colors.border || "#e5e7eb",
      text: colors.text || "#111827",
      textMuted: colors.textMuted || "#6b7280",
    };
  })();
  const bodyFont =
    incomingTheme?.fontFamily?.body ||
    incomingTheme?.fonts?.body ||
    (CURATED_LOOKUP[themeId]?.fontFamily?.body) ||
    "DM Sans";
  const headingFont =
    incomingTheme?.fontFamily?.heading ||
    incomingTheme?.fonts?.heading ||
    (CURATED_LOOKUP[themeId]?.fontFamily?.heading) ||
    bodyFont;

  // Per-presentation custom fonts (picked in the Design tab, persisted with the
  // deck) override the theme's bundled fonts wherever the deck is rendered.
  const customFonts = state?.fonts || null;
  const resolvedBodyFont = customFonts?.body || bodyFont;
  const resolvedHeadingFont = customFonts?.heading || headingFont;

  // Design theme is state so the Quick Theme buttons actually drive the
  // design engine (accent bar, headings, fills) that every surface renders.
  const [designTheme, setDesignTheme] = useState({
    primary: defaultTheme.primary,
    accent: defaultTheme.accent,
    background: defaultTheme.background,
    surface: defaultTheme.surface,
    border: defaultTheme.border,
    text: defaultTheme.text,
    textMuted: defaultTheme.textMuted,
    headingFont: resolvedHeadingFont || "Georgia",
    bodyFont: resolvedBodyFont || "Arial",
  });

  // Blank slide used when a deck has no slides yet.
  const blankSlide = {
    id: `slide-${Date.now()}`,
    layout: "content-only",
    heading: "New Slide",
    content: [],
    elements: [
      { type: "heading", content: "New Slide" },
      { type: "bullet", content: "", items: [] },
    ],
  };

  // Slides are consumed as-is (outline OR editor format): the design engine
  // (computeSlideLayout) derives the same roles from either schema, so the
  // canvas, present overlay, preview, thumbnails and PPTX all share one truth.
  const [slides, setSlides] = useState(
    editorSlidesFromState?.length
      ? editorSlidesFromState
      : rawSlides.length
        ? rawSlides
        : [blankSlide]
  );
  const [themeIdState, setThemeIdState] = useState(themeId || "cornflower");
  const [activeIndex, setActiveIndex] = useState(0);
  const [selectedBlock, setSelectedBlock] = useState(null);
  const [presentationTitle, setPresentationTitle] = useState(
    state?.title || "My Presentation"
  );
  const [slideNotes, setSlideNotes] = useState(
    state?.slideNotes || (rawSlides.length ? rawSlides.map(() => "") : [""])
  );
  const [isPresenting, setIsPresenting] = useState(false);
  const [presentIndex, setPresentIndex] = useState(0);
  const [isSlideAnimating, setIsSlideAnimating] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [remixingDeck, setRemixingDeck] = useState(false);
  const [remixingSlide, setRemixingSlide] = useState(false);
  const [generatingImage, setGeneratingImage] = useState(false);

  const activeSlide = slides[activeIndex];

  useEffect(() => {
    if (!isPresenting) return;
    setIsSlideAnimating(true);
    const timer = setTimeout(() => setIsSlideAnimating(false), 420);
    return () => clearTimeout(timer);
  }, [presentIndex, isPresenting]);

  const updateSlideBackground = (bg) => {
    const updated = slides.map((slide) => ({ ...slide, background: bg }));
    setSlides(updated);
  };

  // Apply a design theme to the deck: updates the design engine theme (which
  // drives every renderer) and re-tints slide fills.
  const applyTheme = (theme, applyAll = false) => {
    setDesignTheme((prev) => ({
      ...prev,
      background: theme.background?.value ?? theme.background ?? prev.background,
      text: theme.textColor || prev.text,
      textMuted: theme.textColor ? `${theme.textColor}B3` : prev.textMuted,
      primary: theme.accent || prev.primary,
      accent: theme.accent || prev.accent,
      headingFont: theme.fontFamily || prev.headingFont,
      bodyFont: theme.fontFamily || prev.bodyFont,
    }));
    const updated = slides.map((slide, i) =>
      applyAll || i === activeIndex
        ? { ...slide, background: theme.background ?? slide.background }
        : slide
    );
    setSlides(updated);
  };

    // ---- Design-block editing (canvas) -----------------------------
  // Content edits write back to the source roles (updateSlideRole) and moves /
  // sizes go into design.overrides that computeSlideLayout honors — so the
  // canvas, present overlay, preview, thumbnails and PPTX stay in sync.

  const updateOverrides = (mutator) => {
    setSlides((prev) =>
      prev.map((s, i) =>
        i === activeIndex
          ? {
              ...s,
              design: {
                ...(s.design || {}),
                overrides: mutator(s.design?.overrides || {}),
              },
            }
          : s
      )
    );
  };

  const handleBlockSelect = (block) => {
    setSelectedBlock({
      role: block.role,
      index: block.index,
      size: block.size,
      font: block.font,
    });
  };

  const handleBlockUpdate = (role, index, value) => {
    setSlides((prev) =>
      prev.map((s, i) => (i === activeIndex ? updateSlideRole(s, role, index, value) : s))
    );
  };

  const handleBlockMove = (role, index, pos) => {
    updateOverrides((ov) => {
      if (role === "heading") {
        return { ...ov, heading: { ...(ov.heading || {}), ...pos } };
      }
      const bullets = [...(ov.bullets || [])];
      while (bullets.length <= index) bullets.push({});
      bullets[index] = { ...(bullets[index] || {}), ...pos };
      return { ...ov, bullets };
    });
  };

  const handleBlockSize = (role, index, size) => {
    const clamped = Math.min(96, Math.max(10, Number(size) || 16));
    setSelectedBlock((prev) => (prev ? { ...prev, size: clamped } : prev));
    updateOverrides((ov) => {
      if (role === "heading") {
        return { ...ov, heading: { ...(ov.heading || {}), size: clamped } };
      }
      const bullets = [...(ov.bullets || [])];
      while (bullets.length <= index) bullets.push({});
      bullets[index] = { ...(bullets[index] || {}), size: clamped };
      return { ...ov, bullets };
    });
  };

  // Per-block font override: written into design.overrides so the canvas,
  // thumbnails, present overlay and PPTX export all render the same font.
  const handleBlockFont = (role, index, font) => {
    setSelectedBlock((prev) => (prev ? { ...prev, font } : prev));
    updateOverrides((ov) => {
      if (role === "heading") {
        return { ...ov, heading: { ...(ov.heading || {}), font } };
      }
      const bullets = [...(ov.bullets || [])];
      while (bullets.length <= index) bullets.push({});
      bullets[index] = { ...(bullets[index] || {}), font };
      return { ...ov, bullets };
    });
  };

  const removeCanvasImage = () => {
    setSlides((prev) =>
      prev.map((s, i) => {
        if (i !== activeIndex) return s;
        const next = { ...s };
        if (next.elements?.some((el) => el.type === "image" && el.zIndex !== 0)) {
          next.elements = next.elements.filter(
            (el) => !(el.type === "image" && el.zIndex !== 0)
          );
        } else if (next.image) {
          next.image = null;
        } else if (next.background?.type === "image") {
          next.background = { type: "color", value: designTheme.background };
        }
        return next;
      })
    );
  };

  const updateSlideNote = (index, value) => {
    const updatedNotes = [...slideNotes];
    updatedNotes[index] = value;
    setSlideNotes(updatedNotes);
  };

  // Redesign the whole deck in place (same content, fresh layout + copy).
  const handleRemixDeck = async () => {
    if (remixingDeck) return;
    setRemixingDeck(true);
    try {
      const remixed = await remixDeck({
        slides,
        themeId: themeIdState,
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
  };

  // Redesign only the active slide.
  const handleRemixSlide = async () => {
    if (remixingSlide) return;
    setRemixingSlide(true);
    try {
      const remixed = await remixSlide({
        slide: activeSlide,
        themeId: themeIdState,
        textAmount,
      });
      setSlides((prev) =>
        prev.map((s, i) => (i === activeIndex ? remixed : s))
      );
      toast.success("Slide redesigned");
    } catch (error) {
      console.error(error);
      toast.error(error.message || "Failed to redesign slide");
    } finally {
      setRemixingSlide(false);
    }
  };

  // AI image generation for the active slide. The resulting URL flows through
  // the same image slot (foreground element or slide.image) every renderer
  // (canvas, thumbnails, present, PPTX export) already consumes.
  const handleGenerateImage = async () => {
    if (generatingImage) return;
    const roles = extractSlideRoles(activeSlide);
    const imagePrompt =
      [
        roles.heading,
        ...(roles.bullets || []).slice(0, 2),
      ]
        .filter((t) => t && String(t).trim())
        .join(" — ") || activeSlide?.imageKeyword || "Abstract presentation visual";
    setGeneratingImage(true);
    try {
      const url = await generateSlideImage(imagePrompt);
      setSlides((prev) =>
        prev.map((s, i) => {
          if (i !== activeIndex) return s;
          const elements = Array.isArray(s.elements) ? s.elements : [];
          if (elements.some((el) => el.type === "image" && el.zIndex !== 0)) {
            return {
              ...s,
              elements: elements.map((el) =>
                el.type === "image" && el.zIndex !== 0 ? { ...el, src: url } : el
              ),
            };
          }
          return {
            ...s,
            image: { url, thumb: url, alt: "AI generated image" },
          };
        })
      );
      toast.success("AI image generated");
    } catch (error) {
      console.error(error);
      toast.error(error.message || "Failed to generate image");
    } finally {
      setGeneratingImage(false);
    }
  };

  const duplicateSlide = () => {
    const original = slides[activeIndex];
    if (!original) return;

    const copy = {
      ...original,
      elements: Array.isArray(original.elements)
        ? original.elements.map((el) => ({
            ...el,
            id: `${el.id}-copy-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
          }))
        : original.elements,
      design: original.design
        ? JSON.parse(JSON.stringify(original.design))
        : undefined,
    };

    const updatedSlides = [...slides];
    updatedSlides.splice(activeIndex + 1, 0, copy);
    setSlides(updatedSlides);

    const updatedNotes = [...slideNotes];
    updatedNotes.splice(activeIndex + 1, 0, slideNotes[activeIndex] || "");
    setSlideNotes(updatedNotes);
  };

  const deleteSlide = (indexToDelete) => {
    if (slides.length === 1) return;

    const updatedSlides = slides.filter((_, index) => index !== indexToDelete);
    const updatedNotes = slideNotes.filter((_, index) => index !== indexToDelete);

    setSlides(updatedSlides);
    setSlideNotes(updatedNotes);

    if (activeIndex >= updatedSlides.length) {
      setActiveIndex(updatedSlides.length - 1);
    } else if (activeIndex === indexToDelete) {
      setActiveIndex(Math.max(0, activeIndex - 1));
    }
  };

  const addNewSlide = () => {
    const newS = {
      background: {
        type: "color",
        value: defaultTheme.background,
      },
      layoutPattern: "content-only",
      elements: [
        {
          id: `title-${Date.now()}`,
          type: "text",
          content: "Enter Title",
          x: 100,
          y: 80,
          fontSize: 36,
          bold: true,
          color: defaultTheme.text,
          width: 860,
          height: 60,
          fontFamily: resolvedHeadingFont,
        }
      ]
    };
    const updatedSlides = [...slides];
    updatedSlides.splice(activeIndex + 1, 0, newS);
    setSlides(updatedSlides);
    
    const updatedNotes = [...slideNotes];
    updatedNotes.splice(activeIndex + 1, 0, "");
    setSlideNotes(updatedNotes);
    setActiveIndex(activeIndex + 1);
  };

  const addTextBox = () => {
    // Appends to the canonical bullet source so the design engine sees the new
    // point regardless of the slide's schema (text elements / bullet element /
    // content array).
    setSlides((prev) =>
      prev.map((s, i) => (i === activeIndex ? addSlideRoleBullet(s, "Edit text") : s))
    );
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = function (event) {
      setSlides((prev) =>
        prev.map((s, i) => {
          if (i !== activeIndex) return s;
          const elements = Array.isArray(s.elements) ? s.elements : [];
          if (elements.some((el) => el.type === "image" && el.zIndex !== 0)) {
            return {
              ...s,
              elements: [
                ...elements,
                {
                  id: `img-${Date.now()}`,
                  type: "image",
                  src: event.target.result,
                  x: 200,
                  y: 200,
                  width: 300,
                  height: 200,
                  zIndex: 1,
                },
              ],
            };
          }
          return {
            ...s,
            image: {
              url: event.target.result,
              thumb: event.target.result,
              alt: "slide image",
            },
          };
        })
      );
    };
    reader.readAsDataURL(file);
  };

  const exportPPT = async () => {
    const pres = new PptxGenJS();
    pres.layout = "LAYOUT_16x9";

    const cleanHex = (hex) => (hex || "").replace("#", "");

    const themeColors = {
      primary: cleanHex(designTheme.primary),
      accent: cleanHex(designTheme.accent),
      background: cleanHex(designTheme.background),
      text: cleanHex(designTheme.text),
      textMuted: cleanHex(designTheme.textMuted),
    };

    defineMaster(pres, themeColors);

    for (const slideData of slides) {
      const slide = pres.addSlide({ masterName: "MODERN_MASTER" });
      // Shared design engine: same layout description the Presentation View renders,
      // so the PowerPoint export matches the on-screen deck (blocks, cards, images).
      await exportSlideWithElements(
        slide,
        slideData,
        themeColors,
        designTheme.bodyFont,
        designTheme.headingFont,
        { index: slides.indexOf(slideData), total: slides.length }
      );
    }

await pres.writeFile({ fileName: `${presentationTitle || "Presentation"}.pptx` });
  };

  const goToPresentMode = () => {
    setPresentIndex(activeIndex);
    setIsPresenting(true);
  };

  const closePresentMode = async () => {
    setIsPresenting(false);
    if (document.fullscreenElement) {
      try {
        await document.exitFullscreen();
      } catch (error) {
        // Ignore exit fullscreen errors
      }
    }
  };

  const presentPrev = () => {
    setPresentIndex((prev) => Math.max(0, prev - 1));
  };

  const presentNext = () => {
    setPresentIndex((prev) => Math.min(slides.length - 1, prev + 1));
  };

  const startFullscreenPresent = async () => {
    goToPresentMode();
    setTimeout(async () => {
      if (!presentationOverlayRef.current) return;
      if (document.fullscreenElement) return;
      try {
        await presentationOverlayRef.current.requestFullscreen();
      } catch (error) {
        // Fallback works without full screen
      }
    }, 0);
  };

  const themeButtons = [
    {
      label: "Selected Theme",
      apply: () => {
        setThemeIdState(themeId || "cornflower");
        applyTheme(
          {
            background: { type: "color", value: defaultTheme.background },
            textColor: defaultTheme.text,
            accent: defaultTheme.accent,
            fontFamily: bodyFont,
          },
          true
        );
      },
    },
    {
      label: "MS Fluent",
      apply: () => {
        setThemeIdState("fluent");
        applyTheme({
          background: { type: "color", value: "#f3f2f1" },
          textColor: "#201f1e",
          fontFamily: "Segoe UI",
        }, true);
      },
    },
    {
      label: "Noir Slate",
      apply: () => {
        setThemeIdState("noir");
        applyTheme({
          background: { type: "color", value: "#0f172a" },
          textColor: "#f8fafc",
        }, true);
      },
    },
    {
      label: "Deep Indigo",
      apply: () => {
        setThemeIdState("indigo");
        applyTheme({
          background: {
            type: "gradient",
            value: "linear-gradient(135deg, #ea580c, #fb923c)",
          },
          textColor: "#ffffff",
        }, true);
      },
    },
    {
      label: "Clean Light",
      apply: () => {
        setThemeIdState("plain");
        applyTheme({
          background: { type: "color", value: "#ffffff" },
          textColor: "#0f172a",
        }, true);
      },
    },
  ];

  // Canonical outline conversion: derives heading/content/image through the
  // same extractSlideRoles the design engine uses, so saving/round-tripping
  // never changes how a slide looks.
  const outlineSlides = slides.map((s) => toOutlineSlide(s));

  const handleSavePresentation = async () => {
    if (!presentationId) {
      alert("No saved presentation id found for update.");
      return;
    }

    try {
      setIsSaving(true);
      await updatePresentation(presentationId, {
        title: presentationTitle.trim() || "Untitled Presentation",
        theme: themeIdState,
        slidesCount: slides.length,
        content: {
          slides: outlineSlides,
          editorSlides: slides,
          slideNotes,
          textAmount,
          fonts: {
            heading: designTheme.headingFont,
            body: designTheme.bodyFont,
          },
        },
      });
      
      // Dispatch refresh event to update sidebar
      window.dispatchEvent(new CustomEvent('refresh-sidebar-decks'));
      alert("Presentation saved successfully");
    } catch (error) {
      alert(error.message || "Failed to save presentation");
    } finally {
      setIsSaving(false);
    }
  };

  const getPageNumbers = () => {
    const total = slides.length;
    const current = activeIndex + 1;
    const pages = [];
    if (total <= 7) {
      for (let i = 1; i <= total; i++) pages.push(i);
    } else {
      pages.push(1);
      if (current > 3) pages.push('...');
      const start = Math.max(2, current - 1);
      const end = Math.min(total - 1, current + 1);
      for (let i = start; i <= end; i++) pages.push(i);
      if (current < total - 2) pages.push('...');
      pages.push(total);
    }
    return pages;
  };

  const presentDesc = isPresenting
    ? computeSlideLayout(slides[presentIndex] || {}, designTheme, {
        index: presentIndex,
        total: slides.length,
      })
    : null;

  return (
    <SidebarProvider className="bg-muted text-foreground font-sans select-none">
      <Sidebar collapsible="offcanvas" variant="sidebar">
        
        <SidebarHeader>
        <div className="flex flex-col p-4">
          <button 
            onClick={() => navigate("/preview", { 
              state: {
                presentation: { slides: outlineSlides },
                presentationId,
                title: presentationTitle,
                themeId,
                textAmount,
                fonts: {
                  heading: designTheme.headingFont,
                  body: designTheme.bodyFont,
                },
              } 
            })}
            className="flex items-center gap-1 text-[11px] font-bold uppercase tracking-wider text-muted-foreground hover:text-foreground transition-colors w-fit cursor-pointer mb-3"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span className="group-data-[collapsible=icon]:hidden">Back to Outline</span>
          </button>
          
          <input
            value={presentationTitle}
            onChange={(e) => setPresentationTitle(e.target.value)}
            placeholder="Untitled Presentation"
            className="w-full text-base font-bold text-foreground bg-transparent border-b border-transparent focus:border-orange-500/80 outline-none pb-0.5"
            title="Click to rename presentation"
          />
        </div>
      </SidebarHeader>

      <SidebarContent>
        {/* Tab Selection */}
        <div className="flex p-1 bg-muted/70 mx-3 rounded-xl gap-1">
          <button
            onClick={() => setInspectorTab('slides')}
            className={`flex items-center justify-center gap-1.5 flex-1 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              inspectorTab === 'slides' ? 'bg-sidebar-accent text-sidebar-accent-foreground shadow-2xs border border-border/50' : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            <Layers className="w-3.5 h-3.5 shrink-0" />
            <span className="group-data-[collapsible=icon]:hidden">Slides</span>
          </button>
          <button
            onClick={() => setInspectorTab('design')}
            className={`flex items-center justify-center gap-1.5 flex-1 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              inspectorTab === 'design' ? 'bg-sidebar-accent text-sidebar-accent-foreground shadow-2xs border border-border/50' : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            <Palette className="w-3.5 h-3.5 shrink-0" />
            <span className="group-data-[collapsible=icon]:hidden">Design</span>
          </button>
        </div>

        {/* Tab Contents - flex-col with overflow-hidden to allow children to scroll cleanly */}
        <div className="flex-1 flex flex-col min-h-0 px-4 pb-4 overflow-hidden">
          {inspectorTab === 'slides' ? (
            /* SLIDES LIST TAB */
            <div className="flex-1 flex flex-col min-h-0 gap-4">
              
              {/* Quick Actions Panel */}
              <div className="flex flex-col gap-2 shrink-0">
                <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest leading-none mb-1">
                  Actions
                </span>
                <div className="grid grid-cols-2 gap-2">
                  <button onClick={duplicateSlide} className="flex items-center justify-center gap-1.5 py-2 border border-border rounded-xl bg-sidebar-accent hover:bg-sidebar-accent/80 text-xs font-bold text-sidebar-accent-foreground transition-all cursor-pointer">
                    <Copy className="w-3.5 h-3.5 text-muted-foreground" />
                    <span>Duplicate</span>
                  </button>
                  <button onClick={addNewSlide} className="flex items-center justify-center gap-1.5 py-2 border border-border rounded-xl bg-sidebar-accent hover:bg-sidebar-accent/80 text-xs font-bold text-sidebar-accent-foreground transition-all cursor-pointer">
                    <Plus className="w-3.5 h-3.5 text-muted-foreground" />
                    <span>Add Slide</span>
                  </button>
                  <button onClick={addTextBox} className="flex items-center justify-center gap-1.5 py-2 border border-border rounded-xl bg-sidebar-accent hover:bg-sidebar-accent/80 text-xs font-bold text-sidebar-accent-foreground transition-all cursor-pointer">
                    <Type className="w-3.5 h-3.5 text-muted-foreground" />
                    <span>Add Text</span>
                  </button>
                  <button onClick={() => fileInputRef.current.click()} className="flex items-center justify-center gap-1.5 py-2 border border-border rounded-xl bg-sidebar-accent hover:bg-sidebar-accent/80 text-xs font-bold text-sidebar-accent-foreground transition-all cursor-pointer">
                    <ImageIcon className="w-3.5 h-3.5 text-muted-foreground" />
                    <span>Add Image</span>
                  </button>
                  <button onClick={handleRemixSlide} disabled={remixingSlide} className="flex items-center justify-center gap-1.5 py-2 border border-border rounded-xl bg-sidebar-accent hover:bg-sidebar-accent/80 text-xs font-bold text-sidebar-accent-foreground transition-all cursor-pointer disabled:opacity-50 disabled:cursor-wait">
                    {remixingSlide ? <Loader2 className="w-3.5 h-3.5 animate-spin text-muted-foreground" /> : <Sparkles className="w-3.5 h-3.5 text-muted-foreground" />}
                    <span>Remix Slide</span>
                  </button>
                  <button onClick={handleGenerateImage} disabled={generatingImage} className="flex items-center justify-center gap-1.5 py-2 border border-border rounded-xl bg-sidebar-accent hover:bg-sidebar-accent/80 text-xs font-bold text-sidebar-accent-foreground transition-all cursor-pointer disabled:opacity-50 disabled:cursor-wait">
                    {generatingImage ? <Loader2 className="w-3.5 h-3.5 animate-spin text-muted-foreground" /> : <Wand2 className="w-3.5 h-3.5 text-muted-foreground" />}
                    <span>AI Image</span>
                  </button>
                </div>
              </div>

              <input
                type="file"
                accept="image/*"
                ref={fileInputRef}
                className="hidden"
                onChange={handleImageUpload}
              />

              {/* Thumbnails list - flex-1 with min-h-0 and overflow-y-auto is the single scrollbar container */}
              <div className="flex-1 flex flex-col min-h-0 gap-2">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest leading-none">
                    Slide Deck ({slides.length})
                  </span>
                </div>
                
                <div className="flex-1 overflow-y-auto pr-1 flex flex-col gap-3.5 mt-1 scroll-smooth [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-border [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:hover:bg-foreground/20">
                  {slides.map((slide, index) => (
                    <div
                      key={index}
                      onClick={() => setActiveIndex(index)}
                      className={`flex flex-col p-2.5 rounded-xl border-2 text-left cursor-pointer transition-all hover:shadow-xs group relative ${
                        index === activeIndex
                          ? "border-orange-500 bg-sidebar-accent/80 shadow-xs"
                          : "border-border bg-sidebar-accent hover:border-border"
                      }`}
                    >
                      <div className="flex justify-between items-center mb-1.5">
                        <span className={`text-[10px] font-bold ${index === activeIndex ? 'text-orange-500' : 'text-muted-foreground'}`}>
                          SLIDE {(index + 1).toString().padStart(2, '0')}
                        </span>
                        
                        {slides.length > 1 && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              deleteSlide(index);
                            }}
                            className="text-muted-foreground/70 hover:text-red-500 hover:bg-muted p-0.5 rounded-md opacity-0 group-hover:opacity-100 transition-all cursor-pointer"
                            title="Remove slide"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>

                      {/* Mini Slide Canvas Preview Box */}
                      <div
                        className="w-full aspect-video rounded-lg border border-border overflow-hidden relative shadow-[inset_0_1px_3px_rgba(0,0,0,0.02)]"
                        style={{
                          background: "var(--sidebar-accent)",
                          containerType: "inline-size",
                        }}
                      >
                        {/* Microsoft Fluent Theme Mini Accents */}
                        {themeIdState === "fluent" && (
                          <>
                            <div className="absolute -top-3 -right-3 w-8 h-8 rounded-full bg-cyan-400/20 blur-xs pointer-events-none z-0" />
                            <div className="absolute -bottom-4 -left-4 w-9 h-9 rounded-full bg-purple-500/10 blur-xs pointer-events-none z-0" />
                            <div className="absolute top-0 left-0 right-0 h-0.5 bg-orange-500 pointer-events-none z-0" />
                          </>
                        )}
                        <MiniSlide
                          slide={slide}
                          theme={designTheme}
                          index={index}
                          total={slides.length}
                          headingFont={designTheme.headingFont}
                          bodyFont={designTheme.bodyFont}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            /* DESIGN CONFIGS TAB - Single scrollbar if contents grow */
            <div className="flex flex-col gap-5 text-left overflow-y-auto pr-1 flex-1 scroll-smooth [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-border [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:hover:bg-foreground/20">
              
              {/* Background Color Picker */}
              <div className="flex flex-col gap-2 shrink-0">
                <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest leading-none">
                  Slide Fill Color
                </span>
                <div className="flex items-center gap-3">
                  <input
                    type="color"
                    value={
                      activeSlide?.background?.type === "color"
                        ? activeSlide.background.value
                        : designTheme.background
                    }
                    onChange={(e) =>
                      updateSlideBackground({
                        type: "color",
                        value: e.target.value,
                      })
                    }
                    className="w-12 h-10 border-0 rounded-xl cursor-pointer bg-transparent shrink-0 shadow-sm outline-none"
                  />
                  <div className="flex-1 text-xs text-sidebar-accent-foreground font-mono select-all bg-sidebar-accent border border-border py-2 px-3 rounded-xl shadow-2xs">
                    {activeSlide?.background?.value || designTheme.background}
                  </div>
                </div>
              </div>

              {/* Layout Patterns Selection */}
              {/* Theme buttons grid */}
              <div className="flex flex-col gap-2.5">
                <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest leading-none">
                  Quick Themes
                </span>
                <div className="grid grid-cols-2 gap-2">
                  {themeButtons.map((item) => (
                    <button 
                      key={item.label} 
                      onClick={item.apply} 
                      className="flex items-center gap-1.5 justify-center py-2 px-1 border border-border rounded-xl bg-sidebar-accent hover:bg-sidebar-accent/80 text-xs font-bold text-sidebar-accent-foreground transition-all cursor-pointer active:scale-[0.98]"
                    >
                      <Palette className="w-3.5 h-3.5 text-orange-500" />
                      <span>{item.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Fonts */}
              <div className="flex flex-col gap-2.5">
                <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest leading-none">
                  Fonts
                </span>
                <div className="flex flex-col gap-2">
                  <label htmlFor="heading-font" className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">
                    Heading font
                  </label>
                  <select
                    id="heading-font"
                    value={designTheme.headingFont}
                    onChange={(e) =>
                      setDesignTheme((prev) => ({ ...prev, headingFont: e.target.value }))
                    }
                    className="w-full bg-sidebar-accent border border-border/80 rounded-xl px-3 py-2.5 text-sm text-sidebar-accent-foreground focus:ring-1.5 focus:ring-orange-500/25 focus:border-orange-500 outline-none transition-all cursor-pointer"
                  >
                    {FONT_CHOICES.map((f) => (
                      <option key={f.value} value={f.value}>{f.label}</option>
                    ))}
                  </select>

                  <label htmlFor="body-font" className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">
                    Body font
                  </label>
                  <select
                    id="body-font"
                    value={designTheme.bodyFont}
                    onChange={(e) =>
                      setDesignTheme((prev) => ({ ...prev, bodyFont: e.target.value }))
                    }
                    className="w-full bg-sidebar-accent border border-border/80 rounded-xl px-3 py-2.5 text-sm text-sidebar-accent-foreground focus:ring-1.5 focus:ring-orange-500/25 focus:border-orange-500 outline-none transition-all cursor-pointer"
                  >
                    {FONT_CHOICES.map((f) => (
                      <option key={f.value} value={f.value}>{f.label}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Speaker Notes */}
              <div className="flex flex-col gap-2 flex-1 min-h-[140px]">
                <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest leading-none">
                  Presenter Notes
                </span>
                <textarea
                  value={slideNotes[activeIndex] || ""}
                  onChange={(e) => updateSlideNote(activeIndex, e.target.value)}
                  placeholder="Write speaker notes here to guide your talk..."
                  className="w-full border border-border rounded-xl p-3 text-xs text-sidebar-accent-foreground bg-sidebar-accent focus:ring-1.5 focus:ring-orange-500/20 focus:border-orange-500 outline-none resize-none leading-relaxed flex-1 shadow-2xs"
                />
              </div>

            </div>
          )}
        </div>
      </SidebarContent>

      <SidebarFooter>
        <div className="flex justify-between items-center text-[10px] font-bold text-muted-foreground uppercase tracking-wide group-data-[collapsible=icon]:hidden">
          <div className="flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-orange-500" />
            <span>SlideOS Design</span>
          </div>
          <span>v2.1</span>
        </div>
      </SidebarFooter>
    </Sidebar>

    <div className="flex flex-1 flex-col h-screen overflow-hidden relative">
      {/* 2. MAIN CANVAS VIEWPORT */}
      <main className="flex-1 flex flex-col h-full overflow-hidden relative">
        
        {/* Floating Context Toolbar */}
        <div className="w-full p-6 flex justify-center relative z-10">
          <div className="bg-card/80 backdrop-blur-md border border-border/90 rounded-2xl p-2.5 flex items-center flex-wrap gap-3 shadow-[0_20px_48px_-10px_rgba(15,23,42,0.08),0_4px_16px_rgba(15,23,42,0.02)]">
            
            <SidebarTrigger className="mr-1" />

            {/* Left Toolbar Side: Selected Element controls */}
            <div className="flex items-center gap-3">
              <Pagination className="w-auto mx-0">
                <PaginationContent>
                  <PaginationItem>
                    <PaginationPrevious
                      href="#"
                      onClick={(e) => { e.preventDefault(); if (activeIndex > 0) setActiveIndex(activeIndex - 1); }}
                      className={`${activeIndex === 0 ? 'pointer-events-none opacity-30' : ''} [&_svg]:size-4`}
                    />
                  </PaginationItem>
                  {getPageNumbers().map((page, i) =>
                    page === '...' ? (
                      <PaginationItem key={`e${i}`}>
                        <PaginationEllipsis className="[&_svg]:size-3.5 text-muted-foreground" />
                      </PaginationItem>
                    ) : (
                      <PaginationItem key={page}>
                        <PaginationLink
                          href="#"
                          onClick={(e) => { e.preventDefault(); setActiveIndex(page - 1); }}
                          isActive={activeIndex === page - 1}
                          size="icon"
                          className="text-xs font-bold w-7 h-7"
                        >
                          {page}
                        </PaginationLink>
                      </PaginationItem>
                    )
                  )}
                  <PaginationItem>
                    <PaginationNext
                      href="#"
                      onClick={(e) => { e.preventDefault(); if (activeIndex < slides.length - 1) setActiveIndex(activeIndex + 1); }}
                      className={`${activeIndex === slides.length - 1 ? 'pointer-events-none opacity-30' : ''} [&_svg]:size-4`}
                    />
                  </PaginationItem>
                </PaginationContent>
              </Pagination>

              {selectedBlock && (
                <div className="flex items-center gap-2 border-l border-border pl-3">
                  <span className="text-xs font-semibold text-muted-foreground">
                    Font:
                  </span>
                  <select
                    value={
                      selectedBlock.font ||
                      (selectedBlock.role === "heading"
                        ? designTheme.headingFont
                        : designTheme.bodyFont)
                    }
                    onChange={(e) =>
                      handleBlockFont(
                        selectedBlock.role,
                        selectedBlock.index,
                        e.target.value
                      )
                    }
                    className="bg-card border border-border/80 rounded-lg px-2 py-1 text-xs text-foreground outline-none focus:ring-1.5 focus:ring-orange-500/25 focus:border-orange-500 cursor-pointer"
                  >
                    {FONT_CHOICES.map((f) => (
                      <option key={f.value} value={f.value}>{f.label}</option>
                    ))}
                  </select>
                  <span className="text-xs font-semibold text-muted-foreground">
                    {selectedBlock.role === "heading" ? "Heading size:" : "Text size:"}
                  </span>
                  <input
                    type="number"
                    min={10}
                    max={96}
                    value={selectedBlock.size || 16}
                    onChange={(e) =>
                      handleBlockSize(selectedBlock.role, selectedBlock.index, e.target.value)
                    }
                    className="w-16 border border-border/80 rounded-lg px-2 py-1 text-xs font-mono text-center outline-none focus:ring-1.5 focus:ring-orange-500/20 focus:border-orange-500"
                  />
                </div>
              )}
            </div>

            {/* Right Action buttons */}
            <div className="flex items-center gap-2">
              <button
                onClick={handleRemixDeck}
                disabled={remixingDeck}
                className="flex items-center gap-1.5 bg-card border border-border/95 text-foreground/80 hover:bg-muted disabled:opacity-50 disabled:cursor-wait transition-all font-bold px-3 py-1.5 rounded-xl text-xs cursor-pointer active:scale-95 shadow-2xs"
              >
                {remixingDeck ? (
                  <Loader2 className="w-4 h-4 animate-spin text-orange-500" />
                ) : (
                  <Sparkles className="w-4 h-4 text-orange-500" />
                )}
                <span>{remixingDeck ? "Redesigning..." : "Redesign"}</span>
              </button>

              <button
                onClick={exportPPT}
                className="flex items-center gap-1.5 bg-card border border-border/95 text-foreground/80 hover:bg-muted transition-all font-bold px-3 py-1.5 rounded-xl text-xs cursor-pointer active:scale-95 shadow-2xs"
              >
                <Download className="w-4 h-4 text-muted-foreground" />
                <span>Export PPTX</span>
              </button>

              <button
                onClick={handleSavePresentation}
                disabled={!presentationId || isSaving}
                className="flex items-center gap-1.5 bg-card border border-border/95 text-foreground/80 hover:bg-muted disabled:opacity-50 transition-all font-bold px-3 py-1.5 rounded-xl text-xs cursor-pointer active:scale-95 shadow-2xs"
              >
                <Save className="w-4 h-4 text-muted-foreground" />
                <span>Save</span>
              </button>

              <button
                onClick={startFullscreenPresent}
                className="flex items-center gap-1.5 bg-orange-500 hover:bg-orange-600 text-white shadow-sm font-semibold px-4 py-1.5 rounded-xl text-xs cursor-pointer active:scale-95 transition-all border-t border-white/35 border-x border-white/15 border-b-0 shadow-[inset_0_1px_0_rgba(255,255,255,0.35),0_4px_12px_rgba(249,115,22,0.25)]"
              >
                <Play className="w-3.5 h-3.5 fill-current" />
                <span>Present</span>
              </button>
            </div>
          </div>
        </div>

        {/* Dynamic Canvas Drafting Table Viewport */}
        <div 
          onClick={() => setSelectedBlock(null)}
          className="flex-1 flex justify-center items-center overflow-auto relative p-8 select-none cursor-default"
          style={{
            backgroundColor: "var(--muted)",
            backgroundImage: `
              radial-gradient(circle at 50% 50%, rgba(99, 102, 241, 0.08) 0%, transparent 70%),
              linear-gradient(rgba(148, 163, 184, 0.06) 1px, transparent 1px),
              linear-gradient(90deg, rgba(148, 163, 184, 0.06) 1px, transparent 1px)
            `,
            backgroundSize: "auto, 24px 24px, 24px 24px"
          }}
        >
{/* THE PHYSICAL SLIDE CARD — design-aware canvas */}
           <div
             style={{
               width: 1100,
               height: 618,
               position: "relative",
             }}
             className="rounded-2xl shadow-[0_24px_70px_rgba(15,23,42,0.08)] border border-border/50 overflow-hidden shrink-0 select-none"
           >
             <DesignCanvas
               slide={activeSlide}
               theme={designTheme}
               meta={{ index: activeIndex, total: slides.length }}
               headingFont={designTheme.headingFont}
               bodyFont={designTheme.bodyFont}
               selected={selectedBlock}
               onSelect={handleBlockSelect}
               onUpdate={handleBlockUpdate}
               onMove={handleBlockMove}
               onSize={handleBlockSize}
               onRemoveImage={removeCanvasImage}
             />
           </div>
        </div>
      </main>

      {/* 3. CINEMATIC FULLSCREEN PRESENTATION STAGE OVERLAY */}
      {isPresenting && (
        <div
          ref={presentationOverlayRef}
          className="fixed inset-0 z-999 bg-zinc-950 flex flex-col overflow-hidden select-none"
        >
          {/* Top Stage bar */}
          <div className="px-6 py-3.5 flex items-center justify-between border-b border-white/5 select-none relative z-10 bg-zinc-950/80 backdrop-blur-md">
            <div className="text-xs font-bold text-zinc-400 uppercase tracking-widest font-sans flex items-center gap-1.5">
              <span className="text-orange-400 font-extrabold animate-pulse">â—</span>
              <span>Presenting: {presentationTitle || "Untitled deck"}</span>
            </div>
            
            <button
              onClick={closePresentMode}
              className="flex items-center gap-1.5 bg-zinc-900 border border-white/10 hover:bg-zinc-800 text-white rounded-lg px-3 py-1.5 cursor-pointer text-xs font-semibold transition-all active:scale-95"
            >
              <X className="w-3.5 h-3.5" />
              <span>Exit Player</span>
            </button>
          </div>

          {/* Cinematic Viewport Stage */}
          <div className="flex-1 flex items-center justify-center gap-6 p-10 relative">
            
            {/* Ambient Background Backlight Glow */}
            <div 
              className="absolute w-2/3 h-2/3 pointer-events-none blur-[140px] opacity-25 rounded-full transition-all duration-500"
              style={{
                background: presentDesc?.background?.css || "#ffffff"
              }}
            />

            {/* Left Stage Zone Navigation */}
            <button
              onClick={presentPrev}
              disabled={presentIndex === 0}
              className={`z-10 flex items-center justify-center w-12 h-12 rounded-full border border-white/10 bg-card/5 hover:bg-card/10 text-white shadow-xl active:scale-95 transition-all ${
                presentIndex === 0 ? "cursor-not-allowed opacity-15" : "cursor-pointer opacity-80 hover:opacity-100"
              }`}
            >
              <ChevronLeft className="w-6 h-6" />
            </button>

{/* Slide Deck Container */}
            <div
              style={{
                width: "min(1280px, 90vw)",
                aspectRatio: "16 / 9",
                background: "transparent",
                containerType: "inline-size",
                transition: "opacity 320ms ease, transform 320ms ease",
                opacity: isSlideAnimating ? 0.6 : 1,
                transform: isSlideAnimating ? "scale(0.985)" : "scale(1)",
              }}
              className="rounded-2xl overflow-hidden relative shadow-[0_30px_90px_rgba(0,0,0,0.45)] select-none"
            >
              {/* Microsoft Fluent Theme Accents */}
              {themeIdState === "fluent" && (
                <>
                  <div className="absolute -top-24 -right-24 w-[35%] aspect-square rounded-full bg-gradient-to-br from-cyan-400/20 to-orange-500/20 blur-3xl pointer-events-none z-0" />
                  <div className="absolute -bottom-36 -left-36 w-[40%] aspect-square rounded-full bg-gradient-to-tr from-purple-500/10 to-orange-500/10 blur-3xl pointer-events-none z-0" />
                  <div className="absolute top-0 left-0 right-0 h-[1.5%] bg-gradient-to-r from-orange-500 to-cyan-400 pointer-events-none z-0" />
                </>
              )}

              {presentDesc && (
                <SlideStage
                  desc={presentDesc}
                  animating={isSlideAnimating}
                  accentFont={designTheme.headingFont}
                  bodyFont={designTheme.bodyFont}
                />
              )}
            </div>

            {/* Right Stage Zone Navigation */}
            <button
              onClick={presentNext}
              disabled={presentIndex === slides.length - 1}
              className={`z-10 flex items-center justify-center w-12 h-12 rounded-full border border-white/10 bg-card/5 hover:bg-card/10 text-white shadow-xl active:scale-95 transition-all ${
                presentIndex === slides.length - 1 ? "cursor-not-allowed opacity-15" : "cursor-pointer opacity-80 hover:opacity-100"
              }`}
            >
              <ChevronRight className="w-6 h-6" />
            </button>
          </div>

          {/* Floating autohide player control bar at bottom */}
          <div className="pb-8 pt-2 flex justify-center items-center w-full z-10 select-none">
            <div className="bg-zinc-900/80 backdrop-blur-md border border-white/10 py-2.5 px-6 rounded-full flex items-center gap-6 shadow-[0_8px_32px_rgba(0,0,0,0.3)]">
              <button 
                onClick={presentPrev} 
                disabled={presentIndex === 0} 
                className="text-zinc-400 hover:text-white cursor-pointer disabled:opacity-20 active:scale-90 transition-all"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              
              <span className="text-xs font-bold text-zinc-300 tracking-wider">
                SLIDE {(presentIndex + 1).toString().padStart(2, '0')} OF {slides.length.toString().padStart(2, '0')}
              </span>

              <button 
                onClick={presentNext} 
                disabled={presentIndex === slides.length - 1} 
                className="text-zinc-400 hover:text-white cursor-pointer disabled:opacity-20 active:scale-90 transition-all"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          </div>

        </div>
      )}
    </div>
    </SidebarProvider>
  );
}

// Inline fallback loader icon
function Loader2({ className }) {
  return (
    <svg 
      className={`animate-spin ${className}`} 
      xmlns="http://www.w3.org/2000/svg" 
      fill="none" 
      viewBox="0 0 24 24"
    >
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
    </svg>
  );
}
