import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Check } from "lucide-react";

export function CustomizeTheme({ value, onChange }) {
  const themes = [
    {
      name: "Daktilo",
      fonts: "Inter / Inter",
      bgColor: "bg-blue-500",
      cardBg: "bg-white",
      titleColor: "text-blue-600",
    },
    {
      name: "Noir",
      fonts: "Inter / Inter",
      bgColor: "bg-blue-400",
      cardBg: "bg-slate-900",
      titleColor: "text-blue-400",
    },
    {
      name: "Cornflower",
      fonts: "Poppins / Source Sans Pro",
      bgColor: "bg-purple-600",
      cardBg: "bg-white",
      titleColor: "text-purple-600",
    },
    {
      name: "Indigo",
      fonts: "Poppins / Source Sans Pro",
      bgColor: "bg-blue-400",
      cardBg: "bg-slate-800",
      titleColor: "text-blue-300",
    },
    {
      name: "Orbit",
      fonts: "Space Grotesk / IBM Plex Sans",
      bgColor: "bg-indigo-700",
      cardBg: "bg-white",
      titleColor: "text-indigo-700",
    },
    {
      name: "Cosmos",
      fonts: "Space Grotesk / IBM Plex Sans",
      bgColor: "bg-blue-400",
      cardBg: "bg-slate-900",
      titleColor: "text-blue-300",
    },
  ];

  return (
    <Card className="w-full bg-card border-border">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-semibold">
            Customize Theme
          </CardTitle>

          <Button
            variant="ghost"
            className="text-xs font-semibold text-primary"
          >
            More Themes
          </Button>
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* SECTION TITLE */}
        <h3 className="text-base font-medium">Theme & Layout</h3>

          {/* THEME GRID */}
          <div className="grid grid-cols-2 sm:grid-cols-2 gap-10">
            {themes.map((theme) => (
              <button
                key={theme.name}
                onClick={() => onChange(theme.name)}
                className={`relative rounded-xl border transition-all bg-background text-left
                  ${
                    value === theme.name
                      ? "border-purple-700 ring-2 ring-purple-500/40 shadow-lg"
                    : "border-border hover:shadow-md"
                }
              `}
            >
              <div className="p-4 space-y-3 min-h-[120px]">
                {/* PREVIEW */}
                <div
                  className={`rounded-lg ${theme.bgColor} p-6`}
                >
                  <div
                    className={`rounded-md ${theme.cardBg} p-4 text-center`}
                  >
                    <h4
                      className={`text-lg font-semibold ${theme.titleColor}`}
                    >
                      Title
                    </h4>

                    <p className="text-xs text-muted-foreground mt-1">
                      Body text{" "}
                      <span className="text-blue-500 underline">Link</span>
                    </p>

                    <div
                      className={`h-1 w-12 mx-auto mt-3 rounded ${theme.titleColor.replace(
                        "text-",
                        "bg-"
                      )}`}
                    />
                  </div>
                </div>

                {/* NAME */}
                <div>
                  <p className="text-sm font-medium">{theme.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {theme.fonts}
                  </p>
                </div>
              </div>

              {/* SELECTED CHECK */}
              {value === theme.name && (
                <div className="absolute top-3 right-3 bg-purple-700 rounded-full p-1">
                  <Check className="h-3 w-3 text-white" />
                </div>
              )}
            </button>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
