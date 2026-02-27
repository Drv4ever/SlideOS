import dotenv from "dotenv";

import mongoose from "mongoose";
dotenv.config(); 

import app from "./app.js";
import generateRoutes from "./src/routes/generate.route.js";
import authRoutes from "./src/routes/auth.route.js";
import presentationRoutes from"./src/routes/presentation.route.js"
// 2. This is the correct way to apply routes to the imported app instance
app.use("/api/generate", generateRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/presentations",presentationRoutes);


const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
    // Good practice to check if the key is actually loaded
    console.log("GEMINI KEY LOADED:", process.env.GEMINI_API_KEY ? "YES" : "NO");
});



mongoose.connect(process.env.MONGO_URI || "mongodb://127.0.0.1:27017/slideOS")
  .then(() => console.log(' MongoDB Connected'))
  .catch(err => console.error('❌ MongoDB connection error:', err));




// recive data from the backend 
// validate the input         
// return fake json data for the presentation JSON
// then plug into ai 
