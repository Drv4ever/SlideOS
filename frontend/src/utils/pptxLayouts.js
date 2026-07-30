// Canvas dimensions: 1100 x 618 (16:9)
// PPTX dimensions: 10 x 7.5 inches (pptxgenjs default)
// All coordinates in inches for PPTX output

export const PPT_STYLE = "MODERN";

const SLIDE_W = 10;
const SLIDE_H = 7.5;
const MARGIN_LEFT = 0.5;
const MARGIN_TOP = 0.4;

export function extractSlideContent(slideData) {
  const texts = (slideData.elements || []).filter((e) => e.type === "text");
  const images = (slideData.elements || []).filter(
    (e) => e.type === "image" && e.zIndex !== 0
  );
  const bgImages = (slideData.elements || []).filter(
    (e) => e.type === "image" && e.zIndex === 0
  );

  return {
    heading:
      texts.find((e) => e.bold)?.content ||
      texts[0]?.content ||
      slideData.heading ||
      "Untitled",
    bullets: texts
      .filter((e) => !e.bold)
      .map((e) => e.content)
      .filter(Boolean),
    images,
    bgImages,
    layoutPattern: slideData.layoutPattern || slideData.layout || "content-only",
    background: slideData.background || null,
  };
}

export function defineMaster(pres, themeColors) {
  pres.defineSlideMaster({
    title: "MODERN_MASTER",
    background: { color: themeColors.background || "F5F5F7" },
    objects: [
      {
        rect: {
          x: 0,
          y: 0,
          w: "100%",
          h: 0.12,
          fill: { color: themeColors.primary || "6366F1" },
        },
      },
      {
        text: {
          text: "SlideOS",
          options: {
            x: 0.3,
            y: 7.15,
            w: 9,
            h: 0.3,
            fontSize: 10,
            color: "94A3B8",
            fontFace: "Georgia",
          },
        },
      },
      {
        text: {
          text: "Slide {SLIDE_NUMBER} of {NUM_SLIDES}",
          options: {
            x: 8.8,
            y: 7.15,
            w: 1,
            h: 0.3,
            fontSize: 10,
            color: "94A3B8",
            fontFace: "Georgia",
            align: "right",
          },
        },
      },
    ],
  });
}

function addCard(slide, { x, y, w, h, title, body }) {
  slide.addShape("roundRect", {
    x,
    y,
    w,
    h,
    fill: { color: "E8E8F0" },
    line: { color: "FFFFFF00" },
    rectRadius: 0.08,
  });
  slide.addText(title, {
    x: x + 0.2,
    y: y + 0.15,
    w: w - 0.4,
    h: 0.4,
    fontFace: "Georgia",
    fontSize: 16,
    bold: true,
    color: "1A1A1A",
  });
  slide.addText(body, {
    x: x + 0.2,
    y: y + 0.55,
    w: w - 0.4,
    h: h - 0.7,
    fontSize: 12,
    color: "3A3A3A",
  });
}

function addFullBleedImage(slide, imageUrl, side = "right") {
  const x = side === "right" ? 6.0 : 0;
  const w = side === "right" ? 4.0 : 6.0;
  if (imageUrl.startsWith("data:")) {
    slide.addImage({
      data: imageUrl,
      x,
      y: 0,
      w,
      h: SLIDE_H,
    });
  } else {
    slide.addImage({
      path: imageUrl,
      x,
      y: 0,
      w,
      h: SLIDE_H,
    });
  }
}

export function titleSlideLayout(slide, theme, title, slideData) {
  const content = extractSlideContent(slideData);

  if (content.bgImages.length > 0 && content.bgImages[0].src) {
    addFullBleedImage(slide, content.bgImages[0].src, "right");
  } else if (content.background?.type === "image" && content.background.value) {
    addFullBleedImage(slide, content.background.value, "right");
  }

  slide.addText(title || content.heading || "Untitled", {
    x: MARGIN_LEFT,
    y: 2.5,
    w: 5.3,
    h: 2,
    fontFace: "Georgia",
    fontSize: 44,
    bold: true,
    color: theme.text || "1A1A1A",
    align: "left",
  });

  if (content.bullets.length > 0) {
    slide.addText(content.bullets[0], {
      x: MARGIN_LEFT,
      y: 4.8,
      w: 5.3,
      h: 1,
      fontSize: 18,
      color: "3A3A3A",
    });
  }
}

