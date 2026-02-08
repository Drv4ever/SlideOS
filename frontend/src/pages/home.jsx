import { Navbar } from "@/components/ui/navbar";
import { PromptBox } from "@/components/ui/PromptBox";
import { Controls } from "@/components/ui/controlRow";
import { TextContentConfig } from "@/components/ui/textcontentConfig";
import { CustomizeTheme } from "@/components/ui/customtheme";
import { useState,useEffect } from "react";
export default function Home() {

// fake api call
  const generatePresentation = async (data) => {
    console.log("Sending to backend:", data);
  
    await new Promise((res) => setTimeout(res, 1000));
  
    alert("Presentation generated (fake)");
  };
  

  const handleGenerate = async () => {
    if (!form.prompt.trim()){
      alert("Please enter a prompt");
      return;
    }
    await console.log(generatePresentation(form));
  };

  const [form,setForm] = useState({
    prompt: "",
    slides: 8,
    contentLevel: "concise",
    theme : "daktilo"
  });

  // useEffect(() => {
  //   console.log(form);
  // }, [form]);
  

  return (
    <>
      <div className="min-h-screen bg-background">
        <Navbar />
        {/* Added extra top padding to push text further from navbar */}
        <div className="px-40 md:mt-40" style={{ paddingTop: "40px" }}>
          <h1 className="text-4xl md:text-[7rem] font-bold text-center mt-20 md:mt-48 leading-tight px-6 font-serif">
            Generate PowerPoint Presentation
            <br />
            in a Second
          </h1>

          <div className="mx-auto w-full max-w-[600px] text-center text-sm text-muted-foreground mt-4">
            Transform your ideas into professional presentations instantly.
          </div>

          <main className="flex justify-center mt-12 px-6 pb-32">
            <div className="w-full max-w-[700px]">

              {/* Prompt Box */}
              <div style={{ marginBottom: '40px' }}>
                <PromptBox 
                value = {form.prompt}
                onChange={(e)=>
                  setForm({...form,prompt:e.target.value})
                }

                />
              </div>

              {/* Controls */}
              <div style={{ marginBottom: '40px' }}>
                <Controls  
                slides = {form.slides}
                onSlideChange={(value) =>
                  setForm({...form,slides:value})
                }
                />
              </div>

              {/* Text Content Config */}
              <div className="w-full" style={{ marginBottom: '30px' }}>
                <TextContentConfig 
                contentLevel = {form.contentLevel}
                value={form.contentLevel}
                onChange = {(v)=>
                  {setForm({...form,contentLevel:v})}
              }/>
              </div>

              <div className="w-full">
                <CustomizeTheme 
                value = {form.theme}
                onChange={(theme)=>
                  setForm({...form,theme:theme})
                }
                />
              </div>
            </div>
          </main>
        </div>
      </div>

      {/* Fixed button bar */}
      <div
        style={{
          position: 'fixed',
          bottom: 0,
          left: 0,
          right: 0,
          backgroundColor: 'hsl(var(--background) / 0.95)',
          backdropFilter: 'blur(3px)',
          WebkitBackdropFilter: 'blur(3px)',
          padding: '6px 16px',
          zIndex: 90,
          borderTop: '1px solid hsl(var(--border) / 0.4)'
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'center' }}>
          <button  onClick={handleGenerate}
            className="inline-flex items-center justify-center gap-2 font-semibold rounded-lg
         bg-primary text-primary-foreground
         shadow-md shadow-primary/20
         transition-all duration-200
         hover:bg-primary/90 hover:shadow-lg hover:shadow-primary/30
         active:scale-95
         focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 border-none"
            style={{
              padding: "4px 12px",
              height: "37px",
              fontSize: "10px",
              width: "180px"
              
            }}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              style={{ height: "14  px", width: "14px" }}
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

            Generate Presentation
          </button>

        </div>
      </div>
    </>
  );
}