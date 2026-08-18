import { useState, useMemo } from "react";
import { Rnd } from "react-rnd";
import SlideStage from "./SlideStage";
import {
  computeSlideLayout,
  extractSlideRoles,
  SLIDE_W,
  SLIDE_H,
} from "../utils/designedLayouts";

// Design-aware editing canvas. Renders the SAME designed slide as Present,
// Preview, thumbnails and PPTX export (computeSlideLayout -> SlideStage) and
// overlays edit affordances on the design blocks: click to select, drag to
// move, double-click to edit text in place. Moves/sizes are stored as
// design.overrides (inches/pt) that computeSlideLayout honors, so every
// surface reflects the same edits — one source of truth.

const PX_W = 1100; // canvas width px (10 in)
const PX_H = 618; // canvas height px (5.625 in)
const PX_PER_PT = PX_W / (SLIDE_W * 72); // 1.5278 px per design pt at this size

const inToPx = (v, axis) =>
  axis === "x" ? (v / SLIDE_W) * PX_W : (v / SLIDE_H) * PX_H;
const pxToIn = (v, axis) =>
  axis === "x" ? (v / PX_W) * SLIDE_W : (v / PX_H) * SLIDE_H;

// Same handwriting-font fallback as SlideStage, so the editor's editable text
// matches the rendered slide for cursive themes.
const CURSIVE_FONTS = new Set([
  "Comic Sans MS",
  "Segoe Script",
  "Segoe Print",
  "Brush Script MT",
  "Lucida Handwriting",
  "Kristen ITC",
  "Marker Felt",
  "Chalkboard SE",
  "Bradley Hand",
  "Snell Roundhand",
  "Papyrus",
  "Noteworthy",
]);

function ff(name) {
  const q = /\s/.test(name) ? `'${name}'` : name;
  return `${q}, ${CURSIVE_FONTS.has(name) ? "cursive" : "sans-serif"}`;
}

// Map every design block back to its canonical source role, so content edits
// and drags write to the same role fields the layout engine reads.
function buildEditMap(desc, roles) {
  const blocks = [];
  if (desc.texts?.[0]) {
    blocks.push({
      key: "heading",
      role: "heading",
      index: 0,
      box: desc.texts[0],
      kind: "text",
    });
  }
  if (desc.texts?.[1]) {
    blocks.push({
      key: "bullet-0",
      role: "bullet",
      index: 0,
      box: desc.texts[1],
      kind: "text",
    });
  }
  (desc.bullets || []).forEach((b, i) => {
    blocks.push({ key: `bullet-${i}`, role: "bullet", index: i, box: b, kind: "text" });
  });
  (desc.cards || []).forEach((c, i) => {
    blocks.push({
      key: `bullet-${i + 1}`,
      role: "bullet",
      index: i + 1,
      box: c,
      kind: "card",
    });
  });
  const mid = Math.ceil(roles.bullets.length / 2);
  (desc.columns || []).forEach((col, k) =>
    (col.bullets || []).forEach((b, i) => {
      const idx = k === 0 ? i : mid + i;
      blocks.push({
        key: `bullet-${idx}`,
        role: "bullet",
        index: idx,
        box: { x: col.x, y: b.y, w: col.w, h: 0.5, font: b.font },
        kind: "text",
      });
    })
  );
  return blocks;
}

