import { useState } from "react";
import { useLocation } from "react-router-dom";

export default function PresentationPreview(){
        const {state} = useLocation();
        console.log(state);
        if (!state){
            return <p>no presentation data yet</p>;
        }
        return(
            <div className="max-w-4xl mx-auto p-6">
            <h1 className="text-3xl font-bold mb-6">
              {state.data.title}
            </h1>
      
            {state.data.slides.map((slide) => (
              <div key={slide.slideNumber} className="mb-6 p-4 border rounded-lg">
                <h2 className="text-xl font-semibold mb-2">
                  {slide.heading}
                </h2>
                <ul className="list-disc pl-5">
                  {slide.content.map((point, i) => (
                    <li key={i}>{point}</li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        );
}