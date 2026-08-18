import { motion } from "framer-motion";
import {
  PenLine,
  Palette,
  GripVertical,
  Undo2,
  Save,
  FileDown,
  Share2,
  Type,
  Play,
  Sparkles,
  ArrowRight,
  LayoutTemplate,
  Check,
} from "lucide-react";
import { themes } from "../utils/themes";
import { DECK_TEMPLATES } from "../utils/deckTemplates";

// Scroll-reveal wrapper used by every section below the hero. Each block
// fades/slides in once when it enters the viewport — no layout shift, once only.
function Reveal({ children, delay = 0, className }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 26 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.15 }}
      transition={{ duration: 0.55, delay, ease: [0.22, 1, 0.36, 1] }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

function SectionHeading({ kicker, title, sub }) {
  return (
    <Reveal className="flex flex-col items-center text-center gap-3 mb-12 md:mb-16">
      <span className="inline-flex items-center gap-2 bg-orange-500/20 border border-orange-500/30 text-orange-400 rounded-full py-1.5 px-4 text-[10px] font-bold uppercase tracking-wider shadow-2xs">
        <Sparkles className="w-3 h-3" />
        {kicker}
      </span>
      <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight text-slate-100 leading-[1.15] max-w-2xl">
        {title}
      </h2>
      {sub && (
        <p className="text-sm sm:text-base text-slate-400 font-medium leading-relaxed max-w-xl">
          {sub}
        </p>
      )}
    </Reveal>
  );
}

// 1. Feature grid — real capabilities with concrete details, no buzzwords.
const FEATURES = [
  {
    icon: PenLine,
    title: "Draft from a prompt",
    body: "Type a topic, get a structured deck in seconds. Slide count, text density, tone, audience and scenario are all tunable before you hit generate.",
    accent: "from-orange-500/20 to-transparent",
  },
  {
    icon: Palette,
    title: "12 curated themes",
    body: "Cornflower, Cosmos, Noir, Midnight, Terra and more — each with matched fonts, palettes and a mood the AI designs around, not just a colour swap.",
    accent: "from-purple-500/20 to-transparent",
  },
  {
    icon: GripVertical,
    title: "Drag to reorder",
    body: "Rearrange your slide thumbnails by dragging them around, or nudge cards up and down with the arrows. Order changes follow everywhere.",
    accent: "from-cyan-500/20 to-transparent",
  },
  {
    icon: Undo2,
    title: "Undo, autosave, save",
    body: "Ctrl+Z for mistakes, a debounced autosave that survives navigation, and one-click Save that stays in sync with your last edit.",
    accent: "from-emerald-500/20 to-transparent",
  },
  {
    icon: FileDown,
    title: "Export PPTX + PDF",
    body: "Download a real PowerPoint file built with pptxgenjs, or print straight to PDF with one 16:9 slide per page. No third-party service needed.",
    accent: "from-amber-500/20 to-transparent",
  },
  {
    icon: Share2,
    title: "Share with a link",
    body: "Flip a deck public and send a read-only link. Viewers present full-screen in their browser — no account required on their end.",
    accent: "from-rose-500/20 to-transparent",
  },
];

// 2. How it works — three concrete steps.
const STEPS = [
  {
    n: "01",
    icon: Type,
    title: "Describe it",
    body: "One line is enough — a full outline works even better. The AI drafts the deck structure for you.",
  },
  {
    n: "02",
    icon: Palette,
    title: "Pick a style",
    body: "Choose one of the 12 themes, or let the deck land on a look that fits the topic.",
  },
  {
    n: "03",
    icon: Play,
    title: "Present & share",
    body: "Edit, remix, export to PPTX or PDF, or hit present and go full-screen with arrow keys.",
  },
];

// 3. Real theme marquee — pulled straight from the theme catalog.
const THEME_CHIPS = [...themes, ...themes];

export default function LandingScrollSections({ onGetStarted }) {
  return (
    <div className="relative z-10 w-full bg-background">
      {/* Marquee keyframes + edge fades */}
      <style>{`
        @keyframes slideos-marquee {
          from { transform: translateX(0); }
          to   { transform: translateX(-50%); }
        }
        .slideos-marquee-track {
          display: flex;
          gap: 12px;
          width: max-content;
          animation: slideos-marquee 32s linear infinite;
        }
        .slideos-marquee-track:hover {
          animation-play-state: paused;
        }
      `}</style>

      <section className="w-full max-w-6xl mx-auto px-6 py-20 md:py-28">
        <SectionHeading
          kicker="Why SlideOS"
          title="Built for the last 10% of a deck"
          sub="The tools you reach for after the draft: reordering, undoing, exporting, sharing. Done properly."
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
          {FEATURES.map((f, i) => (
            <Reveal key={f.title} delay={(i % 3) * 0.08}>
              <div className="group relative h-full rounded-2xl border border-border bg-card/70 backdrop-blur-sm p-6 overflow-hidden hover:border-orange-500/40 hover:shadow-[0_20px_48px_-12px_rgba(234,88,12,0.15)] transition-all">
                <div className={`absolute -top-10 -right-10 w-32 h-32 rounded-full bg-gradient-to-br ${f.accent} blur-2xl pointer-events-none transition-opacity opacity-60 group-hover:opacity-100`} />
                <div className="relative">
                  <div className="w-11 h-11 rounded-xl bg-orange-500/15 border border-orange-500/25 text-orange-400 flex items-center justify-center mb-4 shadow-xs">
                    <f.icon className="w-5 h-5" />
                  </div>
                  <h3 className="text-base font-bold text-slate-100 mb-2">
                    {f.title}
                  </h3>
                  <p className="text-sm text-slate-400 font-medium leading-relaxed">
                    {f.body}
                  </p>
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section className="w-full border-t border-border/60 bg-card/30">
        <div className="w-full max-w-6xl mx-auto px-6 py-20 md:py-28">
          <SectionHeading
            kicker="Workflow"
            title="Three steps, zero friction"
            sub="No blank canvas, no template maze. Describe, style, go."
          />

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {STEPS.map((s, i) => (
              <Reveal key={s.n} delay={i * 0.1}>
                <div className="relative h-full rounded-2xl border border-border bg-background/70 p-6 flex flex-col gap-3">
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-br from-orange-400 to-orange-600/50">
                      {s.n}
                    </span>
                    <div className="w-9 h-9 rounded-xl bg-muted border border-border text-foreground flex items-center justify-center">
                      <s.icon className="w-4 h-4" />
                    </div>
                  </div>
                  <h3 className="text-lg font-bold text-slate-100">{s.title}</h3>
                  <p className="text-sm text-slate-400 font-medium leading-relaxed">
                    {s.body}
                  </p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* Real theme marquee */}
      <section className="w-full border-t border-border/60 py-16 md:py-20 overflow-hidden">
        <Reveal className="flex flex-col items-center text-center gap-3 mb-10 px-6">
          <span className="inline-flex items-center gap-2 bg-orange-500/20 border border-orange-500/30 text-orange-400 rounded-full py-1.5 px-4 text-[10px] font-bold uppercase tracking-wider">
            <Palette className="w-3 h-3" />
            The theme shelf
          </span>
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold tracking-tight text-slate-100">
            Twelve looks, all hand-tuned
          </h2>
          <p className="text-sm text-slate-400 font-medium max-w-md">
            Every theme ships with its own palette, heading and body fonts, and
            a design brief the AI follows.
          </p>
        </Reveal>

        <div className="relative">
          <div className="absolute inset-y-0 left-0 w-24 bg-gradient-to-r from-background to-transparent z-10 pointer-events-none" />
          <div className="absolute inset-y-0 right-0 w-24 bg-gradient-to-l from-background to-transparent z-10 pointer-events-none" />

          <div className="slideos-marquee-track">
            {THEME_CHIPS.map((t, i) => (
              <div
                key={`${t.id}-${i}`}
                className="flex items-center gap-3 rounded-2xl border border-border bg-card/70 backdrop-blur-sm px-5 py-3.5 min-w-[210px] select-none"
              >
                <div className="flex -space-x-1.5">
                  <span
                    className="w-4 h-4 rounded-full border border-black/20"
                    style={{ backgroundColor: t.colors.primary }}
                  />
                  <span
                    className="w-4 h-4 rounded-full border border-black/20"
                    style={{ backgroundColor: t.colors.accent }}
                  />
                </div>
                <div className="text-left min-w-0">
                  <div className="text-xs font-bold text-slate-100 truncate">
                    {t.name}
                  </div>
                  <div className="text-[9px] text-slate-500 font-medium truncate">
                    {t.fontFamily.heading} / {t.fontFamily.body}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Instant template strip */}
      <section className="w-full border-t border-border/60 bg-card/30">
        <div className="w-full max-w-6xl mx-auto px-6 py-20 md:py-24">
          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 mb-10">
            <Reveal className="flex flex-col items-start text-left gap-2">
              <span className="inline-flex items-center gap-2 bg-orange-500/20 border border-orange-500/30 text-orange-400 rounded-full py-1.5 px-4 text-[10px] font-bold uppercase tracking-wider w-fit">
                <LayoutTemplate className="w-3 h-3" />
                Instant templates
              </span>
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold tracking-tight text-slate-100">
                Start from a finished deck
              </h2>
              <p className="text-sm text-slate-400 font-medium max-w-md text-left">
                Seeded, ready-to-edit decks — no AI round-trip. Redesign any of
                them afterwards with one click.
              </p>
            </Reveal>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-5">
            {DECK_TEMPLATES.slice(0, 6).map((tpl, i) => {
              const tTheme = themes.find((t) => t.id === tpl.themeId);
              return (
                <Reveal key={tpl.id} delay={(i % 3) * 0.08}>
                  <div className="group h-full rounded-2xl border border-border bg-background/70 hover:border-orange-500/40 hover:shadow-[0_20px_48px_-12px_rgba(234,88,12,0.15)] transition-all p-5 flex flex-col gap-3">
                    <div className="flex items-center justify-between">
                      <span className="text-[9px] font-bold px-2 py-1 rounded-lg border border-border text-muted-foreground uppercase tracking-wider">
                        {tpl.category}
                      </span>
                      <span className="text-[9px] font-bold text-muted-foreground">
                        {tpl.slides.length} slides
                      </span>
                    </div>
                    <div className="aspect-video rounded-lg border border-border/70 overflow-hidden relative">
                      <div
                        className="absolute inset-0"
                        style={{
                          background: `linear-gradient(135deg, ${tTheme?.colors.primary || "#f97316"}, ${tTheme?.colors.accent || "#fb923c"})`,
                          opacity: 0.35,
                        }}
                      />
                      <div className="absolute inset-0 flex items-center justify-center">
                        <span className="text-[9px] font-bold uppercase tracking-widest px-2 py-1 rounded-md bg-black/30 text-white/80 backdrop-blur-sm">
                          {tpl.name}
                        </span>
                      </div>
                    </div>
                    <h3 className="text-sm font-bold text-slate-100 line-clamp-1">
                      {tpl.name}
                    </h3>
                    <p className="text-xs text-slate-400 font-medium leading-relaxed line-clamp-2">
                      {tpl.description}
                    </p>
                  </div>
                </Reveal>
              );
            })}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="w-full border-t border-border/60">
        <Reveal className="w-full max-w-6xl mx-auto px-6 py-20 md:py-28">
          <div className="relative rounded-3xl border border-orange-500/25 bg-gradient-to-br from-orange-500/10 via-transparent to-cyan-500/10 overflow-hidden p-10 md:p-16 text-center">
            <div className="absolute -top-20 -left-20 w-64 h-64 bg-orange-500/15 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute -bottom-24 -right-20 w-72 h-72 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />

            <div className="relative flex flex-col items-center gap-6">
              <div className="w-12 h-12 rounded-2xl bg-orange-500/20 border border-orange-500/30 text-orange-400 flex items-center justify-center shadow-xs">
                <Sparkles className="w-6 h-6" />
              </div>
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight text-slate-100 leading-[1.12] max-w-2xl">
                Your next deck is{' '}
                <span className="font-cursive text-orange-500 font-medium lowercase">
                  one sentence
                </span>{' '}
                away
              </h2>
              <p className="text-sm sm:text-base text-slate-400 font-medium leading-relaxed max-w-lg">
                No sign-up wall for building — just describe the topic and let
                SlideOS do the layout, theme and formatting.
              </p>
              <button
                onClick={onGetStarted}
                className="group inline-flex items-center gap-2 bg-orange-500 hover:bg-orange-600 text-white text-sm font-bold px-7 py-3.5 rounded-xl transition-all cursor-pointer shadow-[0_16px_40px_-12px_rgba(234,88,12,0.5)] border-t border-white/20 border-x border-white/10 active:scale-95"
              >
                <span>Start building free</span>
                <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5" />
              </button>

              <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-slate-500 text-[11px] font-bold uppercase tracking-wider">
                <span className="flex items-center gap-1.5">
                  <Check className="w-3.5 h-3.5 text-orange-500" />
                  Free to start
                </span>
                <span className="flex items-center gap-1.5">
                  <Check className="w-3.5 h-3.5 text-orange-500" />
                  PPTX + PDF export
                </span>
                <span className="flex items-center gap-1.5">
                  <Check className="w-3.5 h-3.5 text-orange-500" />
                  Share links
                </span>
              </div>
            </div>
          </div>
        </Reveal>
      </section>
    </div>
  );
}