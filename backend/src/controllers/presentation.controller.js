import Presentation from "../../models/presentation.js";

export const createPresentation = async (req,res)=>{
   try{
    const { title, prompt, theme, slidesCount, content } = req.body;
    if (!content) {
      return res
        .status(400)
        .json({ success: false, message: "content is required" });
    }

    const newPresentation = new Presentation({
        userId: req.user.id,   // takign user from verified user
        title: title || "Untitled Presentation",
        prompt,
        theme,
        slidesCount,
        content
    });
   const savedPresentation = await newPresentation.save();
   res.status(201).json({ success: true, data: savedPresentation });
   }catch(err){
     res.status(500).json({success:false, message : err.message});
   }
};


export const getMyPresentations = async(req,res)=>{
   try{
    const currentPresentation = await Presentation.find({userId: req.user.id})
    .select('title theme slidesCount updatedAt') 
    .sort({ updatedAt: -1 });
    res.status(200).json({ success: true, data: currentPresentation });
   }catch(err){
    res.status(400).json({ success: false, message: err.message});

   }


};

export const getPresentationById = async (req, res) => {
  try {
    const presentation = await Presentation.findById(req.params.id);
    if (!presentation) {
      return res
        .status(404)
        .json({ success: false, message: "Presentation not found" });
    }

    if (presentation.userId.toString() !== req.user.id) {
      return res.status(403).json({ success: false, message: "Forbidden" });
    }

    return res.status(200).json({ success: true, data: presentation });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};
