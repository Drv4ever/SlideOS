import PptxGenJS from "pptxgenjs";
import { defineMaster, exportSlideWithElements } from "./pptxLayouts";

// Shared PPTX export used by the Presentation View and the Outline Preview so
// both surfaces produce byte-identical PowerPoint files from the same design
// engine (defineMaster + exportSlideWithElements).
export async function exportDeckToPPTX({
  slides,
  title,
  theme,
  bodyFont,
  headingFont,
}) {
  const pres = new PptxGenJS();
  pres.layout = "LAYOUT_16x9";

  const cleanHex = (hex) => (hex || "").replace("#", "");
  const themeColors = {
    primary: cleanHex(theme?.primary),
    accent: cleanHex(theme?.accent),
    background: cleanHex(theme?.background),
    text: cleanHex(theme?.text),
    textMuted: cleanHex(theme?.textMuted),
  };

  defineMaster(pres, themeColors);

  for (let i = 0; i < slides.length; i++) {
    const slideData = slides[i];
    const slide = pres.addSlide({ masterName: "MODERN_MASTER" });
    await exportSlideWithElements(
      slide,
      slideData,
      themeColors,
      bodyFont,
      headingFont,
      { index: i, total: slides.length }
    );
  }

  await pres.writeFile({ fileName: `${title || "Presentation"}.pptx` });
}