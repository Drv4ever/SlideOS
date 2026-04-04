import cors from "cors";
import express from "express";

const app = express();

app.use(
  cors({
    origin: ["http://localhost:5173", "https://slide-os.vercel.app"],
    credentials: true,
  }),
);

app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

export default app;
