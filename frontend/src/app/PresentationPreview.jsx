import { useLocation, useNavigate } from "react-router-dom";
import { useState } from "react";
import { Button } from "./components/ui/button";
export default function PresentationPreview() {
  const { state } = useLocation();
  const navigate = useNavigate();
  const initialPresentation = state?.presentation;
  const selectedTheme = state?.theme;
  const textAmount = state?.textAmount || "detailed";

  if (!initialPresentation) {
    return (
      <div style={{ padding: 40 }}>
        <p>No presentation found.</p>
        <button onClick={() => navigate("/")}>Go Back</button>
      </div>
    );
  }

  const [slides, setSlides] = useState(initialPresentation.slides);

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
        background: "#f3f4f6",
        padding: "40px",
        fontFamily: "Inter, sans-serif",
      }}
    >
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
        <h2 style={{ fontSize: 18, fontWeight: 600 }}>Outline</h2>
        <div style={{ fontSize: 14, color: "#6b7280" }}>
          Templates
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
      onClick={()=>navigate("/presentation-view",{ state:{slides, theme: selectedTheme, textAmount}})}  // sends all teh content of slides to the new route
      className="px-8 text-white disabled:opacity-50 disabled:cursor-not-allowed shadow-xl  transform hover:scale-105 transition-all duration-300"
    >
      Generate Presentation   

      </Button>
      
     </div>
    </div>
  );
}