export default function DesignCanvas({
  slide,
  theme,
  meta,
  headingFont,
  bodyFont,
  selected,
  onSelect,
  onUpdate,
  onMove,
  onSize,
  onRemoveImage,
}) {
  const desc = useMemo(
    () => computeSlideLayout(slide || {}, theme, meta),
    [slide, theme, meta]
  );
  const roles = useMemo(() => extractSlideRoles(slide || {}), [slide]);
  const blocks = useMemo(() => buildEditMap(desc, roles), [desc, roles]);
  const [editingKey, setEditingKey] = useState(null);

  const isSelected = (b) =>
    selected?.role === b.role && selected?.index === b.index;

  const cardParts = (index) => {
    const text = roles.bullets[index] || "";
    const parts = String(text).split("\n");
    return { title: parts[0] || "", body: parts.slice(1).join("\n") };
  };

  const commitEdit = (block, value) => {
    onUpdate(block.role, block.index, value);
    setEditingKey(null);
  };

  const renderEditable = (block) => {
    if (block.kind === "card") {
      const { title, body } = cardParts(block.index);
      return (
        <div
          className="w-full h-full flex flex-col"
          style={{ paddingLeft: block.box.tag ? inToPx(0.5, "x") : 0 }}
        >
          <div
            contentEditable
            suppressContentEditableWarning
            autoFocus
            className="outline-none select-text"
            style={{
              fontSize: (block.box.titleSize || 15) * PX_PER_PT,
              fontWeight: 700,
              fontFamily: ff(block.box.font || headingFont),
              color: block.box.titleColor || "#111827",
              lineHeight: 1.1,
            }}
            onBlur={(e) => commitEdit(block, `${e.target.innerText}${body ? `\n${body}` : ""}`)}
            onKeyDown={(e) => {
              if (e.key === "Enter") e.currentTarget.blur();
              if (e.key === "Escape") setEditingKey(null);
            }}
          >
            {title}
          </div>
          <div
            contentEditable
            suppressContentEditableWarning
            className="outline-none select-text"
            style={{
              fontSize: (block.box.bodySize || 11) * PX_PER_PT,
              fontFamily: ff(block.box.font || bodyFont),
              color: "#3A3A3A",
              whiteSpace: "pre-wrap",
              lineHeight: 1.2,
            }}
            onBlur={(e) => commitEdit(block, `${title}${e.target.innerText ? `\n${e.target.innerText}` : ""}`)}
          >
            {body}
          </div>
        </div>
      );
    }
    const text = block.role === "heading" ? roles.heading : roles.bullets[block.index] || "";
    return (
      <div
        contentEditable
        suppressContentEditableWarning
        autoFocus
        className="w-full h-full outline-none select-text"
        style={{
          fontSize: (block.box.size || 18) * PX_PER_PT,
          fontWeight: block.role === "heading" ? 700 : 400,
          fontFamily: ff(block.box.font || (block.role === "heading" ? headingFont : bodyFont)),
          color: block.box.color || theme.text,
          textAlign: block.box.align || "left",
          lineHeight: 1.15,
        }}
        onBlur={(e) => commitEdit(block, e.target.innerText)}
        onKeyDown={(e) => {
          if (e.key === "Enter") e.currentTarget.blur();
          if (e.key === "Escape") setEditingKey(null);
        }}
      >
        {text}
      </div>
    );
  };

  return (
    <div className="absolute inset-0" style={{ containerType: "inline-size" }}>
      {/* The designed slide — identical to Present/Preview/Export */}
      <SlideStage
        desc={desc}
        animating={false}
        accentFont={headingFont}
        bodyFont={bodyFont}
      />

      {/* Image remove affordance (panel / full-bleed) */}
      {desc.image?.src && (
        <button
          onClick={onRemoveImage}
          title="Remove image"
          className="absolute z-30 w-6 h-6 flex items-center justify-center rounded-full bg-black/55 hover:bg-red-500 text-white shadow-md cursor-pointer transition-colors"
          style={{
            left: `${((desc.image.x + desc.image.w - 0.3) / SLIDE_W) * 100}%`,
            top: `${(desc.image.y / SLIDE_H) * 100}%`,
          }}
        >
          <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round">
            <path d="M18 6L6 18M6 6l12 12" />
          </svg>
        </button>
      )}

      {/* Edit blocks: invisible until selected (SlideStage paints the design) */}
      {blocks.map((block) => {
        const selectedBlock = isSelected(block);
        const boxX = inToPx(block.box.x, "x");
        const boxY = inToPx(block.box.y, "y");
        return (
          <div
            key={block.key}
            className="absolute"
            style={{
              left: boxX,
              top: boxY,
              width: inToPx(block.box.w, "x"),
              height: inToPx(block.box.h, "y"),
              borderRadius: block.kind === "card" ? 8 : 0,
              border: selectedBlock
                ? "1.5px solid rgb(249 115 22 / 0.9)"
                : "1.5px solid transparent",
              boxShadow: selectedBlock
                ? "0 0 0 1px rgba(249,115,22,0.25)"
                : "none",
              background:
                selectedBlock && editingKey !== block.key
                  ? "rgba(249,115,22,0.06)"
                  : "transparent",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <Rnd
              size={{
                width: inToPx(block.box.w, "x"),
                height: inToPx(block.box.h, "y"),
              }}
              position={{ x: 0, y: 0 }}
              bounds="parent"
              enableResizing={false}
              disableDragging={editingKey === block.key}
              onMouseDown={() =>
                onSelect({
                  role: block.role,
                  index: block.index,
                  size: block.box.size,
                  font: block.box.font,
                })
              }
              onDoubleClick={(e) => {
                e.stopPropagation();
                setEditingKey(block.key);
              }}
              onDragStop={(e, d) =>
                onMove(block.role, block.index, {
                  x: pxToIn(boxX + d.x, "x"),
                  y: pxToIn(boxY + d.y, "y"),
                })
              }
            >
              {editingKey === block.key ? (
                renderEditable(block)
              ) : (
                <div className="w-full h-full" style={{ cursor: "move" }}>
                  {/* Corner handles when selected */}
                  {selectedBlock && (
                    <>
                      <span className="absolute -top-1 -left-1 w-2 h-2 bg-card border border-orange-500 rounded-full z-10 pointer-events-none" />
                      <span className="absolute -top-1 -right-1 w-2 h-2 bg-card border border-orange-500 rounded-full z-10 pointer-events-none" />
                      <span className="absolute -bottom-1 -left-1 w-2 h-2 bg-card border border-orange-500 rounded-full z-10 pointer-events-none" />
                      <span className="absolute -bottom-1 -right-1 w-2 h-2 bg-card border border-orange-500 rounded-full z-10 pointer-events-none" />
                    </>
                  )}
                </div>
              )}
            </Rnd>
          </div>
        );
      })}
    </div>
  );
}