import { useLocation, useNavigate } from "react-router-dom";
import { useState } from "react";

export default function PresentationPreview() {
  const { state } = useLocation();
  const navigate = useNavigate();
  const initialPresentation = state?.presentation;
  const themeData = state?.theme;

  if (!initialPresentation) {
    return (
      <div style={{ minHeight: "100vh", background: "#f0f0f0", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "Inter, sans-serif" }}>
        <div style={{ textAlign: "center", color: "#71717a" }}>
          <p style={{ marginBottom: "16px" }}>No presentation found.</p>
          <button onClick={() => navigate("/")} style={{ background: "#6366f1", border: "none", borderRadius: "8px", color: "#fff", cursor: "pointer", padding: "9px 20px", fontSize: "13px" }}>
            Go back
          </button>
        </div>
      </div>
    );
  }

  const [title, setTitle] = useState(initialPresentation.title);
  const [slides, setSlides] = useState(initialPresentation.slides);
  const [selectedSlide, setSelectedSlide] = useState(0);
  const [editingTitle, setEditingTitle] = useState(false);
  const [activeLeft, setActiveLeft] = useState(null);

  const primary     = themeData?.colors?.primary    ?? "#6366f1";
  const secondary   = themeData?.colors?.secondary  ?? "#818cf8";
  const slideBg     = themeData?.colors?.background ?? "#ffffff";
  const textColor   = themeData?.colors?.text       ?? "#1e1b4b";
  const headingFont = `${themeData?.fontFamily?.heading ?? "Inter"}, sans-serif`;
  const bodyFont    = `${themeData?.fontFamily?.body    ?? "Inter"}, sans-serif`;
  const subtext     = `${textColor}66`;
  const border      = `${primary}22`;

  const updateHeading = (index, val) => {
    const updated = [...slides]; updated[index].heading = val; setSlides(updated);
  };
  const updateBullet = (si, bi, val) => {
    const updated = [...slides]; updated[si].content[bi] = val; setSlides(updated);
  };
  const addSlide = () => {
    const n = { slideNumber: slides.length + 1, heading: "New Slide", content: ["New point 1", "New point 2"] };
    setSlides([...slides, n]); setSelectedSlide(slides.length);
  };
  const deleteSlide = (index) => {
    const updated = slides.filter((_, i) => i !== index);
    setSlides(updated); setSelectedSlide(Math.min(selectedSlide, updated.length - 1));
  };

  const slide = slides[selectedSlide];

  const leftIcons = [
    { id: "slides", icon: "⊞", label: "Slides" },
    { id: "text", icon: "T", label: "Text" },
    { id: "theme", icon: "◑", label: "Theme" },
  ];

  return (
    <div style={{ height: "100vh", display: "flex", flexDirection: "column", fontFamily: bodyFont, background: "#e8e9ea", overflow: "hidden" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=Poppins:wght@400;600;700&family=Space+Grotesk:wght@400;600;700&family=IBM+Plex+Sans:wght@300;400;500&family=Source+Sans+Pro:wght@300;400;600&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        input { font-family: inherit; }
        input:focus { outline: none; }
        ::-webkit-scrollbar { width: 4px; height: 4px; }
        ::-webkit-scrollbar-thumb { background: #ccc; border-radius: 4px; }
        .brow:hover .bdel { opacity: 1 !important; }
        .thumb:hover { box-shadow: 0 0 0 2px ${primary} !important; }
        .nav-icon:hover { background: #e0e0e0 !important; }
        .topbtn:hover { background: #f0f0f0 !important; }
      `}</style>

      {/* ── TOP BAR (Canva-style) ── */}
      <div style={{
        height: "56px", background: "#ffffff",
        borderBottom: "1px solid #e5e5e5",
        display: "flex", alignItems: "center",
        padding: "0 16px", gap: "8px",
        flexShrink: 0, zIndex: 30,
      }}>
        {/* Logo area */}
        <button
          onClick={() => navigate("/")}
          style={{ background: "transparent", border: "none", cursor: "pointer", padding: "6px", borderRadius: "8px", display: "flex", alignItems: "center", gap: "6px" }}
        >
          <div style={{ width: "28px", height: "28px", borderRadius: "8px", background: `linear-gradient(135deg, ${primary}, ${secondary})`, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <span style={{ color: "#fff", fontSize: "14px", fontWeight: 700 }}>P</span>
          </div>
        </button>

        <div style={{ width: "1px", height: "20px", background: "#e5e5e5", margin: "0 4px" }} />

        {/* File / Resize / Editing pills */}
        {["File", "Resize", "Editing"].map(label => (
          <button key={label} className="topbtn" style={{
            background: "transparent", border: "none", borderRadius: "6px",
            color: "#374151", fontSize: "13px", cursor: "pointer",
            padding: "5px 10px", display: "flex", alignItems: "center", gap: "4px",
            transition: "background 0.15s",
          }}>
            {label} {label === "Editing" && <span style={{ fontSize: "10px", opacity: 0.5 }}>▾</span>}
          </button>
        ))}

        {/* Undo / redo */}
        <div style={{ display: "flex", gap: "2px", marginLeft: "4px" }}>
          {["↩", "↪"].map((ic, i) => (
            <button key={i} className="nav-icon" style={{
              background: "transparent", border: "none", borderRadius: "6px",
              color: "#6b7280", fontSize: "16px", cursor: "pointer",
              width: "32px", height: "32px", display: "flex", alignItems: "center", justifyContent: "center",
              transition: "background 0.15s",
            }}>{ic}</button>
          ))}
        </div>

        {/* Center: Title */}
        <div style={{ flex: 1, display: "flex", justifyContent: "center" }}>
          {editingTitle ? (
            <input
              autoFocus
              value={title}
              onChange={e => setTitle(e.target.value)}
              onBlur={() => setEditingTitle(false)}
              style={{
                background: "#f9fafb", border: `1px solid ${primary}`,
                borderRadius: "6px", color: "#111827", fontSize: "14px",
                fontWeight: 500, padding: "5px 12px", width: "280px", textAlign: "center",
              }}
            />
          ) : (
            <span
              onClick={() => setEditingTitle(true)}
              style={{ color: "#374151", fontSize: "14px", fontWeight: 500, cursor: "text", padding: "5px 12px", borderRadius: "6px", transition: "background 0.15s" }}
              onMouseEnter={e => e.currentTarget.style.background = "#f3f4f6"}
              onMouseLeave={e => e.currentTarget.style.background = "transparent"}
            >
              {title}
            </span>
          )}
        </div>

        {/* Right: Present + Share */}
        <button style={{
          background: "transparent", border: "1px solid #e5e5e5",
          borderRadius: "8px", color: "#374151", cursor: "pointer",
          padding: "7px 16px", fontSize: "13px", fontWeight: 500,
          display: "flex", alignItems: "center", gap: "6px",
          transition: "background 0.15s",
        }}
          onMouseEnter={e => e.currentTarget.style.background = "#f3f4f6"}
          onMouseLeave={e => e.currentTarget.style.background = "transparent"}
        >
          ▶ Present
        </button>

        <button style={{
          background: primary, border: "none",
          borderRadius: "8px", color: "#fff", cursor: "pointer",
          padding: "7px 16px", fontSize: "13px", fontWeight: 600,
          display: "flex", alignItems: "center", gap: "6px",
        }}>
          ↑ Share
        </button>
      </div>

      {/* ── MAIN AREA ── */}
      <div style={{ flex: 1, display: "flex", overflow: "hidden" }}>

        {/* ── FAR LEFT: Icon rail ── */}
        <div style={{
          width: "60px", background: "#ffffff",
          borderRight: "1px solid #e5e5e5",
          display: "flex", flexDirection: "column",
          alignItems: "center", paddingTop: "12px", gap: "4px",
          flexShrink: 0, zIndex: 20,
        }}>
          {leftIcons.map(item => (
            <button
              key={item.id}
              onClick={() => setActiveLeft(activeLeft === item.id ? null : item.id)}
              style={{
                background: activeLeft === item.id ? "#f3f4f6" : "transparent",
                border: "none", borderRadius: "10px",
                color: activeLeft === item.id ? primary : "#6b7280",
                cursor: "pointer", width: "48px", padding: "10px 4px 6px",
                display: "flex", flexDirection: "column", alignItems: "center", gap: "4px",
                transition: "all 0.15s", fontFamily: bodyFont,
              }}
              onMouseEnter={e => { if (activeLeft !== item.id) { e.currentTarget.style.background = "#f9fafb"; e.currentTarget.style.color = "#374151"; }}}
              onMouseLeave={e => { if (activeLeft !== item.id) { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = "#6b7280"; }}}
            >
              <span style={{ fontSize: "18px", lineHeight: 1 }}>{item.icon}</span>
              <span style={{ fontSize: "10px" }}>{item.label}</span>
            </button>
          ))}
        </div>

        {/* ── LEFT PANEL (expands when icon active) ── */}
        {activeLeft && (
          <div style={{
            width: "220px", background: "#ffffff",
            borderRight: "1px solid #e5e5e5",
            overflowY: "auto", flexShrink: 0,
            padding: "16px 12px",
            display: "flex", flexDirection: "column", gap: "8px",
            zIndex: 15,
          }}>
            {activeLeft === "slides" && (
              <>
                <p style={{ color: "#6b7280", fontSize: "11px", fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: "8px" }}>All Slides</p>
                {slides.map((s, i) => (
                  <div
                    key={i}
                    onClick={() => setSelectedSlide(i)}
                    style={{
                      background: selectedSlide === i ? `${primary}10` : "#f9fafb",
                      border: selectedSlide === i ? `1.5px solid ${primary}` : "1.5px solid #e5e5e5",
                      borderRadius: "8px", padding: "10px", cursor: "pointer",
                      minHeight: "70px", transition: "all 0.15s",
                    }}
                  >
                    <div style={{ color: "#9ca3af", fontSize: "9px", marginBottom: "3px" }}>{i + 1}</div>
                    <div style={{ color: textColor, fontSize: "8px", fontWeight: 600, fontFamily: headingFont, lineHeight: 1.3, marginBottom: "4px", overflow: "hidden", whiteSpace: "nowrap", textOverflow: "ellipsis" }}>{s.heading}</div>
                    <div style={{ width: "14px", height: "1.5px", background: primary, borderRadius: "1px", marginBottom: "4px" }} />
                    {s.content.slice(0, 2).map((pt, pi) => (
                      <div key={pi} style={{ color: "#9ca3af", fontSize: "6px", lineHeight: 1.5, overflow: "hidden", whiteSpace: "nowrap", textOverflow: "ellipsis" }}>· {pt}</div>
                    ))}
                  </div>
                ))}
                <button
                  onClick={addSlide}
                  style={{
                    background: "transparent", border: `1.5px dashed #d1d5db`,
                    borderRadius: "8px", color: "#9ca3af", cursor: "pointer",
                    padding: "12px", fontSize: "12px", marginTop: "4px",
                    transition: "all 0.15s",
                  }}
                  onMouseEnter={e => { e.currentTarget.style.borderColor = primary; e.currentTarget.style.color = primary; }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor = "#d1d5db"; e.currentTarget.style.color = "#9ca3af"; }}
                >
                  + Add Slide
                </button>
              </>
            )}

            {activeLeft === "text" && (
              <>
                <p style={{ color: "#6b7280", fontSize: "11px", fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: "8px" }}>Text</p>
                {[
                  { label: "Add heading", size: "20px", weight: 700 },
                  { label: "Add subheading", size: "15px", weight: 600 },
                  { label: "Add bullet point", size: "13px", weight: 400 },
                ].map(item => (
                  <button
                    key={item.label}
                    onClick={() => {
                      if (item.label === "Add bullet point") {
                        const updated = [...slides]; updated[selectedSlide].content = [...updated[selectedSlide].content, "New point"]; setSlides(updated);
                      }
                    }}
                    style={{
                      background: "#f9fafb", border: "1px solid #e5e5e5",
                      borderRadius: "8px", color: textColor, cursor: "pointer",
                      padding: "12px", textAlign: "left", fontSize: item.size,
                      fontWeight: item.weight, fontFamily: headingFont,
                      transition: "all 0.15s", width: "100%",
                    }}
                    onMouseEnter={e => { e.currentTarget.style.borderColor = primary; e.currentTarget.style.background = `${primary}08`; }}
                    onMouseLeave={e => { e.currentTarget.style.borderColor = "#e5e5e5"; e.currentTarget.style.background = "#f9fafb"; }}
                  >
                    {item.label}
                  </button>
                ))}
              </>
            )}

            {activeLeft === "theme" && (
              <>
                <p style={{ color: "#6b7280", fontSize: "11px", fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: "8px" }}>Theme</p>
                {themeData && (
                  <div style={{ background: `${primary}10`, border: `1px solid ${primary}30`, borderRadius: "10px", padding: "12px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "10px" }}>
                      <div style={{ width: "28px", height: "28px", borderRadius: "6px", background: `linear-gradient(135deg, ${primary}, ${secondary})` }} />
                      <span style={{ color: textColor, fontSize: "13px", fontWeight: 600, fontFamily: headingFont }}>{themeData.name}</span>
                    </div>
                    <div style={{ display: "flex", gap: "6px", marginBottom: "8px" }}>
                      {[primary, secondary, slideBg].map((c, i) => (
                        <div key={i} style={{ width: "20px", height: "20px", borderRadius: "50%", background: c, border: "1px solid #e5e5e5" }} />
                      ))}
                    </div>
                    <div style={{ color: "#6b7280", fontSize: "10px" }}>{themeData.fonts}</div>
                  </div>
                )}
              </>
            )}
          </div>
        )}

        {/* ── CENTER: Canvas ── */}
        <div style={{
          flex: 1, display: "flex", flexDirection: "column",
          alignItems: "center", justifyContent: "center",
          background: "#e8e9ea", overflowY: "auto",
          padding: "40px 24px 100px",
          position: "relative",
        }}>
          {/* Slide card */}
          {slide && (
            <div style={{
              width: "100%", maxWidth: "860px",
              aspectRatio: "16/9",
              background: slideBg,
              borderRadius: "4px",
              boxShadow: "0 4px 32px rgba(0,0,0,0.18)",
              position: "relative", overflow: "hidden",
              display: "flex", flexDirection: "column",
              justifyContent: "center",
              padding: "60px 72px",
            }}>
              {/* Theme accent strip */}
              <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: "4px", background: `linear-gradient(90deg, ${primary}, ${secondary})` }} />

              {/* Slide number */}
              <div style={{ position: "absolute", top: "18px", left: "24px", color: subtext, fontSize: "11px", letterSpacing: "0.06em" }}>
                {String(selectedSlide + 1).padStart(2, "0")} / {String(slides.length).padStart(2, "0")}
              </div>

              {/* Delete slide */}
              <button
                onClick={() => deleteSlide(selectedSlide)}
                disabled={slides.length === 1}
                style={{
                  position: "absolute", top: "14px", right: "16px",
                  background: "transparent", border: "none",
                  color: slides.length === 1 ? "#d1d5db" : "#9ca3af",
                  cursor: slides.length === 1 ? "not-allowed" : "pointer",
                  fontSize: "12px", padding: "4px 8px", borderRadius: "4px",
                  transition: "color 0.15s",
                }}
                onMouseEnter={e => { if (slides.length > 1) e.currentTarget.style.color = "#ef4444"; }}
                onMouseLeave={e => e.currentTarget.style.color = slides.length === 1 ? "#d1d5db" : "#9ca3af"}
              >
                ✕ Delete slide
              </button>

              {/* Heading */}
              <input
                value={slide.heading}
                onChange={e => updateHeading(selectedSlide, e.target.value)}
                style={{
                  background: "transparent", border: "none",
                  color: textColor, fontSize: "clamp(22px, 3.5vw, 36px)",
                  fontWeight: 700, fontFamily: headingFont,
                  lineHeight: 1.2, marginBottom: "16px",
                  letterSpacing: "-0.02em", width: "100%",
                }}
                onFocus={e => e.currentTarget.style.background = `${primary}08`}
                onBlur={e => e.currentTarget.style.background = "transparent"}
              />

              {/* Accent */}
              <div style={{ width: "48px", height: "3px", background: `linear-gradient(90deg, ${primary}, ${secondary})`, borderRadius: "2px", marginBottom: "28px" }} />

              {/* Bullets */}
              <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                {slide.content.map((point, bi) => (
                  <div key={bi} className="brow" style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                    <span style={{ width: "6px", height: "6px", borderRadius: "50%", background: primary, flexShrink: 0, opacity: 0.75 }} />
                    <input
                      value={point}
                      onChange={e => updateBullet(selectedSlide, bi, e.target.value)}
                      style={{
                        flex: 1, background: "transparent", border: "none",
                        color: textColor, fontSize: "clamp(13px, 1.5vw, 16px)",
                        fontFamily: bodyFont, fontWeight: 400,
                        lineHeight: 1.6, opacity: 0.8,
                      }}
                      onFocus={e => e.currentTarget.style.background = `${primary}06`}
                      onBlur={e => e.currentTarget.style.background = "transparent"}
                    />
                    <button
                      className="bdel"
                      onClick={() => {
                        const updated = [...slides];
                        updated[selectedSlide].content = updated[selectedSlide].content.filter((_, i) => i !== bi);
                        setSlides(updated);
                      }}
                      style={{ opacity: 0, background: "transparent", border: "none", color: "#ef4444", cursor: "pointer", fontSize: "11px", padding: "2px 6px", borderRadius: "4px", transition: "opacity 0.15s", flexShrink: 0 }}
                    >✕</button>
                  </div>
                ))}
              </div>

              {/* Add bullet */}
              <button
                onClick={() => { const u = [...slides]; u[selectedSlide].content = [...u[selectedSlide].content, "New point"]; setSlides(u); }}
                style={{
                  marginTop: "20px", background: "transparent",
                  border: `1px dashed #d1d5db`, borderRadius: "6px",
                  color: "#9ca3af", cursor: "pointer", padding: "7px",
                  fontSize: "12px", fontFamily: bodyFont,
                  alignSelf: "flex-start", paddingLeft: "18px",
                  transition: "all 0.15s",
                }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = primary; e.currentTarget.style.color = primary; }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = "#d1d5db"; e.currentTarget.style.color = "#9ca3af"; }}
              >
                + Add bullet point
              </button>
            </div>
          )}
        </div>
      </div>

      {/* ── BOTTOM: Thumbnail strip (Canva-style) ── */}
      <div style={{
        height: "88px", background: "#f9fafb",
        borderTop: "1px solid #e5e5e5",
        display: "flex", alignItems: "center",
        padding: "0 16px", gap: "12px",
        overflowX: "auto", flexShrink: 0, zIndex: 20,
      }}>
        {slides.map((s, i) => (
          <div
            key={i}
            className="thumb"
            onClick={() => setSelectedSlide(i)}
            style={{
              flexShrink: 0, width: "110px", height: "64px",
              background: slideBg, borderRadius: "4px",
              border: selectedSlide === i ? `2px solid ${primary}` : "2px solid #e5e5e5",
              cursor: "pointer", padding: "8px",
              boxShadow: selectedSlide === i ? `0 0 0 2px ${primary}40` : "0 1px 4px rgba(0,0,0,0.08)",
              position: "relative", transition: "all 0.15s",
              overflow: "hidden",
            }}
          >
            <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: "2px", background: `linear-gradient(90deg, ${primary}, ${secondary})` }} />
            <div style={{ color: textColor, fontSize: "7px", fontWeight: 700, fontFamily: headingFont, lineHeight: 1.2, marginBottom: "3px", overflow: "hidden", whiteSpace: "nowrap", textOverflow: "ellipsis", marginTop: "4px" }}>
              {s.heading}
            </div>
            {s.content.slice(0, 2).map((pt, pi) => (
              <div key={pi} style={{ color: subtext, fontSize: "5.5px", lineHeight: 1.5, overflow: "hidden", whiteSpace: "nowrap", textOverflow: "ellipsis" }}>
                · {pt}
              </div>
            ))}
            <div style={{ position: "absolute", bottom: "4px", right: "5px", color: "#9ca3af", fontSize: "7px" }}>{i + 1}</div>
          </div>
        ))}

        {/* Add slide thumbnail button */}
        <button
          onClick={addSlide}
          style={{
            flexShrink: 0, width: "110px", height: "64px",
            background: "transparent", border: "2px dashed #d1d5db",
            borderRadius: "4px", cursor: "pointer", color: "#9ca3af",
            fontSize: "20px", display: "flex", alignItems: "center", justifyContent: "center",
            transition: "all 0.15s",
          }}
          onMouseEnter={e => { e.currentTarget.style.borderColor = primary; e.currentTarget.style.color = primary; }}
          onMouseLeave={e => { e.currentTarget.style.borderColor = "#d1d5db"; e.currentTarget.style.color = "#9ca3af"; }}
        >
          +
        </button>

        {/* Page count (bottom right like Canva) */}
        <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: "12px", flexShrink: 0 }}>
          <button
            onClick={() => setSelectedSlide(Math.max(0, selectedSlide - 1))}
            disabled={selectedSlide === 0}
            style={{ background: "transparent", border: "1px solid #e5e5e5", borderRadius: "6px", color: selectedSlide === 0 ? "#d1d5db" : "#6b7280", cursor: selectedSlide === 0 ? "not-allowed" : "pointer", width: "28px", height: "28px", fontSize: "14px", display: "flex", alignItems: "center", justifyContent: "center" }}
          >‹</button>
          <span style={{ color: "#6b7280", fontSize: "12px", whiteSpace: "nowrap" }}>
            {selectedSlide + 1} / {slides.length}
          </span>
          <button
            onClick={() => setSelectedSlide(Math.min(slides.length - 1, selectedSlide + 1))}
            disabled={selectedSlide === slides.length - 1}
            style={{ background: "transparent", border: "1px solid #e5e5e5", borderRadius: "6px", color: selectedSlide === slides.length - 1 ? "#d1d5db" : "#6b7280", cursor: selectedSlide === slides.length - 1 ? "not-allowed" : "pointer", width: "28px", height: "28px", fontSize: "14px", display: "flex", alignItems: "center", justifyContent: "center" }}
          >›</button>
        </div>
      </div>
    </div>
  );
}