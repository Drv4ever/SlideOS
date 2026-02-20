import { useLocation, useNavigate } from "react-router-dom";
import { useState } from "react";

export default function PresentationPreview() {
  const { state } = useLocation();
  const navigate = useNavigate();
  const initialPresentation = state?.presentation;

  if (!initialPresentation) {
    return (
      <div style={{
        minHeight: "100vh",
        background: "#0f0f11",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        fontFamily: "'DM Sans', sans-serif",
        gap: "16px",
      }}>
        <style>{`@import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600&display=swap');`}</style>
        <p style={{ color: "#9ca3af", fontSize: "16px" }}>No presentation found.</p>
        <button
          onClick={() => navigate("/")}
          style={{
            background: "linear-gradient(135deg, #7c3aed, #6d28d9)",
            border: "none", borderRadius: "10px", color: "#fff",
            cursor: "pointer", padding: "10px 24px", fontSize: "14px", fontWeight: 600,
          }}
        >
          Go back
        </button>
      </div>
    );
  }

  const [title, setTitle] = useState(initialPresentation.title);
  const [slides, setSlides] = useState(initialPresentation.slides);
  const [selectedSlide, setSelectedSlide] = useState(0);
  const [editingTitle, setEditingTitle] = useState(false);

  const updateHeading = (index, newHeading) => {
    const updated = [...slides];
    updated[index].heading = newHeading;
    setSlides(updated);
  };

  const updateBullet = (slideIndex, bulletIndex, value) => {
    const updated = [...slides];
    updated[slideIndex].content[bulletIndex] = value;
    setSlides(updated);
  };

  const addSlide = () => {
    const newSlide = {
      slideNumber: slides.length + 1,
      heading: "New Slide",
      content: ["New point 1", "New point 2"],
    };
    setSlides([...slides, newSlide]);
    setSelectedSlide(slides.length);
  };

  const deleteSlide = (index) => {
    const updated = slides.filter((_, i) => i !== index);
    setSlides(updated);
    setSelectedSlide(Math.min(selectedSlide, updated.length - 1));
  };

  const slide = slides[selectedSlide];

  return (
    <div style={{
      minHeight: "100vh",
      background: "#0f0f11",
      fontFamily: "'DM Sans', sans-serif",
      display: "flex",
      flexDirection: "column",
    }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=DM+Mono:wght@400;500&family=Playfair+Display:wght@700;800&display=swap');
        * { box-sizing: border-box; }
        ::-webkit-scrollbar { width: 5px; }
        ::-webkit-scrollbar-track { background: #1a1a1f; }
        ::-webkit-scrollbar-thumb { background: #333; border-radius: 4px; }
        textarea:focus, input:focus { outline: none; }
        .thumb-item { transition: all 0.15s; }
        .thumb-item:hover { border-color: #7c3aed !important; transform: scale(1.02); }
        .action-btn:hover { background: #27272a !important; }
        .del-btn:hover { background: #3f1515 !important; border-color: #ef4444 !important; color: #fca5a5 !important; }
        .bullet-row:hover .bullet-del { opacity: 1 !important; }
        .add-bullet-btn:hover { background: #7c3aed18 !important; border-color: #7c3aed !important; }
      `}</style>

      {/* TOP BAR */}
      <div style={{
        background: "#18181b",
        borderBottom: "1px solid #27272a",
        height: "58px",
        display: "flex",
        alignItems: "center",
        padding: "0 20px",
        gap: "14px",
        flexShrink: 0,
        zIndex: 20,
      }}>
        <button
          onClick={() => navigate("/")}
          style={{
            background: "transparent", border: "none", color: "#9ca3af",
            fontSize: "20px", cursor: "pointer", borderRadius: "8px",
            width: "36px", height: "36px", display: "flex", alignItems: "center",
            justifyContent: "center", transition: "background 0.15s",
          }}
          onMouseEnter={e => e.currentTarget.style.background = "#27272a"}
          onMouseLeave={e => e.currentTarget.style.background = "transparent"}
        >
          ←
        </button>

        <div style={{ width: "1px", height: "24px", background: "#27272a" }} />

        {editingTitle ? (
          <input
            autoFocus
            value={title}
            onChange={e => setTitle(e.target.value)}
            onBlur={() => setEditingTitle(false)}
            style={{
              background: "#27272a", border: "1px solid #7c3aed",
              borderRadius: "8px", color: "#fff", fontSize: "15px",
              fontWeight: 600, fontFamily: "'DM Sans', sans-serif",
              padding: "6px 12px", width: "260px",
            }}
          />
        ) : (
          <div
            onClick={() => setEditingTitle(true)}
            style={{
              color: "#f4f4f5", fontSize: "15px", fontWeight: 600,
              cursor: "text", padding: "6px 10px", borderRadius: "8px",
              border: "1px solid transparent", display: "flex",
              alignItems: "center", gap: "8px", transition: "border-color 0.15s",
            }}
            onMouseEnter={e => e.currentTarget.style.borderColor = "#3f3f46"}
            onMouseLeave={e => e.currentTarget.style.borderColor = "transparent"}
          >
            {title}
            <span style={{ color: "#52525b", fontSize: "12px" }}>✎</span>
          </div>
        )}

        <div style={{ flex: 1 }} />

        <span style={{
          color: "#71717a", fontSize: "12px", fontFamily: "'DM Mono', monospace",
          background: "#27272a", padding: "5px 12px", borderRadius: "6px",
        }}>
          {slides.length} slide{slides.length !== 1 ? "s" : ""}
        </span>

        <button
          onClick={addSlide}
          style={{
            background: "transparent", border: "1px solid #3f3f46",
            borderRadius: "10px", color: "#a78bfa", cursor: "pointer",
            padding: "7px 16px", fontSize: "13px", fontWeight: 600,
            fontFamily: "'DM Sans', sans-serif", display: "flex",
            alignItems: "center", gap: "6px", transition: "all 0.15s",
          }}
          onMouseEnter={e => { e.currentTarget.style.background = "#1e1a2e"; e.currentTarget.style.borderColor = "#7c3aed"; }}
          onMouseLeave={e => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.borderColor = "#3f3f46"; }}
        >
          + Add Slide
        </button>
      </div>

      {/* BODY */}
      <div style={{ display: "flex", flex: 1, overflow: "hidden" }}>

        {/* LEFT: Thumbnails */}
        <div style={{
          width: "176px", background: "#141417",
          borderRight: "1px solid #27272a", overflowY: "auto",
          flexShrink: 0, padding: "16px 12px",
          display: "flex", flexDirection: "column", gap: "10px",
        }}>
          <p style={{
            color: "#52525b", fontSize: "10px", fontWeight: 600,
            letterSpacing: "0.12em", textTransform: "uppercase",
            fontFamily: "'DM Mono', monospace", margin: "0 0 4px",
          }}>
            Slides
          </p>

          {slides.map((s, i) => (
            <div
              key={i}
              className="thumb-item"
              onClick={() => setSelectedSlide(i)}
              style={{
                background: "linear-gradient(135deg, #1e1b4b, #312e81)",
                borderRadius: "10px", padding: "10px", cursor: "pointer",
                border: selectedSlide === i ? "2px solid #7c3aed" : "2px solid transparent",
                boxShadow: selectedSlide === i ? "0 0 0 3px #7c3aed33" : "0 2px 8px rgba(0,0,0,0.3)",
                minHeight: "72px",
              }}
            >
              <div style={{ color: "#a78bfa", fontSize: "8px", fontWeight: 700, fontFamily: "'DM Mono', monospace", marginBottom: "3px" }}>
                {i + 1}
              </div>
              <div style={{
                color: "#e0e7ff", fontSize: "8px", fontWeight: 700,
                fontFamily: "'Playfair Display', serif", lineHeight: 1.3,
                marginBottom: "5px", overflow: "hidden", whiteSpace: "nowrap", textOverflow: "ellipsis",
              }}>
                {s.heading}
              </div>
              <div style={{ width: "18px", height: "2px", background: "#7c3aed", borderRadius: "1px", marginBottom: "5px" }} />
              {s.content.slice(0, 2).map((pt, pi) => (
                <div key={pi} style={{
                  color: "#c7d2fe", fontSize: "6px", opacity: 0.7,
                  fontFamily: "'DM Sans', sans-serif", lineHeight: 1.5,
                  overflow: "hidden", whiteSpace: "nowrap", textOverflow: "ellipsis",
                }}>
                  · {pt}
                </div>
              ))}
            </div>
          ))}
        </div>

        {/* CENTER: Canvas */}
        <div style={{
          flex: 1, display: "flex", flexDirection: "column",
          alignItems: "center", justifyContent: "center",
          padding: "40px 48px", overflowY: "auto",
          background: "radial-gradient(ellipse at center, #1c1c22 0%, #0f0f11 80%)",
          position: "relative",
        }}>
          {/* dot grid */}
          <div style={{
            position: "absolute", inset: 0,
            backgroundImage: "radial-gradient(circle, #2a2a35 1px, transparent 1px)",
            backgroundSize: "26px 26px", pointerEvents: "none",
          }} />

          {/* hint pill */}
          <div style={{
            position: "absolute", top: "18px", left: "50%", transform: "translateX(-50%)",
            background: "#1e1e24", border: "1px solid #2a2a35", borderRadius: "100px",
            padding: "5px 14px", color: "#71717a", fontSize: "11px",
            fontFamily: "'DM Sans', sans-serif", whiteSpace: "nowrap", zIndex: 2,
          }}>
            ✎ Click any text to edit
          </div>

          {/* SLIDE CARD */}
          {slide && (
            <div style={{
              width: "100%", maxWidth: "700px",
              background: "linear-gradient(135deg, #1e1b4b 0%, #312e81 60%, #1e1b4b 100%)",
              borderRadius: "20px", padding: "48px 52px",
              boxShadow: "0 32px 80px rgba(0,0,0,0.6), 0 0 0 1px #312e81",
              position: "relative", overflow: "hidden", zIndex: 1,
            }}>
              {/* blobs */}
              <div style={{ position: "absolute", top: "-60px", right: "-60px", width: "220px", height: "220px", borderRadius: "50%", background: "#7c3aed22", pointerEvents: "none" }} />
              <div style={{ position: "absolute", bottom: "-40px", left: "10px", width: "100px", height: "100px", borderRadius: "50%", background: "#6d28d915", pointerEvents: "none" }} />

              {/* slide number badge */}
              <div style={{
                display: "inline-block", background: "#7c3aed22", color: "#a78bfa",
                fontSize: "11px", fontWeight: 700, letterSpacing: "0.1em",
                padding: "4px 12px", borderRadius: "100px",
                fontFamily: "'DM Mono', monospace", marginBottom: "24px",
              }}>
                SLIDE {slide.slideNumber || selectedSlide + 1}
              </div>

              {/* Heading input */}
              <input
                value={slide.heading}
                onChange={e => updateHeading(selectedSlide, e.target.value)}
                style={{
                  display: "block", width: "100%", background: "transparent",
                  border: "none", borderBottom: "2px solid transparent",
                  color: "#f0eeff", fontSize: "32px", fontWeight: 800,
                  fontFamily: "'Playfair Display', serif", lineHeight: 1.2,
                  marginBottom: "12px", padding: "2px 4px", borderRadius: "4px",
                  transition: "border-bottom 0.15s", cursor: "text",
                }}
                onFocus={e => e.currentTarget.style.borderBottom = "2px solid #7c3aed"}
                onBlur={e => e.currentTarget.style.borderBottom = "2px solid transparent"}
              />

              <div style={{ width: "52px", height: "3px", background: "linear-gradient(90deg, #7c3aed, #a78bfa)", borderRadius: "2px", marginBottom: "28px" }} />

              {/* Bullets */}
              <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                {slide.content.map((point, bulletIndex) => (
                  <div
                    key={bulletIndex}
                    className="bullet-row"
                    style={{ display: "flex", alignItems: "center", gap: "12px" }}
                  >
                    <span style={{
                      width: "7px", height: "7px", borderRadius: "50%",
                      background: "#7c3aed", boxShadow: "0 0 8px #7c3aed88", flexShrink: 0,
                    }} />
                    <input
                      value={point}
                      onChange={e => updateBullet(selectedSlide, bulletIndex, e.target.value)}
                      style={{
                        flex: 1, background: "transparent", border: "none",
                        borderBottom: "1px solid transparent", color: "#c7d2fe",
                        fontSize: "15px", fontFamily: "'DM Sans', sans-serif",
                        lineHeight: 1.6, padding: "2px 4px", borderRadius: "4px",
                        transition: "border-bottom 0.15s", cursor: "text",
                      }}
                      onFocus={e => e.currentTarget.style.borderBottom = "1px solid #7c3aed88"}
                      onBlur={e => e.currentTarget.style.borderBottom = "1px solid transparent"}
                    />
                    <button
                      className="bullet-del"
                      onClick={() => {
                        const updated = [...slides];
                        updated[selectedSlide].content = updated[selectedSlide].content.filter((_, bi) => bi !== bulletIndex);
                        setSlides(updated);
                      }}
                      style={{
                        opacity: 0, background: "transparent", border: "none",
                        color: "#ef4444", cursor: "pointer", fontSize: "13px",
                        padding: "2px 6px", borderRadius: "4px",
                        transition: "opacity 0.15s", flexShrink: 0,
                      }}
                    >
                      ✕
                    </button>
                  </div>
                ))}
              </div>

              {/* Add bullet */}
              <button
                className="add-bullet-btn"
                onClick={() => {
                  const updated = [...slides];
                  updated[selectedSlide].content = [...updated[selectedSlide].content, "New point"];
                  setSlides(updated);
                }}
                style={{
                  marginTop: "24px", background: "transparent",
                  border: "1.5px dashed #7c3aed66", borderRadius: "8px",
                  color: "#a78bfa", cursor: "pointer", padding: "8px 16px",
                  fontSize: "12px", fontWeight: 600, fontFamily: "'DM Sans', sans-serif",
                  width: "100%", transition: "all 0.15s", display: "flex",
                  alignItems: "center", justifyContent: "center", gap: "6px",
                }}
              >
                + Add bullet point
              </button>
            </div>
          )}

          {/* Nav */}
          <div style={{ display: "flex", gap: "12px", marginTop: "28px", alignItems: "center", zIndex: 1 }}>
            <button
              onClick={() => setSelectedSlide(Math.max(0, selectedSlide - 1))}
              disabled={selectedSlide === 0}
              style={{
                background: selectedSlide === 0 ? "#1e1e24" : "#27272a",
                border: "none", borderRadius: "10px",
                color: selectedSlide === 0 ? "#3f3f46" : "#d4d4d8",
                cursor: selectedSlide === 0 ? "not-allowed" : "pointer",
                width: "40px", height: "40px", fontSize: "20px",
                display: "flex", alignItems: "center", justifyContent: "center",
              }}
            >
              ‹
            </button>
            <span style={{
              color: "#71717a", fontFamily: "'DM Mono', monospace", fontSize: "12px",
              background: "#1e1e24", padding: "8px 18px", borderRadius: "100px",
              minWidth: "80px", textAlign: "center",
            }}>
              {selectedSlide + 1} / {slides.length}
            </span>
            <button
              onClick={() => setSelectedSlide(Math.min(slides.length - 1, selectedSlide + 1))}
              disabled={selectedSlide === slides.length - 1}
              style={{
                background: selectedSlide === slides.length - 1 ? "#1e1e24" : "#27272a",
                border: "none", borderRadius: "10px",
                color: selectedSlide === slides.length - 1 ? "#3f3f46" : "#d4d4d8",
                cursor: selectedSlide === slides.length - 1 ? "not-allowed" : "pointer",
                width: "40px", height: "40px", fontSize: "20px",
                display: "flex", alignItems: "center", justifyContent: "center",
              }}
            >
              ›
            </button>
          </div>
        </div>

        {/* RIGHT: Actions */}
        <div style={{
          width: "200px", background: "#141417", borderLeft: "1px solid #27272a",
          padding: "20px 14px", flexShrink: 0,
          display: "flex", flexDirection: "column", gap: "6px", overflowY: "auto",
        }}>
          <p style={{
            color: "#52525b", fontSize: "10px", fontWeight: 600, letterSpacing: "0.12em",
            textTransform: "uppercase", fontFamily: "'DM Mono', monospace", margin: "0 0 10px",
          }}>
            Actions
          </p>

          <button
            className="action-btn"
            onClick={addSlide}
            style={{
              background: "transparent", border: "1px solid #27272a", borderRadius: "10px",
              color: "#d4d4d8", cursor: "pointer", padding: "10px 14px", fontSize: "13px",
              fontFamily: "'DM Sans', sans-serif", textAlign: "left",
              display: "flex", alignItems: "center", gap: "8px",
              transition: "background 0.15s", width: "100%",
            }}
          >
            <span style={{ color: "#a78bfa" }}>＋</span> New slide
          </button>

          <button
            className="action-btn"
            onClick={() => {
              const updated = [...slides];
              updated[selectedSlide].content = [...updated[selectedSlide].content, "New point"];
              setSlides(updated);
            }}
            style={{
              background: "transparent", border: "1px solid #27272a", borderRadius: "10px",
              color: "#d4d4d8", cursor: "pointer", padding: "10px 14px", fontSize: "13px",
              fontFamily: "'DM Sans', sans-serif", textAlign: "left",
              display: "flex", alignItems: "center", gap: "8px",
              transition: "background 0.15s", width: "100%",
            }}
          >
            <span style={{ color: "#a78bfa" }}>＋</span> Add bullet
          </button>

          <div style={{ height: "1px", background: "#27272a", margin: "8px 0" }} />

          <button
            className="del-btn"
            onClick={() => deleteSlide(selectedSlide)}
            disabled={slides.length === 1}
            style={{
              background: "transparent",
              border: "1px solid #27272a",
              borderRadius: "10px",
              color: slides.length === 1 ? "#3f3f46" : "#a1a1aa",
              cursor: slides.length === 1 ? "not-allowed" : "pointer",
              padding: "10px 14px", fontSize: "13px",
              fontFamily: "'DM Sans', sans-serif", textAlign: "left",
              display: "flex", alignItems: "center", gap: "8px",
              transition: "all 0.15s", width: "100%",
            }}
          >
            <span>✕</span> Delete slide
          </button>

          <div style={{ flex: 1 }} />

          {/* Info card */}
          <div style={{
            background: "#1e1e24", borderRadius: "10px",
            padding: "12px", marginTop: "16px",
          }}>
            <div style={{ color: "#52525b", fontSize: "10px", fontFamily: "'DM Mono', monospace", marginBottom: "8px", letterSpacing: "0.08em" }}>
              CURRENT SLIDE
            </div>
            <div style={{ color: "#e4e4e7", fontSize: "13px", fontWeight: 600, marginBottom: "4px" }}>
              {slide?.heading?.slice(0, 22)}{slide?.heading?.length > 22 ? "…" : ""}
            </div>
            <div style={{ color: "#71717a", fontSize: "11px", fontFamily: "'DM Mono', monospace" }}>
              {slide?.content?.length} bullet{slide?.content?.length !== 1 ? "s" : ""}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}