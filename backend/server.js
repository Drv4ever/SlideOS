import dotenv from "dotenv";
// 1. Dotenv MUST be the very first thing called
dotenv.config(); 

import app from "./app.js";
import generateRoutes from "./src/routes/generate.route.js";

// 2. This is the correct way to apply routes to the imported app instance
app.use("/api/generate", generateRoutes);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
    // Good practice to check if the key is actually loaded
    console.log("GEMINI KEY LOADED:", process.env.GEMINI_API_KEY ? "YES" : "NO");
});

// recive data from the backend 
// validate the input         
// return fake json data for the presentation JSON
// then plug into ai 
