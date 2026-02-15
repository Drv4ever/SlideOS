import { useLocation, useNavigate } from "react-router-dom";
import { useState } from "react";
export default function PresentationPreview() {
  const { state } = useLocation();
  const navigate = useNavigate();

  if (!state?.presentation) {
    return (
      <div className="p-6">
        <p>No presentation found.</p>
        <button onClick={() => navigate("/")}>
          Go back
        </button>
      </div>
    );
  }

  const { title, slides } = state.presentation;

  return (
    <div className="p-8 space-y-6">
      <h1 className="text-4xl font-bold">{title}</h1>

      {slides.map(slide => (
        <div key={slide.slideNumber} className="p-4 border rounded-lg bg-white">
          <h2 className="text-xl font-semibold">
            {slide.slideNumber}. {slide.heading}
          </h2>
          <ul className="list-disc ml-6 mt-2">
            {slide.content.map((point, i) => (
              <li key={i}>{point}</li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  );
}
