import React, { useState } from 'react';
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
      borderColor: "border-blue-500"
    },
    {
      name: "Noir",
      fonts: "Inter / Inter",
      bgColor: "bg-blue-400",
      cardBg: "bg-slate-900",
      titleColor: "text-blue-400",
      borderColor: "border-blue-400"
    },
    {
      name: "Cornflower",
      fonts: "Poppins / Source Sans Pro",
      bgColor: "bg-purple-600",
      cardBg: "bg-white",
      titleColor: "text-purple-600",
      borderColor: "border-purple-600"
    },
    {
      name: "Indigo",
      fonts: "Poppins / Source Sans Pro",
      bgColor: "bg-blue-400",
      cardBg: "bg-slate-800",
      titleColor: "text-blue-300",
      borderColor: "border-blue-400"
    },
    {
      name: "Orbit",
      fonts: "Space Grotesk / IBM Plex Sans",
      bgColor: "bg-indigo-700",
      cardBg: "bg-white",
      titleColor: "text-indigo-700",
      borderColor: "border-indigo-700"
    },
    {
      name: "Cosmos",
      fonts: "Space Grotesk / IBM Plex Sans",
      bgColor: "bg-blue-400",
      cardBg: "bg-slate-900",
      titleColor: "text-blue-300",
      borderColor: "border-blue-400"
    },

  ];

  return (
    <Card className="w-full bg-card border-border">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-semibold text-foreground">
            Customize Theme
          </CardTitle>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Theme & Layout Header */}
        <div className="flex items-center justify-between">
          <h3 className="text-base font-medium text-foreground">Theme & Layout</h3>
          <Button variant="link" className="h-[30px] px-6 rounded-lg bg-primary text-primary-foreground text-xs font-semibold hover:bg-primary/90 transition min-w-[100px] border-none">
            More Themes
          </Button>
        </div>

        {/* Theme Grid */}
        <div className="grid grid-cols-3 gap-4">
          {themes.map((theme) => (
            <button
              key={theme.name}
              onClick={() => onChange(theme.name)}
              // Reduce width, add min-w-[0] for flex/grid shrink, prevent border overlap by reducing px, and add box-border
              className={`relative rounded-lg border-2 transition-all hover:shadow-md box-border w-full max-w-[210px] min-w-0 flex flex-col items-stretch 
                ${value === theme.name
                  ? "border-2 border-purple-800 ring-2 ring-purple-500/40 shadow-lg"
                  : "border border-border"
                }
              `}
              style={{
                padding: '14px', // Reduce from p-4 (16px) to 14px, to offset border size on select
                margin: '0 auto',
              }}
            >
              {/* Theme Preview */}
              <div className={`rounded-lg ${theme.bgColor} p-6 mb-3 relative`}>
                <div className={`rounded-md ${theme.cardBg} p-4 text-center`}>
                  <h4 className={`text-lg font-semibold mb-1 ${theme.titleColor}`}>
                    Title
                  </h4>
                  <p className={`text-xs mb-2 ${theme.cardBg === 'bg-white' ? 'text-gray-600' : 'text-gray-300'}`}>
                    Body text <span className="text-blue-500 underline">Link</span>
                  </p>
                  <div className={`h-1 w-12 mx-auto rounded ${theme.titleColor.replace('text-', 'bg-')}`}></div>
                </div>
              </div>

              {/* Theme Name and Fonts */}
              <div className="text-left">
                <div className="font-medium text-sm text-gray-900">{theme.name}</div>
                <div className="text-xs text-gray-500">{theme.fonts}</div>
              </div>

              {/* Selected Indicator */}
              {value === theme.name && (
                <div className="absolute top-2 right-2 bg-purple-800 rounded-full p-1">
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