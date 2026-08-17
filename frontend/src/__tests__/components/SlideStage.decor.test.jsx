import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { computeSlideLayout } from "../../utils/designedLayouts.js";
import SlideStage from "../../components/SlideStage.jsx";

const theme = {
  primary: "#3b82f6",
  accent: "#22d3ee",
  background: "#ffffff",
  surface: "#eff6ff",
  border: "#dbeafe",
  text: "#1e3a8a",
  textMuted: "#64748b",
  headingFont: "Georgia",
  bodyFont: "Arial",
};

const slide = {
  id: "s0",
  heading: "Market Growth Strategy",
  content: ["Revenue tripled", "Team scaling globally"],
  layout: "content-only",
};

// SlideStage sizes text with cqw units, which need a container that reports an
// inline size. A plain div with containerType works in happy-dom.
function renderSlide() {
  const desc = computeSlideLayout(slide, theme, { index: 0, total: 1 });
  return render(
    <div style={{ width: 800, containerType: "inline-size", aspectRatio: "16 / 9" }}>
      <SlideStage
        desc={desc}
        animating={false}
        accentFont={theme.headingFont}
        bodyFont={theme.bodyFont}
      />
    </div>
  );
}

describe("SlideStage decor rendering", () => {
  it("renders the watermark numeral", () => {
    renderSlide();
    expect(screen.getByText("01")).toBeTruthy();
  });

  it("renders the heading icon chip as an svg icon", () => {
    const { container } = renderSlide();
    const svg = container.querySelector("svg");
    expect(svg).toBeTruthy();
  });

  it("renders the soft blob shape and the accent divider", () => {
    const { container } = renderSlide();
    const blob = container.querySelector("[data-decor='blob']");
    const divider = container.querySelector("[data-decor='divider']");
    expect(blob).toBeTruthy();
    expect(divider).toBeTruthy();
  });
});