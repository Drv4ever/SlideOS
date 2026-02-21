import { useLocation } from "react-router-dom";
import { useState, useRef, useEffect } from "react";
import { Rnd } from "react-rnd";
import PptxGenJS from "pptxgenjs";
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
} from "lucide-react";

export default function PresentationView() {
  const { state } = useLocation();
  const rawSlides = state?.slides || [];
  const fileInputRef = useRef();
  const presentationOverlayRef = useRef(null);
  const incomingTheme = state?.theme;
  const textAmount = state?.textAmount || "detailed";
  const defaultTheme = {
    primary: incomingTheme?.colors?.primary || "#6366f1",
    secondary: incomingTheme?.colors?.secondary || "#818cf8",
    background: incomingTheme?.colors?.background || "#ffffff",
    text: incomingTheme?.colors?.text || "#111827",
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
      elements: (() => {
        const elements = [];
        const headingLines = Math.max(1, Math.ceil((slide.heading || "").length / 30));
        const headingHeight = Math.max(80, headingLines * 42);
        elements.push({
          id: `title-${slideIndex}`,
          type: "text",
          content: slide.heading,
          x: 100,
          y: 70,
          fontSize: textLayout.headingSize,
          bold: true,
          color: defaultTheme.text,
          width: 760,
          height: headingHeight,
          fontFamily: headingFont,
        });

        let currentY = 70 + headingHeight + 25;
        slide.content.forEach((point, i) => {
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
            fontSize: textLayout.bulletSize,
            bold: false,
            color: defaultTheme.text,
            width: 720,
            height: bulletHeight,
            fontFamily: bodyFont,
          });
          currentY += bulletHeight + textLayout.bulletGap;
        });
        return elements;
      })(),
    }));
  };

  const [slides, setSlides] = useState(convertSlides(rawSlides));
  const [activeIndex, setActiveIndex] = useState(0);
  const [selectedId, setSelectedId] = useState(null);
  const [presentationTitle, setPresentationTitle] = useState("My Presentation");
  const [slideNotes, setSlideNotes] = useState(
    rawSlides.length ? rawSlides.map(() => "") : [""]
  );
  const [isPresenting, setIsPresenting] = useState(false);
  const [presentIndex, setPresentIndex] = useState(0);
  const [isSlideAnimating, setIsSlideAnimating] = useState(false);

  const activeSlide = slides[activeIndex];
  const selectedElement = activeSlide?.elements?.find((el) => el.id === selectedId);

  useEffect(() => {
    if (!isPresenting) return;
    setIsSlideAnimating(true);
    const timer = setTimeout(() => setIsSlideAnimating(false), 420);
    return () => clearTimeout(timer);
  }, [presentIndex, isPresenting]);

  const updateSlideBackground = (bg) => {
    const updated = [...slides];
    updated[activeIndex].background = bg;
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
          // PPTX export uses a solid fallback color for CSS gradients.
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

    pres.writeFile({ fileName: "Presentation.pptx" });
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
        // Ignore fullscreen exit errors
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
        // Fallback: overlay mode still works even without fullscreen permission
      }
    }, 0);
  };

  const sectionTitleStyle = {
    margin: "16px 0 10px",
    fontSize: 12,
    fontWeight: 700,
    color: "#6b7280",
    letterSpacing: "0.05em",
    textTransform: "uppercase",
  };

  const actionButtonStyle = {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    border: "1px solid #d1d5db",
    borderRadius: 10,
    background: "#ffffff",
    padding: "8px 10px",
    fontSize: 12,
    fontWeight: 600,
    color: "#111827",
    cursor: "pointer",
  };

  const themeButtons = [
    {
      label: "Selected",
      apply: () =>
        applyTheme(
          {
            background: { type: "color", value: defaultTheme.background },
            textColor: defaultTheme.text,
            fontFamily: bodyFont,
          },
          true
        ),
    },
    {
      label: "Dark",
      apply: () =>
        applyTheme({
          background: { type: "color", value: "#111827" },
          textColor: "#ffffff",
        }, true),
    },
    {
      label: "Gradient",
      apply: () =>
        applyTheme({
          background: {
            type: "gradient",
            value: "linear-gradient(135deg, #667eea, #764ba2)",
          },
          textColor: "#ffffff",
        }, true),
    },
    {
      label: "Light",
      apply: () =>
        applyTheme({
          background: { type: "color", value: "#ffffff" },
          textColor: "#000000",
        }, true),
    },
  ];

  return (
    <div
      style={{
        display: "flex",
        height: "100vh",
        width: "100vw",
        overflow: "hidden",
        background:
          "radial-gradient(circle at 10% 10%, #f5f3ff 0%, #eef2ff 38%, #f8fafc 100%)",
      }}
    >
      <div
        style={{
          width: 310,
          background: "rgba(255,255,255,0.92)",
          padding: 16,
          borderRight: "1px solid #e5e7eb",
          backdropFilter: "blur(8px)",
          overflowY: "auto",
          overflowX: "hidden",
        }}
      >
        <div style={{ marginBottom: 12 }}>
          <div style={sectionTitleStyle}>Presentation</div>
          <input
            value={presentationTitle}
            onChange={(e) => setPresentationTitle(e.target.value)}
            placeholder="Presentation title"
            style={{
              width: "100%",
              padding: "11px 12px",
              borderRadius: 10,
              border: "1px solid #d1d5db",
              fontSize: 14,
              fontWeight: 600,
              color: "#111827",
            }}
          />
        </div>

        <div
          style={{
            background: "#f8fafc",
            border: "1px solid #e5e7eb",
            borderRadius: 12,
            padding: 12,
            fontSize: 12,
            color: "#4b5563",
            lineHeight: 1.7,
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 6, fontWeight: 700, color: "#111827" }}>
            <FileText size={14} />
            File Preview
          </div>
          <div><b>Name:</b> {presentationTitle || "Untitled"}</div>
          <div><b>Theme:</b> {incomingTheme?.name || "Default"}</div>
          <div><b>Slides:</b> {slides.length}</div>
        </div>

        <div style={sectionTitleStyle}>Quick Actions</div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
          <button onClick={duplicateSlide} style={actionButtonStyle}>
            <Copy size={14} />
            Duplicate
          </button>
          <button onClick={addTextBox} style={actionButtonStyle}>
            <Type size={14} />
            Add Text
          </button>
          <button onClick={() => fileInputRef.current.click()} style={actionButtonStyle}>
            <ImageIcon size={14} />
            Add Image
          </button>
          <button onClick={() => deleteSlide(activeIndex)} style={{ ...actionButtonStyle, color: "#b91c1c" }}>
            <Trash2 size={14} />
            Delete
          </button>
        </div>

        <input
          type="file"
          accept="image/*"
          ref={fileInputRef}
          style={{ display: "none" }}
          onChange={handleImageUpload}
        />

        <div style={sectionTitleStyle}>Slides</div>
        {slides.map((slide, index) => (
          <div
            key={index}
            onClick={() => setActiveIndex(index)}
            style={{
              marginBottom: 10,
              padding: 10,
              cursor: "pointer",
              border:
                index === activeIndex
                  ? `2px solid ${defaultTheme.primary}`
                  : "1px solid #e5e7eb",
              borderRadius: 10,
              textAlign: "left",
              background: index === activeIndex ? "#eef2ff" : "#ffffff",
              boxShadow: index === activeIndex ? "0 8px 16px rgba(99,102,241,0.12)" : "none",
            }}
          >
            <div style={{ fontSize: 12, fontWeight: 700, color: "#111827" }}>Slide {index + 1}</div>
            <div
              style={{
                marginTop: 8,
                width: "100%",
                height: 54,
                borderRadius: 8,
                border: "1px solid #e5e7eb",
                background: slide.background?.value || "#ffffff",
                padding: "6px 8px",
                overflow: "hidden",
              }}
            >
              <div
                style={{
                  fontSize: 11,
                  fontWeight: 700,
                  color: slide.elements.find((el) => el.type === "text")?.color || "#111827",
                  whiteSpace: "nowrap",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                }}
              >
                {slide.elements.find((el) => el.type === "text")?.content || "Untitled"}
              </div>
              <div
                style={{
                  marginTop: 4,
                  fontSize: 10,
                  color: "rgba(0,0,0,0.55)",
                }}
              >
                {slide.elements.filter((el) => el.type === "text").length} text blocks
              </div>
            </div>
            <div
              style={{
                marginTop: 4,
                fontSize: 12,
                color: "#6b7280",
                whiteSpace: "nowrap",
                overflow: "hidden",
                textOverflow: "ellipsis",
              }}
            >
              {slide.elements.find((el) => el.type === "text")?.content || "Untitled"}
            </div>
            {slides.length > 1 && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  deleteSlide(index);
                }}
                style={{
                  marginTop: 8,
                  border: "none",
                  background: "transparent",
                  color: "#ef4444",
                  fontSize: 12,
                  fontWeight: 600,
                  cursor: "pointer",
                  padding: 0,
                }}
              >
                Remove slide
              </button>
            )}
          </div>
        ))}

        <div style={sectionTitleStyle}>Background</div>
        <input
          type="color"
          value={activeSlide.background.value}
          onChange={(e) =>
            updateSlideBackground({
              type: "color",
              value: e.target.value,
            })
          }
          style={{ width: "100%", height: 44, border: "none", borderRadius: 10, cursor: "pointer" }}
        />

        <div style={sectionTitleStyle}>Themes</div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
          {themeButtons.map((item) => (
            <button key={item.label} onClick={item.apply} style={actionButtonStyle}>
              <Palette size={14} />
              {item.label}
            </button>
          ))}
        </div>

        <div style={sectionTitleStyle}>Slide Notes</div>
        <textarea
          value={slideNotes[activeIndex] || ""}
          onChange={(e) => updateSlideNote(activeIndex, e.target.value)}
          placeholder="Write speaker notes here..."
          rows={5}
          style={{
            width: "100%",
            border: "1px solid #d1d5db",
            borderRadius: 10,
            padding: 10,
            fontSize: 12,
            resize: "vertical",
          }}
        />
      </div>

      <div
        style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          position: "relative",
          padding: 20,
          overflow: "hidden",
        }}
      >
        <div
          style={{
            width: "100%",
            maxWidth: 1080,
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: 16,
            background: "rgba(255,255,255,0.75)",
            border: "1px solid #e5e7eb",
            borderRadius: 14,
            padding: "10px 14px",
            backdropFilter: "blur(6px)",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 8, color: "#374151" }}>
            <Sparkles size={16} color={defaultTheme.primary} />
            <span style={{ fontSize: 13, fontWeight: 600 }}>
              Editing: Slide {activeIndex + 1} of {slides.length}
            </span>
            {selectedElement?.type === "text" && (
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 6,
                  marginLeft: 12,
                  padding: "6px 8px",
                  border: "1px solid #d1d5db",
                  borderRadius: 8,
                  background: "#ffffff",
                }}
              >
                <span style={{ fontSize: 12, color: "#4b5563" }}>Font Size</span>
                <input
                  type="number"
                  min={10}
                  max={96}
                  value={selectedElement.fontSize || 16}
                  onChange={(e) => updateSelectedTextSize(e.target.value)}
                  style={{
                    width: 62,
                    border: "1px solid #d1d5db",
                    borderRadius: 6,
                    padding: "4px 6px",
                    fontSize: 12,
                  }}
                />
              </div>
            )}
            {selectedElement?.type === "image" && (
              <button
                onClick={removeSelectedImage}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 6,
                  marginLeft: 12,
                  border: "1px solid #fecaca",
                  borderRadius: 8,
                  background: "#fff1f2",
                  color: "#b91c1c",
                  padding: "7px 10px",
                  fontSize: 12,
                  fontWeight: 600,
                  cursor: "pointer",
                }}
              >
                <Trash2 size={13} />
                Delete Image
              </button>
            )}
          </div>
          <button
            onClick={exportPPT}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              border: "none",
              borderRadius: 10,
              padding: "10px 14px",
              background: "#111827",
              color: "#ffffff",
              cursor: "pointer",
              fontWeight: 600,
              fontSize: 13,
            }}
          >
            <Download size={15} />
            Download PPTX
          </button>
          <button
            onClick={startFullscreenPresent}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              border: "none",
              borderRadius: 10,
              padding: "10px 14px",
              background: defaultTheme.primary,
              color: "#ffffff",
              cursor: "pointer",
              fontWeight: 600,
              fontSize: 13,
              marginLeft: 10,
            }}
          >
            <Play size={15} />
            Present File
          </button>
        </div>

        <div
          style={{
            flex: 1,
            width: "100%",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
        <div
          style={{
            width: 960,
            height: 540,
            background: getBackgroundStyle(),
            position: "relative",
            borderRadius: 18,
            boxShadow: "0 28px 48px rgba(15,23,42,0.18)",
            border: "1px solid rgba(255,255,255,0.8)",
          }}
          onClick={() => setSelectedId(null)}
        >
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
                    border:
                      selectedId === el.id
                        ? `2px solid ${defaultTheme.primary}`
                        : "none",
                    borderRadius: 6,
                    padding: 2,
                  }}
                >
                  {el.content}
                </div>
              )}

              {el.type === "image" && (
                <img
                  src={el.src}
                  alt=""
                  style={{
                    width: "100%",
                    height: "100%",
                    objectFit: "cover",
                    border:
                      selectedId === el.id
                        ? `2px solid ${defaultTheme.primary}`
                        : "none",
                    borderRadius: 6,
                  }}
                />
              )}
            </Rnd>
          ))}
        </div>
        </div>
      </div>

      {isPresenting && (
        <div
          ref={presentationOverlayRef}
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 999,
            background: "#0f172a",
            display: "flex",
            flexDirection: "column",
            overflow: "hidden",
          }}
        >
          <div
            style={{
              padding: "12px 18px",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              color: "#e5e7eb",
              borderBottom: "1px solid rgba(255,255,255,0.12)",
            }}
          >
            <div style={{ fontSize: 13, fontWeight: 600 }}>
              {presentationTitle || "Presentation"} • Slide {presentIndex + 1}/{slides.length}
            </div>
            <button
              onClick={closePresentMode}
              style={{
                border: "1px solid rgba(255,255,255,0.25)",
                background: "transparent",
                color: "#fff",
                borderRadius: 8,
                padding: "8px 10px",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                gap: 6,
                fontSize: 12,
                fontWeight: 600,
              }}
            >
              <X size={14} />
              Exit
            </button>
          </div>

          <div
            style={{
              flex: 1,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 20,
              padding: 24,
            }}
          >
            <button
              onClick={presentPrev}
              disabled={presentIndex === 0}
              style={{
                border: "1px solid rgba(255,255,255,0.3)",
                background: "rgba(255,255,255,0.08)",
                color: "#fff",
                width: 42,
                height: 42,
                borderRadius: 999,
                cursor: presentIndex === 0 ? "not-allowed" : "pointer",
                opacity: presentIndex === 0 ? 0.4 : 1,
              }}
            >
              <ChevronLeft size={20} />
            </button>

            <div
              style={{
                width: "min(1280px, 92vw)",
                aspectRatio: "16 / 9",
                borderRadius: 18,
                overflow: "hidden",
                background: slides[presentIndex]?.background?.value || "#ffffff",
                position: "relative",
                boxShadow: "0 28px 48px rgba(0,0,0,0.35)",
                transition: "opacity 320ms ease, transform 320ms ease",
                opacity: isSlideAnimating ? 0.7 : 1,
                transform: isSlideAnimating ? "scale(0.985)" : "scale(1)",
              }}
            >
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
                    transitionDelay: `${elementIndex * 70}ms`,
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
                        whiteSpace: "pre-wrap",
                      }}
                    >
                      {el.content}
                    </div>
                  )}
                  {el.type === "image" && (
                    <img
                      src={el.src}
                      alt=""
                      style={{ width: "100%", height: "100%", objectFit: "cover" }}
                    />
                  )}
                </div>
              ))}
            </div>

            <button
              onClick={presentNext}
              disabled={presentIndex === slides.length - 1}
              style={{
                border: "1px solid rgba(255,255,255,0.3)",
                background: "rgba(255,255,255,0.08)",
                color: "#fff",
                width: 42,
                height: 42,
                borderRadius: 999,
                cursor: presentIndex === slides.length - 1 ? "not-allowed" : "pointer",
                opacity: presentIndex === slides.length - 1 ? 0.4 : 1,
              }}
            >
              <ChevronRight size={20} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
