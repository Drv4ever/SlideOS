import { useLocation } from "react-router-dom";
import { useState, useRef } from "react";
import { Rnd } from "react-rnd";
import PptxGenJS from "pptxgenjs";

export default function PresentationView() {
  const { state } = useLocation();
  const rawSlides = state?.slides || [];
  const fileInputRef = useRef();

  const convertSlides = (slides) => {
    return slides.map((slide, slideIndex) => ({
      background: {
        type: "color",
        value: "#ffffff",
      },
      elements: [
        {
          id: `title-${slideIndex}`,
          type: "text",
          content: slide.heading,
          x: 100,
          y: 80,
          fontSize: 36,
          bold: true,
          color: "#000000",
          width: 500,
          height: 80,
        },
        ...slide.content.map((point, i) => ({
          id: `bullet-${slideIndex}-${i}`,
          type: "text",
          content: point,
          x: 120,
          y: 180 + i * 50,
          fontSize: 22,
          bold: false,
          color: "#000000",
          width: 600,
          height: 50,
        })),
      ],
    }));
  };

  const [slides, setSlides] = useState(convertSlides(rawSlides));
  const [activeIndex, setActiveIndex] = useState(0);
  const [selectedId, setSelectedId] = useState(null);

  const activeSlide = slides[activeIndex];
  const selectedElement = activeSlide.elements.find(
    (el) => el.id === selectedId
  );

  const updateSlideBackground = (bg) => {
    const updated = [...slides];
    updated[activeIndex].background = bg;
    setSlides(updated);
  };

  const applyTheme = (theme) => {
    const updated = [...slides];
    updated[activeIndex].background = theme.background;

    updated[activeIndex].elements.forEach((el) => {
      if (el.type === "text") {
        el.color = theme.textColor;
      }
    });

    setSlides(updated);
  };

  const updateElement = (id, updates) => {
    const updated = [...slides];
    const element = updated[activeIndex].elements.find(
      (el) => el.id === id
    );
    Object.assign(element, updates);
    setSlides(updated);
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

    slides.forEach((slideData) => {
      const slide = pres.addSlide();

      if (slideData.background.type === "color") {
        slide.background = { fill: slideData.background.value.replace("#", "") };
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
  };

  return (
    <div style={{ display: "flex", height: "100vh", background: "#f3f4f6" }}>
      
      {/* ================= SIDEBAR ================= */}
      <div
        style={{
          width: 240,
          background: "white",
          padding: 15,
          borderRight: "1px solid #e5e7eb",
        }}
      >
        <h4>Slides</h4>

        {slides.map((_, index) => (
          <div
            key={index}
            onClick={() => setActiveIndex(index)}
            style={{
              marginBottom: 10,
              padding: 8,
              cursor: "pointer",
              border:
                index === activeIndex
                  ? "2px solid #6366f1"
                  : "1px solid #e5e7eb",
              borderRadius: 6,
              textAlign: "center",
            }}
          >
            Slide {index + 1}
          </div>
        ))}

        <hr />

        <h4>Background</h4>

        <input
          type="color"
          value={activeSlide.background.value}
          onChange={(e) =>
            updateSlideBackground({
              type: "color",
              value: e.target.value,
            })
          }
        />

        <hr />

        <h4>Themes</h4>

        <button
          onClick={() =>
            applyTheme({
              background: { type: "color", value: "#111827" },
              textColor: "#ffffff",
            })
          }
        >
          Dark
        </button>

        <button
          onClick={() =>
            applyTheme({
              background: {
                type: "gradient",
                value: "linear-gradient(135deg, #667eea, #764ba2)",
              },
              textColor: "#ffffff",
            })
          }
        >
          Purple Gradient
        </button>

        <button
          onClick={() =>
            applyTheme({
              background: { type: "color", value: "#ffffff" },
              textColor: "#000000",
            })
          }
        >
          Light
        </button>

        <hr />

        <button
          onClick={() => fileInputRef.current.click()}
          style={{ marginTop: 10 }}
        >
          Add Image
        </button>

        <input
          type="file"
          accept="image/*"
          ref={fileInputRef}
          style={{ display: "none" }}
          onChange={handleImageUpload}
        />
      </div>

      {/* ================= CANVAS ================= */}
      <div
        style={{
          flex: 1,
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          position: "relative",
        }}
      >
        <div
          style={{
            width: 960,
            height: 540,
            background: getBackgroundStyle(),
            position: "relative",
            borderRadius: 10,
            boxShadow: "0 20px 40px rgba(0,0,0,0.15)",
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
                    border:
                      selectedId === el.id
                        ? "2px solid #6366f1"
                        : "none",
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
                        ? "2px solid #6366f1"
                        : "none",
                  }}
                />
              )}
            </Rnd>
          ))}
        </div>

        <button
          onClick={exportPPT}
          style={{
            position: "absolute",
            bottom: 30,
            right: 30,
            padding: "12px 25px",
            background: "#111827",
            color: "white",
            border: "none",
            borderRadius: 8,
          }}
        >
          Download PPT
        </button>
      </div>
    </div>
  );
}