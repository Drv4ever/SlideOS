import { Navbar } from "@/components/ui/navbar";
import { PromptBox } from "@/components/ui/PromptBox";
import { Controls } from "@/components/ui/controlRow";
import { TextContentConfig } from "@/components/ui/textcontentConfig";
import { CustomizeTheme } from "@/components/ui/customtheme";
import { useState, useEffect } from "react";



export default function Home() {
  // a hook to store the output result 
  const [result,setResult] = useState(null);

  // fake api call for now
  const generatePresentation = async (data) => {
    console.log("Sending to backend:", data);
    await new Promise((res) => setTimeout(res, 3000));
    return {
      slides:[{
        slideNumber: 1,
        heading: "Introduction",
        content: ["Point 1", "Point 2"],
      },
      {
        slideNumber: 2,
        heading: "Main Concept",
        content: ["Point A", "Point B"],
      }
    ]
    }
  };

  const handleGenerate = async () => {
    if (load) return;
    if (!form.prompt.trim()) {
      alert("Please enter a prompt");
      return;
    }
    setLoad(true);
    try {
      const res = await generatePresentation(form);
      setResult(res)
    } finally {
      setLoad(false);
    }
  };

  const [form, setForm] = useState({
    prompt: "",
    slides: 8,
    contentLevel: "concise",
    theme: "daktilo",
  });

  const [load, setLoad] = useState(false);
  return (
    <>
      <div className="min-h-screen bg-background">
        <Navbar />
        {/* Added extra top padding to push text further from navbar */}
        <div className="px-40 md:mt-40" style={{ paddingTop: "40px" }}>
          <h1 className="text-4xl md:text-[7rem] font-bold text-center mt-20 md:mt-48 leading-tight px-6 font-sans">
            Generate PowerPoint Presentation
            <br />
            in a Second
          </h1>

          <div className="mx-auto w-full max-w-[600px] text-center text-sm text-muted-foreground mt-4">
            Transform your ideas into professional presentations instantly.
          </div>

          <main className="flex justify-center mt-12 px-6 pb-32">
            <div className="w-full max-w-[750px]">
              {/* Prompt Box */}
              <div style={{ marginBottom: "40px" }}>
                <PromptBox
                  value={form.prompt}
                  onChange={(e) => setForm({ ...form, prompt: e.target.value })}
                />
              </div>

              {/* Controls */}
              <div style={{ marginBottom: "40px" }}>
                <Controls
                  slides={form.slides}
                  onSlideChange={(value) => setForm({ ...form, slides: value })}
                />
              </div>

              {/* Text Content Config */}
              <div className="w-full" style={{ marginBottom: "30px" }}>
                <TextContentConfig
                  contentLevel={form.contentLevel}
                  value={form.contentLevel}
                  onChange={(v) => {
                    setForm({ ...form, contentLevel: v });
                  }}
                />
              </div>

              <div className="w-full">
                <CustomizeTheme
                  value={form.theme}
                  onChange={(theme) => setForm({ ...form, theme: theme })}
                />
              </div>
            </div>
          </main>
        </div>
      </div>

      {/* Fixed button bar */}
      <div
        style={{
        
          bottom: 0,
          left: 0,
          right: 0,
          padding: "6px 16px",
          zIndex: 90,
          borderTop: "1px solid hsl(var(--border) / 0.4)",
        }}
      >
        <div style={{ display: "flex", justifyContent: "center" }}>
          <button
            onClick={handleGenerate}
            disabled={load}
            className={`inline-flex items-center justify-center gap-3 font-semibold rounded-lg bg-primary text-primary-foreground shadow-md shadow-primary/20 transition-all duration-200  focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 border-none ${load ? "opacity-70 cursor-not-allowed" : "hover:bg-primary/90 hover:shadow-lg hover:shadow-primary/30 active:scale-95"}`}
            style={{
              padding: "4px 12px",
              height: "37px",
              fontSize: "10px",
              width: "180px",
            }}
          >
            {load ? (
              <>
                <svg
                  className="h-3 w-3 animate-spin"
                  style={{ height: "14px", width: "14px" }}
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  {" "}
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  />{" "}
                  <path 
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
                  />
                </svg>{" "}
                <span> Generating...</span>
                {""}
              </>
            ) : (
              <>
                {" "}
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  style={{ height: "14  px", width: "14px" }}
                  className="h-3 w-3 "
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="m21.64 3.64-1.28-1.28a1.21 1.21 0 0 0-1.72 0L2.36 18.64a1.21 1.21 0 0 0 0 1.72l1.28 1.28a1.2 1.2 0 0 0 1.72 0L21.64 5.36a1.2 1.2 0 0 0 0-1.72" />
                  <path d="m14 7 3 3" />
                  <path d="M5 6v4" />
                  <path d="M19 14v4" />
                  <path d="M10 2v2" />
                  <path d="M7 8H3" />
                  <path d="M21 16h-4" />
                  <path d="M11 3H9" />
                </svg>
                <span>Generate Presentation</span>
              </>
            )}
          </button>
        </div>
      </div>
      

      {/* to check the output  basically fake ppt generation  */}
      {result && (
  <div className="max-w-3xl mx-auto mt-10 space-y-6">
    {result.slides.map((slide) => (
      <div
        key={slide.slideNumber}
        className="border rounded-lg p-4"
      >
        <h3 className="font-semibold mb-2">
          Slide {slide.slideNumber}: {slide.heading}
        </h3>

        <ul className="list-disc pl-5 text-sm text-muted-foreground">
          {slide.content.map((point, i) => (
            <li key={i}>{point}</li>
          ))}
        </ul>
      </div>
    ))}
  </div>
)}


    </>
  );
}
