import { SLIDE_W, SLIDE_H } from "../utils/designedLayouts";
import {
  TrendingUp,
  Users,
  GraduationCap,
  Rocket,
  ChartColumn,
  TriangleAlert,
  Lightbulb,
  Wallet,
  ShieldCheck,
  Target,
  Map,
  Sparkles,
} from "lucide-react";

// Decor icons by name (the names pickIconForRoles emits). Kept local so the
// shared renderer never depends on the layout engine's icon registry.
const ICON_REGISTRY = {
  TrendingUp,
  Users,
  GraduationCap,
  Rocket,
  ChartColumn,
  TriangleAlert,
  Lightbulb,
  Wallet,
  ShieldCheck,
  Target,
  Map,
  Sparkles,
};

// Shared designed slide renderer (block design).
// Renders the design description from computeSlideLayout on a 10 x 5.625 in
// slide: accent bar, serif headings, cards, image panels, big stat, footers.
// Web maps inch->percentage and pt->cqw so the stage scales 1:1 to the
// exported PowerPoint file. Text is top-aligned / modest box heights, so
// nothing double-renders or bleeds into the block below it (PowerPoint centers
// vertically by default).
//
// REQUIRES a parent container with `containerType: "inline-size"` and a 16:9
// aspect ratio (cqw units scale against the container width).
export function SlideStage({ desc, animating, accentFont, bodyFont }) {
  const pctX = (x) => (x / SLIDE_W) * 100;
  const pctY = (y) => (y / SLIDE_H) * 100;
  const pctW = (w) => (w / SLIDE_W) * 100;
  const pctH = (h) => (h / SLIDE_H) * 100;
  // 1pt = 1/7.2 % of the 720pt-wide slide -> cqw (relative to stage container)
  const pt = (size) => `${(size / 7.2).toFixed(3)}cqw`;
  const anim = (i = 0) => ({
    opacity: animating ? 0 : 1,
    transform: animating ? "translateY(8px)" : "translateY(0px)",
    transition: "opacity 420ms ease, transform 420ms ease",
    transitionDelay: `${i * 60}ms`,
  });

  return (
    <>
      {/* Slide background (color / gradient / transparent for full-bleed images) */}
      <div
        className="absolute inset-0"
        style={{ background: desc.background.css }}
      />

      {/* Decorative layer: soft blob + watermark numeral (behind content) */}
      {desc.decor?.shapes?.map((s, i) => (
        <div
          key={`decor-shape-${i}`}
          data-decor="blob"
          className="absolute pointer-events-none"
          style={{
            left: `${pctX(s.x)}%`,
            top: `${pctY(s.y)}%`,
            width: `${pctW(s.w)}%`,
            height: `${pctH(s.h)}%`,
            borderRadius: "50%",
            background: s.fill,
            opacity: s.opacity,
          }}
        />
      ))}
      {desc.decor?.watermark && (
        <div
          data-decor="watermark"
          className="absolute pointer-events-none select-none"
          style={{
            left: `${pctX(desc.decor.watermark.x)}%`,
            top: `${pctY(desc.decor.watermark.y)}%`,
            width: `${pctW(desc.decor.watermark.w)}%`,
            height: `${pctH(desc.decor.watermark.h)}%`,
            fontSize: pt(desc.decor.watermark.size),
            fontWeight: 700,
            color: desc.decor.watermark.color,
            opacity: desc.decor.watermark.opacity,
            fontFamily: `${accentFont}, sans-serif`,
            lineHeight: 1,
            textAlign: "right",
            letterSpacing: "0.02em",
          }}
        >
          {desc.decor.watermark.text}
        </div>
      )}

      {/* Accent divider under the heading */}
      {desc.decor?.divider && (
        <div
          data-decor="divider"
          className="absolute z-10 pointer-events-none"
          style={{
            left: `${pctX(desc.decor.divider.x)}%`,
            top: `${pctY(desc.decor.divider.y)}%`,
            width: `${pctW(desc.decor.divider.w)}%`,
            height: `${pctH(desc.decor.divider.h)}%`,
            background: desc.decor.divider.color,
          }}
        />
      )}

      {/* Heading icon chip (top-right, layered over the blob) */}
      {desc.decor?.icon &&
        (() => {
          const chip = desc.decor.icon.chip;
          const IconComp = ICON_REGISTRY[desc.decor.icon.name];
          const inset = 0.11;
          const iconW = chip.w - inset * 2;
          const iconH = chip.h - inset * 2;
          return (
            <>
              <div
                className="absolute z-10 pointer-events-none rounded-lg"
                style={{
                  left: `${pctX(chip.x)}%`,
                  top: `${pctY(chip.y)}%`,
                  width: `${pctW(chip.w)}%`,
                  height: `${pctH(chip.h)}%`,
                  background: chip.fill,
                  border: `1px solid ${chip.border}`,
                }}
              />
              {IconComp && (
                <div
                  className="absolute z-10 flex items-center justify-center pointer-events-none"
                  style={{
                    left: `${pctX(chip.x + inset)}%`,
                    top: `${pctY(chip.y + inset)}%`,
                    width: `${pctW(iconW)}%`,
                    height: `${pctH(iconH)}%`,
                    color: desc.decor.icon.color,
                  }}
                >
                  <IconComp style={{ width: "100%", height: "100%" }} strokeWidth={2} />
                </div>
              )}
            </>
          );
        })()}

      {/* Accent bar (matches PPTX master) */}
      <div
        className="absolute top-0 left-0 right-0 z-10 pointer-events-none"
        style={{ height: `${pctH(0.14)}%`, background: desc.accentBar }}
      />

      {/* Full-bleed background image + dark overlay (section dividers) */}
      {desc.image?.mode === "fullbleed" && (
        <img
          src={desc.image.src}
          alt=""
          className="absolute inset-0 w-full h-full object-cover pointer-events-none"
        />
      )}
      {desc.overlay && (
        <div
          className="absolute"
          style={{
            left: `${pctX(desc.overlay.x)}%`,
            top: `${pctY(desc.overlay.y)}%`,
            width: `${pctW(desc.overlay.w)}%`,
            height: `${pctH(desc.overlay.h)}%`,
            background: desc.overlay.css,
          }}
        />
      )}

      {/* Right image panel (cover) */}
      {desc.image?.mode === "panel" && (
        <img
          src={desc.image.src}
          alt=""
          className="absolute object-cover pointer-events-none"
          style={{
            left: `${pctX(desc.image.x)}%`,
            top: `${pctY(desc.image.y)}%`,
            width: `${pctW(desc.image.w)}%`,
            height: `${pctH(desc.image.h)}%`,
          }}
        />
      )}

      {/* Text blocks (top-aligned, modest heights) */}
      {desc.texts?.map((t, i) => (
        <div
          key={`t-${i}`}
          className="absolute select-text"
          style={{
            left: `${pctX(t.x)}%`,
            top: `${pctY(t.y)}%`,
            width: `${pctW(t.w)}%`,
            height: `${pctH(t.h)}%`,
            fontSize: pt(t.size),
            fontWeight: t.bold ? 700 : 400,
            color: t.color,
            fontFamily: `${t.font || bodyFont}, sans-serif`,
            textAlign: t.align || "left",
            lineHeight: 1.15,
            overflow: "hidden",
            overflowWrap: "break-word",
            ...anim(i),
          }}
        >
          {t.text}
        </div>
      ))}

      {/* Cards */}
      {desc.cards?.map((c, i) => (
        <div
          key={`c-${i}`}
          className="absolute rounded-lg border overflow-hidden"
          style={{
            left: `${pctX(c.x)}%`,
            top: `${pctY(c.y)}%`,
            width: `${pctW(c.w)}%`,
            height: `${pctH(c.h)}%`,
            background: "#F8F9FA",
            borderColor: "#E8E8F0",
            paddingTop: `${pctH(0.12)}%`,
            paddingBottom: `${pctH(0.12)}%`,
            paddingRight: `${pctW(0.18)}%`,
            paddingLeft: `${pctW(c.tag ? 0.62 : 0.18)}%`,
            ...anim(i),
          }}
        >
          {/* Corner number badge (agenda sections) */}
          {c.tag && (
            <div
              data-decor="card-tag"
              className="absolute flex items-center justify-center rounded-md pointer-events-none"
              style={{
                left: `${pctW(0.14)}%`,
                top: `${pctH(0.14)}%`,
                width: `${pctW(0.38)}%`,
                height: `${pctH(0.38)}%`,
                background: c.tagFill || "#111827",
                color: "#ffffff",
                fontSize: pt(c.tagSize || 11),
                fontWeight: 700,
                lineHeight: 1,
              }}
            >
              {c.tag}
            </div>
          )}
          <div
            style={{
              fontSize: pt(c.titleSize || 15),
              fontWeight: 700,
              fontFamily: `${accentFont}, sans-serif`,
              color: c.titleColor || "#111827",
              lineHeight: 1.1,
            }}
          >
            {c.title}
          </div>
          {c.body && (
            <div
              style={{
                fontSize: pt(c.bodySize || 11),
                fontFamily: `${bodyFont}, sans-serif`,
                color: "#3A3A3A",
                marginTop: `${pctH(0.05)}%`,
                whiteSpace: "pre-wrap",
                overflowWrap: "break-word",
                lineHeight: 1.2,
              }}
            >
              {c.body}
            </div>
          )}
        </div>
      ))}

      {/* Timeline: vertical line + milestone dots behind the cards */}
      {desc.timeline && (
        <>
          <div
            data-decor="timeline-line"
            className="absolute pointer-events-none rounded-full"
            style={{
              left: `${pctX(desc.timeline.x - 0.015)}%`,
              top: `${pctY(desc.timeline.yTop)}%`,
              width: `${pctW(0.03)}%`,
              height: `${pctY(desc.timeline.yBottom - desc.timeline.yTop)}%`,
              background: desc.timeline.color,
              opacity: 0.35,
            }}
          />
          {(desc.timeline.dots || []).map((dy, i) => (
            <div
              key={`tl-dot-${i}`}
              data-decor="timeline-dot"
              className="absolute rounded-full pointer-events-none"
              style={{
                left: `${pctX(desc.timeline.x - 0.045)}%`,
                top: `${pctY(dy - 0.045)}%`,
                width: `${pctW(0.09)}%`,
                height: `${pctH(0.09)}%`,
                background: desc.timeline.dotColor,
                border: "2px solid #ffffff",
                boxShadow: "0 1px 3px rgba(0,0,0,0.25)",
              }}
            />
          ))}
        </>
      )}

      {/* Bullet lists (content-only) */}
      {desc.bullets?.map((b, i) => (
        <div
          key={`b-${i}`}
          className="absolute"
          style={{
            left: `${pctX(b.x)}%`,
            top: `${pctY(b.y)}%`,
            width: `${pctW(b.w)}%`,
            height: `${pctH(b.h)}%`,
            fontSize: pt(b.size),
            fontFamily: `${b.font || bodyFont}, sans-serif`,
            color: b.color,
            lineHeight: 1.2,
            overflow: "hidden",
            overflowWrap: "break-word",
            ...anim(i),
          }}
        >
          <span className="mr-2">•</span>
          {b.text}
        </div>
      ))}

      {/* Two-column bullet lists */}
      {desc.columns?.map((col, ci) => (
        <>
          {col.title && (
            <div
              className="absolute"
              style={{
                left: `${pctX(col.x)}%`,
                top: `${pctY(col.y - 0.5)}%`,
                width: `${pctW(col.w)}%`,
                height: `${pctH(0.4)}%`,
                fontSize: pt(col.titleSize || 18),
                fontWeight: 700,
                fontFamily: `${accentFont}, sans-serif`,
                color: col.titleColor || "#111827",
                lineHeight: 1.1,
              }}
            >
              {col.title}
            </div>
          )}
          {(col.bullets || []).map((item, i) => (
          <div
            key={`col-${ci}-${i}`}
            className="absolute"
            style={{
              left: `${pctX(col.x)}%`,
              top: `${pctY(col.y + i * 0.62)}%`,
              width: `${pctW(col.w)}%`,
              height: `${pctH(0.5)}%`,
              fontSize: pt(item.size || 17),
              fontFamily: `${item.font || bodyFont}, sans-serif`,
              color: item.color,
              lineHeight: 1.2,
              overflow: "hidden",
              overflowWrap: "break-word",
              ...anim(i),
            }}
          >
            <span className="mr-2">•</span>
            {item.text}
          </div>
          ))}
        </>
      ))}

      {/* Footer (matches PPTX master) */}
      {desc.footer && (
        <div
          className="absolute left-0 right-0 bottom-0 flex items-center justify-between px-[3%] pb-[0.6%] z-10"
          style={{ fontSize: pt(10), fontFamily: "Georgia, serif", color: "#94A3B8" }}
        >
          <span>{desc.footer.brand}</span>
          <span>Slide {desc.footer.page}</span>
        </div>
      )}
    </>
  );
}

export default SlideStage;
