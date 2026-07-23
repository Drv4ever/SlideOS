import { useLocation, useNavigate } from "react-router-dom";
import { useState, useRef, useEffect } from "react";
import { Rnd } from "react-rnd";
import PptxGenJS from "pptxgenjs";
import { updatePresentation } from "../services/presentationService";
import { getSlideStyle } from "../utils/slideStyle";
import {
  Copy,
  Type,
  Image as ImageIcon,
  Trash2,
  Download,
  Sparkles,
  Palette,
  FileText,
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

  const defaultTheme = {
    primary: incomingTheme?.colors?.primary || "#f97316",
    accent: incomingTheme?.colors?.accent || "#fb923c",
    background: incomingTheme?.colors?.background || "#ffffff",
    surface: incomingTheme?.colors?.surface || "#f5f5f5",
    border: incomingTheme?.colors?.border || "#e5e7eb",
    text: incomingTheme?.colors?.text || "#111827",
    textMuted: incomingTheme?.colors?.textMuted || "#6b7280",
  };
  const bodyFont =
    incomingTheme?.fontFamily?.body ||
    incomingTheme?.fonts?.body ||
    "Inter";
  const headingFont =
    incomingTheme?.fontFamily?.heading ||
    incomingTheme?.fonts?.heading ||
    bodyFont;

  const getTextLayoutSettings = () => {
    if (textAmount === "minimal") {
      return {
        headingSize: 42,
        bulletSize: 28,
        charsPerLine: 40,
        lineHeight: 32,
        bulletGap: 12,
      };
    }
    if (textAmount === "concise") {
      return {
        headingSize: 38,
        bulletSize: 23,
        charsPerLine: 46,
        lineHeight: 28,
        bulletGap: 10,
      };
    }
    return {
      headingSize: 34,
      bulletSize: 18,
      charsPerLine: 56,
      lineHeight: 24,
      bulletGap: 8,
    };
  };

  const textLayout = getTextLayoutSettings();

  const slideStyle = getSlideStyle({
    topic: state?.title || rawSlides?.[0]?.heading || "",
    theme: incomingTheme,
    sizes: { headingSize: textLayout.headingSize, bulletSize: textLayout.bulletSize },
  });

  const convertSlides = (slides) => {
    if (!slides.length) {
      return [
        {
          background: {
            type: "color",
            value: defaultTheme.background,
          },
          elements: [
            {
              id: "title-0",
              type: "text",
              content: "New Slide",
              x: 100,
              y: 80,
              fontSize: 36,
              bold: true,
              color: defaultTheme.text,
              width: 500,
              height: 80,
              fontFamily: headingFont,
            },
          ],
        },
      ];
    }

    return slides.map((slide, slideIndex) => ({
      background: {
        type: "color",
        value: defaultTheme.background,
      },
      layoutPattern: slide.layoutPattern || ["stripe", "split", "card", "header", "plain"][slideIndex % 5],
      elements: (() => {
        const elements = [];
        const richElements = Array.isArray(slide.elements) ? slide.elements : [];
        const headingText =
          slide.heading ||
          richElements.find((el) => el.type === "heading")?.content ||
          "";
        let points;
        if (Array.isArray(slide.content)) {
          points = slide.content;
        } else {
          const bulletEl = richElements.find((el) => el.type === "bullet");
          points = bulletEl?.items || [];
        }
        const headingLines = Math.max(1, Math.ceil(headingText.length / 30));
        const headingHeight = Math.max(80, headingLines * 42);
        const isTitleSlide = slideIndex === 0;
        elements.push({
          id: `title-${slideIndex}`,
          type: "text",
          content: headingText,
          x: 100,
          y: 70,
          fontSize: isTitleSlide
            ? slideStyle.titleSlideHeadingSize
            : slideStyle.headingSize,
          bold: true,
          color: slideStyle.headingColor,
          width: 760,
          height: isTitleSlide ? Math.round(headingHeight * 1.3) : headingHeight,
          fontFamily: slideStyle.headingFont,
        });

        let currentY = 70 + headingHeight + 25;
        points.forEach((point, i) => {
          const lines = Math.max(
            1,
            Math.ceil((point || "").length / textLayout.charsPerLine)
          );
          const bulletHeight = Math.max(42, lines * textLayout.lineHeight);
          elements.push({
            id: `bullet-${slideIndex}-${i}`,
            type: "text",
            content: point,
            x: 120,
            y: currentY,
            fontSize: slideStyle.bulletSize,
            bold: false,
            color: slideStyle.bulletColor,
            width: 720,
            height: bulletHeight,
            fontFamily: slideStyle.bodyFont,
          });
          currentY += bulletHeight + textLayout.bulletGap;
        });
        return elements;
      })(),
    }));
  };

  const [slides, setSlides] = useState(
    editorSlidesFromState || convertSlides(rawSlides)
  );
  const [themeIdState, setThemeIdState] = useState(themeId || "cornflower");
  const [activeIndex, setActiveIndex] = useState(0);
  const [selectedId, setSelectedId] = useState(null);
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

  const activeSlide = slides[activeIndex];
  const selectedElement = activeSlide?.elements?.find((el) => el.id === selectedId);

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

  const applyTheme = (theme, applyAll = false) => {
    const updated = [...slides];
    const targetIndexes = applyAll ? updated.map((_, i) => i) : [activeIndex];

    targetIndexes.forEach((index) => {
      updated[index].background = theme.background;

      updated[index].elements.forEach((el) => {
        if (el.type === "text") {
          el.color = theme.textColor;
          if (theme.fontFamily) {
            el.fontFamily = theme.fontFamily;
          }
        }
      });
    });

    setSlides(updated);
  };

  const updateElement = (id, updates) => {
    const updated = [...slides];
    const element = updated[activeIndex].elements.find(
      (el) => el.id === id
    );
    if (!element) return;
    Object.assign(element, updates);
    setSlides(updated);
  };

  const removeSelectedImage = () => {
    if (!selectedElement || selectedElement.type !== "image") return;
    const updated = [...slides];
    updated[activeIndex].elements = updated[activeIndex].elements.filter(
      (el) => el.id !== selectedElement.id
    );
    setSlides(updated);
    setSelectedId(null);
  };

  const updateSelectedTextSize = (value) => {
    if (!selectedElement || selectedElement.type !== "text") return;
    const size = Number(value);
    if (Number.isNaN(size)) return;
    const clamped = Math.min(96, Math.max(10, size));
    updateElement(selectedElement.id, { fontSize: clamped });
  };

  const updateSlideNote = (index, value) => {
    const updatedNotes = [...slideNotes];
    updatedNotes[index] = value;
    setSlideNotes(updatedNotes);
  };

  const duplicateSlide = () => {
    const original = slides[activeIndex];
    if (!original) return;

    const copy = {
      ...original,
      elements: original.elements.map((el) => ({
        ...el,
        id: `${el.id}-copy-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      })),
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
      layoutPattern: "plain",
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
          width: 500,
          height: 80,
          fontFamily: headingFont,
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
    const newText = {
      id: `text-${Date.now()}`,
      type: "text",
      content: "Edit text",
      x: 220,
      y: 260,
      fontSize: 24,
      bold: false,
      color: defaultTheme.text,
      width: 260,
      height: 60,
      fontFamily: bodyFont,
    };

    const updated = [...slides];
    updated[activeIndex].elements.push(newText);
    setSlides(updated);
    setSelectedId(newText.id);
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = function (event) {
      const newImage = {
        id: `img-${Date.now()}`,
        type: "image",
        src: event.target.result,
        x: 200,
        y: 200,
        width: 300,
        height: 200,
      };

      const updated = [...slides];
      updated[activeIndex].elements.push(newImage);
      setSlides(updated);
    };
    reader.readAsDataURL(file);
  };

  const exportPPT = () => {
    const pres = new PptxGenJS();

    const getPptBackgroundFill = (background) => {
      if (!background) return null;
      if (background.type === "color" && background.value?.startsWith("#")) {
        return background.value.replace("#", "");
      }
      if (background.type === "gradient" && typeof background.value === "string") {
        const colors = background.value.match(/#[0-9a-fA-F]{3,8}/g);
        if (colors?.length) {
          return colors[0].replace("#", "");
        }
      }
      return null;
    };

    slides.forEach((slideData) => {
      const slide = pres.addSlide();

      const backgroundFill = getPptBackgroundFill(slideData.background);
      if (backgroundFill) {
        slide.background = { fill: backgroundFill };
      }

      slideData.elements.forEach((el) => {
        if (el.type === "text") {
          slide.addText(el.content, {
            x: el.x / 100,
            y: el.y / 100,
            w: el.width / 100,
            h: el.height / 100,
            fontSize: el.fontSize,
            bold: el.bold,
            color: el.color.replace("#", ""),
            fontFace: el.fontFamily || undefined,
            fit: "shrink",
            margin: 2,
          });
        }

        if (el.type === "image") {
          slide.addImage({
            data: el.src,
            x: el.x / 100,
            y: el.y / 100,
            w: el.width / 100,
            h: el.height / 100,
          });
        }
      });
    });

    pres.writeFile({ fileName: `${presentationTitle || "Presentation"}.pptx` });
  };

  const getBackgroundStyle = () => {
    if (activeSlide.background.type === "color") {
      return activeSlide.background.value;
    }
    if (activeSlide.background.type === "gradient") {
      return activeSlide.background.value;
    }
    return "#ffffff";
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

  const convertEditorSlidesToOutline = (editorSlides) =>
    editorSlides.map((slide) => {
      const textElements = (slide.elements || []).filter((el) => el.type === "text");
      const heading = textElements[0]?.content || "Untitled Slide";
      const content = textElements.slice(1).map((el) => el.content || "").filter(Boolean);
      return { heading, content };
    });

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
          slides: convertEditorSlidesToOutline(slides),
          editorSlides: slides,
          slideNotes,
          textAmount,
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

  return (
    <SidebarProvider className="bg-muted text-foreground font-sans select-none">
      <Sidebar collapsible="offcanvas" variant="sidebar">
        
        <SidebarHeader>
        <div className="flex flex-col p-4">
          <button 
            onClick={() => navigate("/preview", { 
              state: {
                presentation: { slides: convertEditorSlidesToOutline(slides) },
                presentationId,
                title: presentationTitle,
                themeId,
                textAmount
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
                          ? "border-orange-600 bg-sidebar-accent/80 shadow-xs"
                          : "border-border bg-sidebar-accent hover:border-border"
                      }`}
                    >
                      <div className="flex justify-between items-center mb-1.5">
                        <span className={`text-[10px] font-bold ${index === activeIndex ? 'text-orange-600' : 'text-muted-foreground'}`}>
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
                        className="w-full h-16 rounded-lg border border-border overflow-hidden relative shadow-[inset_0_1px_3px_rgba(0,0,0,0.02)]"
                        style={{ background: slide.background?.value || "var(--sidebar-accent)" }}
                      >
                        {/* Microsoft Fluent Theme Mini Accents */}
                        {themeIdState === "fluent" && (
                          <>
                            <div className="absolute -top-3 -right-3 w-8 h-8 rounded-full bg-cyan-400/20 blur-xs pointer-events-none z-0" />
                            <div className="absolute -bottom-4 -left-4 w-9 h-9 rounded-full bg-purple-500/10 blur-xs pointer-events-none z-0" />
                            <div className="absolute top-0 left-0 right-0 h-0.5 bg-orange-600 pointer-events-none z-0" />
                          </>
                        )}
                        <div
                          className="text-[9px] font-bold truncate max-w-full px-2 py-1 select-none relative z-10"
                          style={{
                            color: slide.elements.find((el) => el.type === "text")?.color || "var(--sidebar-foreground)",
                            fontFamily: `${headingFont}, sans-serif`
                          }}
                        >
                          {slide.elements.find((el) => el.type === "text")?.content || "Untitled Slide"}
                        </div>
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
                    value={activeSlide.background.value}
                    onChange={(e) =>
                      updateSlideBackground({
                        type: "color",
                        value: e.target.value,
                      })
                    }
                    className="w-12 h-10 border-0 rounded-xl cursor-pointer bg-transparent shrink-0 shadow-sm outline-none"
                  />
                  <div className="flex-1 text-xs text-sidebar-accent-foreground font-mono select-all bg-sidebar-accent border border-border py-2 px-3 rounded-xl shadow-2xs">
                    {activeSlide.background.value}
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
        <div className="w-full max-w-5xl mx-auto px-6 pt-4 relative z-10">
          <div className="bg-card/80 backdrop-blur-md border border-border/90 rounded-2xl p-2.5 flex items-center justify-between shadow-[0_20px_48px_-10px_rgba(15,23,42,0.08),0_4px_16px_rgba(15,23,42,0.02)]">
            
            <SidebarTrigger className="mr-1" />

            {/* Left Toolbar Side: Selected Element controls */}
            <div className="flex items-center gap-3">
              <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider bg-muted/80 px-2.5 py-1 rounded-lg">
                Slide {activeIndex + 1}/{slides.length}
              </span>

              {selectedElement?.type === "text" && (
                <div className="flex items-center gap-2 border-l border-border pl-3">
                  <span className="text-xs font-semibold text-muted-foreground">Font size:</span>
                  <input
                    type="number"
                    min={10}
                    max={96}
                    value={selectedElement.fontSize || 16}
                    onChange={(e) => updateSelectedTextSize(e.target.value)}
                    className="w-16 border border-border/80 rounded-lg px-2 py-1 text-xs font-mono text-center outline-none focus:ring-1.5 focus:ring-orange-500/20 focus:border-orange-500"
                  />
                </div>
              )}

              {selectedElement?.type === "image" && (
                <div className="flex items-center border-l border-border pl-3">
                  <button
                    onClick={removeSelectedImage}
                    className="flex items-center gap-1.5 bg-red-50 hover:bg-red-100/70 border border-red-200/40 text-red-600 text-xs font-bold py-1.5 px-3 rounded-xl transition-all cursor-pointer active:scale-95"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Delete Image</span>
                  </button>
                </div>
              )}
            </div>

            {/* Right Action buttons */}
            <div className="flex items-center gap-2">
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
                className="flex items-center gap-1.5 bg-orange-600 hover:bg-orange-700 text-white shadow-sm font-semibold px-4 py-1.5 rounded-xl text-xs cursor-pointer active:scale-95 transition-all border-t border-white/35 border-x border-white/15 border-b-0 shadow-[inset_0_1px_0_rgba(255,255,255,0.35),0_4px_12px_rgba(249,115,22,0.25)]"
              >
                <Play className="w-3.5 h-3.5 fill-current" />
                <span>Present</span>
              </button>
            </div>
          </div>
        </div>

        {/* Dynamic Canvas Drafting Table Viewport */}
        <div 
          onClick={() => setSelectedId(null)}
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
          {/* THE PHYSICAL SLIDE CARD */}
          <div
            style={{
              width: 960,
              height: 540,
              background: getBackgroundStyle(),
              position: "relative",
            }}
            className="rounded-2xl shadow-[0_24px_70px_rgba(15,23,42,0.08)] border border-border/50 overflow-hidden shrink-0 select-none"
          >
            {/* Microsoft Fluent Theme Accents */}
            {themeIdState === "fluent" && (
              <>
                <div className="absolute -top-24 -right-24 w-80 h-80 rounded-full bg-gradient-to-br from-cyan-400/20 to-orange-600/20 blur-2xl pointer-events-none z-0" />
                <div className="absolute -bottom-36 -left-36 w-96 h-96 rounded-full bg-gradient-to-tr from-purple-500/10 to-orange-500/10 blur-2xl pointer-events-none z-0" />
                <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-orange-600 to-cyan-400 pointer-events-none z-0" />
              </>
            )}

            {activeSlide.elements.map((el) => (
              <Rnd
                key={el.id}
                size={{ width: el.width, height: el.height }}
                position={{ x: el.x, y: el.y }}
                bounds="parent"
                onDragStop={(e, d) =>
                  updateElement(el.id, { x: d.x, y: d.y })
                }
                onResizeStop={(e, direction, ref, delta, position) =>
                  updateElement(el.id, {
                    width: parseInt(ref.style.width),
                    height: parseInt(ref.style.height),
                    x: position.x,
                    y: position.y,
                  })
                }
                onClick={(e) => {
                  e.stopPropagation();
                  setSelectedId(el.id);
                }}
                className="relative"
              >
                {el.type === "text" && (
                  <div
                    contentEditable
                    suppressContentEditableWarning
                    onBlur={(e) =>
                      updateElement(el.id, {
                        content: e.target.innerText,
                      })
                    }
                    style={{
                      width: "100%",
                      height: "100%",
                      fontSize: el.fontSize,
                      fontWeight: el.bold ? "bold" : "normal",
                      color: el.color,
                      fontFamily: `${el.fontFamily || bodyFont}, sans-serif`,
                      padding: 4,
                    }}
                    className="outline-none break-words leading-relaxed select-text"
                  >
                    {el.content}
                  </div>
                )}

                {el.type === "image" && (
                  <img
                    src={el.src}
                    alt=""
                    className="w-full h-full object-cover rounded-md pointer-events-none"
                  />
                )}

                {/* Figma-Style circular drag corner handles for selected items */}
                {selectedId === el.id && (
                  <>
                    <div className="absolute inset-0 border border-orange-600/90 pointer-events-none rounded-sm" />
                    <div className="absolute -top-1 -left-1 w-2.5 h-2.5 bg-card border-1.5 border-orange-600 rounded-full z-10 pointer-events-none shadow-sm" />
                    <div className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-card border-1.5 border-orange-600 rounded-full z-10 pointer-events-none shadow-sm" />
                    <div className="absolute -bottom-1 -left-1 w-2.5 h-2.5 bg-card border-1.5 border-orange-600 rounded-full z-10 pointer-events-none shadow-sm" />
                    <div className="absolute -bottom-1 -right-1 w-2.5 h-2.5 bg-card border-1.5 border-orange-600 rounded-full z-10 pointer-events-none shadow-sm" />
                  </>
                )}
              </Rnd>
            ))}
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
              <span className="text-orange-400 font-extrabold animate-pulse">●</span>
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
                background: slides[presentIndex]?.background?.value || "#ffffff"
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
                background: slides[presentIndex]?.background?.value || "#ffffff",
                transition: "opacity 320ms ease, transform 320ms ease",
                opacity: isSlideAnimating ? 0.6 : 1,
                transform: isSlideAnimating ? "scale(0.985)" : "scale(1)",
              }}
              className="rounded-2xl overflow-hidden relative shadow-[0_30px_90px_rgba(0,0,0,0.45)] select-none"
            >
              {/* Microsoft Fluent Theme Accents */}
              {themeIdState === "fluent" && (
                <>
                  <div className="absolute -top-24 -right-24 w-[35%] aspect-square rounded-full bg-gradient-to-br from-cyan-400/20 to-orange-600/20 blur-3xl pointer-events-none z-0" />
                  <div className="absolute -bottom-36 -left-36 w-[40%] aspect-square rounded-full bg-gradient-to-tr from-purple-500/10 to-orange-500/10 blur-3xl pointer-events-none z-0" />
                  <div className="absolute top-0 left-0 right-0 h-[1.5%] bg-gradient-to-r from-orange-600 to-cyan-400 pointer-events-none z-0" />
                </>
              )}

              {slides[presentIndex]?.elements?.map((el, elementIndex) => (
                <div
                  key={el.id}
                  style={{
                    position: "absolute",
                    left: el.x,
                    top: el.y,
                    width: el.width,
                    height: el.height,
                    opacity: isSlideAnimating ? 0 : 1,
                    transform: isSlideAnimating ? "translateY(8px)" : "translateY(0px)",
                    transition: "opacity 420ms ease, transform 420ms ease",
                    transitionDelay: `${elementIndex * 60}ms`,
                  }}
                >
                  {el.type === "text" && (
                    <div
                      style={{
                        width: "100%",
                        height: "100%",
                        fontSize: el.fontSize,
                        fontWeight: el.bold ? "bold" : "normal",
                        color: el.color,
                        fontFamily: `${el.fontFamily || bodyFont}, sans-serif`,
                      }}
                      className="whitespace-pre-wrap leading-relaxed select-text"
                    >
                      {el.content}
                    </div>
                  )}
                  {el.type === "image" && (
                    <img
                      src={el.src}
                      alt=""
                      className="w-full h-full object-cover rounded-md pointer-events-none"
                    />
                  )}
                </div>
              ))}
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
