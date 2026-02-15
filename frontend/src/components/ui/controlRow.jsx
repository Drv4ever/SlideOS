import React, { useState } from "react"; //
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export function Controls({slides,onSlideChange}) {
  // 1. Initialize state with the default value

  const slideOptions = [4, 5, 6, 7, 8, 10, 12];

 

  return (
    <div className="bg-gray-400/30 p-6 rounded-2xl flex flex-row gap-6 items-center justify-between">
      {/* 2. Bind the value and change handler to the Select component */}
      <Select value={slides.toString()} onValueChange={(value)=>onSlideChange(Number(value)) }>
        <SelectTrigger className="h-[44px] w-[140px] bg-white border-none rounded-lg text-sm font-medium shadow-sm">
          <SelectValue placeholder="No. of slides" />
        </SelectTrigger>
        <SelectContent className="min-w-[120px] rounded-xl border-none shadow-2xl">
          {slideOptions.map((num) => (
            <SelectItem 
              key={num} 
              value={num.toString()} 
              className="text-sm py-2 cursor-pointer"
            >
              {num} {num === 1 ? "slide" : "slides"}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {/* <button
        onClick={handleGenerate}
        className="h-[30px] px-6 rounded-lg bg-primary text-primary-foreground text-xs font-semibold hover:bg-primary/90 transition min-w-[100px] border-none"
      >
        Generate →
      </button> */}
    </div>
  );
}