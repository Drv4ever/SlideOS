import mongoose from "mongoose";

const presentationSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    prompt: {
      type: String,
      default: "",
    },
    theme: {
      type: String,
      default: "cornflower",
    },
    slidesCount: {
      type: Number,
      default: 0,
    },
    content: {
      type: mongoose.Schema.Types.Mixed,                    //    
      required: true,
    },
  },
  { timestamps: true }
);

presentationSchema.index({ userId: 1, updatedAt: -1 });

const Presentation = mongoose.model("Presentation", presentationSchema);
export default Presentation;


// {
//   "slides": [...],
//   "editorSlides": [...],
//   "slideNotes": [...],
//   "textAmount": "detailed"
// }