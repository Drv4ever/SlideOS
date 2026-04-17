import Presentation from "../../models/presentation.js";

export const createPresentation = async (req, res) => {
  try {
    const { title, prompt, theme, slidesCount, content } = req.body;
    if (!content) {
      return res
        .status(400)
        .json({ success: false, message: "content is required" });
    }

    const newPresentation = new Presentation({
      userId: req.user.id,
      title: title || "Untitled Presentation",
      prompt,
      theme,
      slidesCount,
      content,
    });

    const savedPresentation = await newPresentation.save();
    return res.status(201).json({ success: true, data: savedPresentation });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

export const getMyPresentations = async (req, res) => {
  try {
    const userPresentations = await Presentation.find({ userId: req.user.id })
      .select("title theme slidesCount updatedAt")
      .sort({ updatedAt: -1 });
       // based on most resent updates

    return res.status(200).json({ success: true, data: userPresentations });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

export const getMyPresentationById = async (req, res) => {
  try {
    const currentPresentation = await Presentation.findById(req.params.id);
    if (!currentPresentation) {
      return res
        .status(404)
        .json({ success: false, message: "Presentation not found" });
    }

    if (currentPresentation.userId.toString() !== req.user.id) {
      return res.status(403).json({ success: false, message: "Not authorized" });
    }

    return res.status(200).json({ success: true, data: currentPresentation });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

export const updatePresentation = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, content, theme, slidesCount } = req.body;

    const presentation = await Presentation.findById(id);
    if (!presentation) {
      return res
        .status(404)
        .json({ success: false, message: "Presentation not found" });
    }

    if (presentation.userId.toString() !== req.user.id) {
      return res.status(403).json({ success: false, message: "Not authorized" });
    }

    if (title) presentation.title = title;
    if (content) presentation.content = content;
    if (theme) presentation.theme = theme;
    if (typeof slidesCount === "number") presentation.slidesCount = slidesCount;
    if (content) presentation.markModified("content");

    const updatedDoc = await presentation.save();
    return res.status(200).json({ success: true, data: updatedDoc });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const deletePresentation = async (req, res) => {
  try {
    const { id } = req.params;

    const presentation = await Presentation.findById(id);
    if (!presentation) {
      return res
        .status(404)
        .json({ success: false, message: "Presentation not found" });
    }

    if (presentation.userId.toString() !== req.user.id) {
      return res.status(403).json({ success: false, message: "Not authorized" });
    }

    await presentation.deleteOne();
    
    return res.status(200).json({
      success: true,
      message: "Presentation deleted successfully",
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};
