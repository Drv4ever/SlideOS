export const validateGenerateInput = (data) => {
   if (!data) {
     return "Request body is missing";
   }
 
   const {
     prompt,
     slides,
     textAmount,
     theme,
   } = data;
 
   // Prompt validation
   if (!prompt || prompt.trim() === "") {
     return "Prompt is required";
   }
 
   // Slides validation
   if (!slides || slides < 1 || slides > 20) {
     return "Slides must be between 1 and 20";
   }
 
   // Text amount validation
   if (!["minimal", "concise", "detailed", "extensive"].includes(textAmount)) {
     return "Invalid text amount";
   }
 
   // Theme validation
   if (!theme) {
     return "Theme is required";
   }
 
   return null; // ✅ means VALID
 };
 