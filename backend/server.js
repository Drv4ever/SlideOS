import dotenv from "dotenv";
import app from "./app.js";
import generateRoutes from "./src/routes/generate.route.js"

import express from 'express';


dotenv.config();

app.use("/api/generate",generateRoutes);

const PORT = process.env.PORT || 5000;

app.listen(PORT,()=>{
    console.log("Server running at localhost:5000");
})

// recive data from the backend 
// validate the input 
// return fake json data for the presentation JSON
// then plug into ai 