export function sectionDividerLayout(slide, theme, slideData) {
  const content = extractSlideContent(slideData);

  if (content.bgImages.length > 0 && content.bgImages[0].src) {
    addFullBleedImage(slide, content.bgImages[0].src, "right");
  } else if (content.background?.type === "image" && content.background.value) {
    addFullBleedImage(slide, content.background.value, "right");
  }

  slide.addText(content.heading, {
    x: MARGIN_LEFT,
    y: 2.5,
    w: 5.3,
    h: 2,
    fontFace: "Georgia",
    fontSize: 52,
    bold: true,
    color: theme.text || "1A1A1A",
    align: "left",
  });

  if (content.bullets.length > 0) {
    slide.addText(content.bullets[0], {
      x: MARGIN_LEFT,
      y: 4.8,
      w: 5.3,
      h: 1,
      fontSize: 20,
      color: "3A3A3A",
    });
  }
}

export function bigStatLayout(slide, theme, slideData) {
  const content = extractSlideContent(slideData);

  if (content.bgImages.length > 0 && content.bgImages[0].src) {
    addFullBleedImage(slide, content.bgImages[0].src, "right");
  }

  slide.addText(content.heading, {
    x: MARGIN_LEFT,
    y: 1.5,
    w: 5.3,
    h: 2,
    fontFace: "Georgia",
    fontSize: 64,
    bold: true,
    color: theme.primary || "6366F1",
    align: "left",
  });

  if (content.bullets.length > 0) {
    slide.addText(content.bullets[0], {
      x: MARGIN_LEFT,
      y: 3.8,
      w: 5.3,
      h: 1,
      fontSize: 22,
      color: "3A3A3A",
      align: "left",
    });
  }
}

export function twoColumnLayout(slide, theme, slideData) {
  const content = extractSlideContent(slideData);

  slide.addText(content.heading, {
    x: MARGIN_LEFT,
    y: MARGIN_TOP,
    w: 5.3,
    h: 0.8,
    fontFace: "Georgia",
    fontSize: 32,
    bold: true,
    color: theme.text || "1A1A1A",
  });

  const midPoint = Math.ceil(content.bullets.length / 2);
  const leftBullets = content.bullets.slice(0, midPoint);
  const rightBullets = content.bullets.slice(midPoint);

  let leftY = 1.4;
  leftBullets.forEach((point) => {
    slide.addText(point, {
      x: MARGIN_LEFT,
      y: leftY,
      w: 4.0,
      h: 0.5,
      fontSize: 18,
      color: "3A3A3A",
    });
    leftY += 0.55;
  });

  let rightY = 1.4;
  rightBullets.forEach((point) => {
    slide.addText(point, {
      x: 5.5,
      y: rightY,
      w: 4.0,
      h: 0.5,
      fontSize: 18,
      color: "3A3A3A",
    });
    rightY += 0.55;
  });

  if (content.images.length > 0 && content.images[0].src) {
    addFullBleedImage(slide, content.images[0].src, "right");
  }
}

export function contentOnlyLayout(slide, theme, slideData) {
  const content = extractSlideContent(slideData);

  slide.addText(content.heading, {
    x: MARGIN_LEFT,
    y: MARGIN_TOP,
    w: 5.3,
    h: 0.8,
    fontFace: "Georgia",
    fontSize: 32,
    bold: true,
    color: theme.text || "1A1A1A",
  });

  let yPos = 1.4;
  content.bullets.forEach((point) => {
    slide.addText("\u2022 " + point, {
      x: MARGIN_LEFT,
      y: yPos,
      w: 8.5,
      h: 0.5,
      fontSize: 18,
      color: "3A3A3A",
    });
    yPos += 0.5;
  });

  if (content.images.length > 0 && content.images[0].src) {
    addFullBleedImage(slide, content.images[0].src, "right");
  }
}

export function modernLayout(slide, theme, slideData) {
  const content = extractSlideContent(slideData);

  slide.addText(content.heading, {
    x: MARGIN_LEFT,
    y: MARGIN_TOP,
    w: 5.3,
    h: 0.9,
    fontFace: "Georgia",
    fontSize: 30,
    bold: true,
    color: "1A1A1A",
  });

  if (content.bullets.length > 0) {
    slide.addText(content.bullets[0], {
      x: MARGIN_LEFT,
      y: 1.3,
      w: 5.3,
      h: 1.3,
      fontSize: 13,
      color: "3A3A3A",
    });
  }

  let yPos = 2.7;
  content.bullets.slice(1).forEach((bullet, i) => {
    const cardTitle = bullet.split("\n")[0] || bullet.slice(0, 30) + "...";
    const cardBody = bullet.split("\n").slice(1).join("\n") || bullet.slice(0, 80);

    addCard(slide, {
      x: MARGIN_LEFT + (i % 2) * 2.8,
      y: yPos + Math.floor(i / 2) * 1.9,
      w: 2.6,
      h: 1.7,
      title: cardTitle,
      body: cardBody,
    });
  });

  if (content.images.length > 0 && content.images[0].src) {
    addFullBleedImage(slide, content.images[0].src, "right");
  }
}
