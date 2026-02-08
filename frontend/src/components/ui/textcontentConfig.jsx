import { List } from "lucide-react";

/* =========================
   MAIN COMPONENT
   ========================= */
export function TextContentConfig() {
  return (
    <div className="border p-6 shadow-sm rounded-xl bg-background">
      <div className="mb-3 flex items-center gap-2">
        <List className="h-4 w-4 text-foreground" />
        <h2 className="text-lg font-semibold text-foreground">
          Text Content
        </h2>
      </div>

      <p className="mb-4 text-sm text-muted-foreground">
        Amount of text per card
      </p>

      <div className="grid grid-cols-4 gap-3 mb-6">
        <OptionCard title="Minimal" active={false} lines={2} />
        <OptionCard title="Concise" active={false} lines={3} />
        <OptionCard title="Detailed" active={false} lines={4} />
        <OptionCard title="Extensive" active={false} lines={5} />
      </div>

      <div className="grid grid-cols-3 gap-4">
        <SelectBox label="Tone" />
        <SelectBox label="Audience" />
        <SelectBox label="Scenario" />
      </div>
    </div>
  );
}

/* =========================
   HELPER COMPONENTS
   ========================= */

function OptionCard({ title, active, lines }) {
  return (
    <button
      className={`flex flex-col items-center justify-center gap-3 rounded-lg border-2 p-4 transition-all aspect-square
        ${
          active
            ? "border-primary bg-primary/10"
            : "border-border bg-background hover:border-muted-foreground"
        }
      `}
    >
      <div className="flex flex-col items-center justify-center w-3/4" style={{ gap: '8px' }}>
        {Array.from({ length: lines }).map((_, i) => (
          <div
            key={i}
            className="rounded-full bg-primary"
            style={{ 
              height: '4px',
              width: i === 0 ? "60%" : i === lines - 1 ? "75%" : "100%",
              opacity: active ? 1 : 0.4
            }}
          />
        ))}
      </div>

      <span className={`text-xs font-medium ${active ? "text-primary" : "text-foreground"}`}>
        {title}
      </span>
    </button>
  );
}

function SelectBox({ label }) {
  return (
    <div>
      <label className="mb-1 block text-xs font-medium text-foreground">
        {label}
      </label>

      <button
        type="button"
        className="flex h-[24px] w-full items-center justify-between rounded-lg border border-border bg-background px-1.5 py-0.5 text-xs border-primary/20
                   ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
        style={{ minHeight: '20px', fontSize: '11px', paddingTop: '2px', paddingBottom: '2px', paddingLeft: '6px', paddingRight: '6px' }}
      >
        <span className="text-foreground text-[11px]">Auto</span>
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-[12px] w-[12px] text-muted-foreground"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth="2"
          style={{ minWidth: 10, minHeight: 10 }}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="m6 9 6 6 6-6"
          />
        </svg>
      </button>
    </div>
  );
}