import { useLocation, useNavigate } from "react-router-dom";
import { useState } from "react";
import { Button } from "../components/ui/button";
import { updatePresentation } from "../services/presentationService";

const themePalette = {
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
      <div style={{ padding: 40 }}>
        <p>No presentation found.</p>
        <button onClick={() => navigate("/")}>Go Back</button>
      </div>
    );
  }

  const [slides, setSlides] = useState(initialPresentation.slides);
  const [isSaving, setIsSaving] = useState(false);

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
        heading: "New Slide",
        content: ["New point 1"],
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
        title: initialTitle,
        theme: themeId,
        slidesCount: slides.length,
        content: {
          ...initialPresentation,
          slides,
        },
      });
      alert("Presentation updated successfully");
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
    <div
      style={{
        minHeight: "100vh",
        background: activeTheme.background,
        padding: "24px",
        fontFamily: "Inter, sans-serif",
      }}
    >
      <div
        style={{
          maxWidth: "1100px",
          margin: "0 auto 24px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          padding: "14px 18px",
          borderRadius: "18px",
          border: `1px solid ${activeTheme.primary}33`,
          background: "rgba(255,255,255,0.78)",
          backdropFilter: "blur(12px)",
        }}
      >
        <button
          onClick={() => navigate("/")}
          type="button"
          style={{
            fontSize: 22,
            fontWeight: 700,
            border: "none",
            background: "transparent",
            cursor: "pointer",
            backgroundImage: `linear-gradient(90deg, ${activeTheme.primary}, ${activeTheme.secondary})`,
            WebkitBackgroundClip: "text",
            color: "transparent",
          }}
        >
          SlideOS
        </button>
        <div style={{ display: "flex", gap: 10 }}>
          <Button
            variant="outline"
            onClick={() => navigate("/")}
          >
            Back to Prompt
          </Button>
          <Button
            onClick={() => navigate("/my-presentations")}
            style={{
              background: `linear-gradient(135deg, ${activeTheme.primary}, ${activeTheme.secondary})`,
              color: "#fff",
            }}
          >
            My Presentations
          </Button>
        </div>
      </div>

      {/* HEADER */}
      <div
        style={{
          maxWidth: "800px",
          margin: "0 auto 30px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <h2 style={{ fontSize: 18, fontWeight: 600, color: activeTheme.text }}>
          {initialTitle}
        </h2>
        <div style={{ fontSize: 14, color: "#6b7280" }}>
          Outline Editor
        </div>
      </div>

      {/* SLIDES */}
      <div
        style={{
          maxWidth: "800px",
          margin: "0 auto",
          display: "flex",
          flexDirection: "column",
          gap: "16px",
        }}
      >
        {slides.map((slide, slideIndex) => (
          <div
            key={slideIndex}
            style={{
              background: "#ffffff",
              borderRadius: "12px",
              padding: "20px",
              display: "flex",
              gap: "16px",
              alignItems: "flex-start",
              boxShadow: "0 2px 6px rgba(0,0,0,0.05)",
              border: "1px solid #e5e7eb",
            }}
          >
            {/* Slide Number */}
            <div
              style={{
                width: 28,
                height: 28,
                borderRadius: "6px",
                background: "#e5e7eb",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 13,
                fontWeight: 600,
                color: "#374151",
              }}
            >
              {slideIndex + 1}
            </div>

            {/* Slide Content */}
            <div style={{ flex: 1 }}>
              {/* Editable Heading */}
              <input
                value={slide.heading}
                onChange={(e) =>
                  updateHeading(slideIndex, e.target.value)
                }
                style={{
                  width: "100%",
                  fontSize: 16,
                  fontWeight: 600,
                  border: "none",
                  outline: "none",
                  marginBottom: 8,
                  color: "#111827",
                }}
              />

              {/* Editable Bullets */}
              <ul
                style={{
                  paddingLeft: "18px",
                  margin: 0,
                }}
              >
                {slide.content.map((point, bulletIndex) => (
                  <li
                    key={bulletIndex}
                    style={{
                      marginBottom: 6,
                      display: "flex",
                      alignItems: "center",
                      gap: "8px",
                    }}
                  >
                    <input
                      value={point}
                      onChange={(e) =>
                        updateBullet(
                          slideIndex,
                          bulletIndex,
                          e.target.value
                        )
                      }
                      style={{
                        flex: 1,
                        border: "none",
                        outline: "none",
                        fontSize: 14,
                        color: "#4b5563",
                      }}
                    />

                    <button
                      onClick={() =>
                        deleteBullet(
                          slideIndex,
                          bulletIndex
                        )
                      }
                      style={{
                        background: "transparent",
                        border: "none",
                        cursor: "pointer",
                        color: "#9ca3af",
                        fontSize: 14,
                      }}
                    >
                      ✕
                    </button>
                  </li>
                ))}
              </ul>

              {/* Add Bullet */}
              <button
                onClick={() => addBullet(slideIndex)}
                style={{
                  marginTop: 6,
                  background: "transparent",
                  border: "none",
                  cursor: "pointer",
                  color: "#6b7280",
                  fontSize: 13,
                }}
              >
                + Add point
              </button>
            </div>

            {/* Delete Slide */}
            <button
              onClick={() => deleteSlide(slideIndex)}
              style={{
                background: "transparent",
                border: "none",
                cursor: "pointer",
                color: "#9ca3af",
                fontSize: 16,
              }}
            >
              ✕
            </button>
          </div>
        ))}

        {/* Add Slide */}
        <div
          onClick={addSlide}
          style={{
            background: "#e5e7eb",
            borderRadius: "12px",
            padding: "16px",
            textAlign: "center",
            cursor: "pointer",
            fontSize: 14,
            color: "#374151",
          }}
        >
          + Add card
        </div>

        {/* Footer */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            fontSize: 12,
            color: "#6b7280",
            marginTop: 10,
          }}
        >
          <div>{slides.length} cards total</div>
          <div>{totalCharacters}/20000</div>

        </div>

      </div>


     {/* button create presentation  */}
     <div className="flex justify-center item-center">

      <Button
      onClick={()=>navigate("/presentation-view",{ state:{slides, theme: selectedTheme, textAmount, presentationId, title: initialTitle, themeId}})}  // sends all teh content of slides to the new route
      className="px-8 text-white disabled:opacity-50 disabled:cursor-not-allowed shadow-xl  transform hover:scale-105 transition-all duration-300"
    >
      Generate Presentation   

      </Button>
      <Button
      onClick={handleSaveChanges}
      disabled={!presentationId || isSaving}
      className="ml-4 px-8 text-white disabled:opacity-50 disabled:cursor-not-allowed shadow-xl transform hover:scale-105 transition-all duration-300"
      >
        {isSaving ? "Saving..." : "Save Changes"}
      </Button>
      
     </div>
    </div>
  );
}
