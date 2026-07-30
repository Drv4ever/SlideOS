import { generatePresentation } from "../../src/controllers/generate.controller.js";
import { generateWithGroq } from "../../src/services/groq.service.js";
import { fakeAIGenerate } from "../../src/utils/fakeaigeneration.js";
import { fetchSlideImages } from "../../src/services/image.service.js";

// Mock dependencies
jest.mock("../../src/services/groq.service.js");
jest.mock("../../src/utils/fakeaigeneration.js");
jest.mock("../../src/services/image.service.js");

describe("generatePresentation controller", () => {
  let mockReq;
  let mockRes;

  beforeEach(() => {
    jest.clearAllMocks();

    mockReq = {
      body: {
        prompt: "Test Presentation",
        slides: 5,
        textAmount: "detailed",
        theme: "cornflower",
        tone: "professional",
        audience: "general",
        scenario: "educational",
      },
    };

    mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
    };
  });

  describe("successful generation", () => {
    test("should return 200 with presentation data when Groq succeeds", async () => {
      const mockPresentation = {
        title: "Test Presentation",
        theme: "cornflower",
        slides: [
          { slideNumber: 1, heading: "Intro", content: ["Point 1"], imageKeyword: "intro image", layout: "title-slide", image: { url: "https://example.com/img1.jpg" } },
          { slideNumber: 2, heading: "Details", content: ["Point 2"], imageKeyword: "details image", layout: "content-only", image: { url: "https://example.com/img2.jpg" } },
        ],
      };

      generateWithGroq.mockResolvedValue(mockPresentation);
      fetchSlideImages.mockResolvedValue([
        { url: "https://example.com/img1.jpg", thumb: "https://example.com/img1-thumb.jpg", alt: "Intro image", attribution: { name: "Test", link: "https://unsplash.com/@test" } },
        { url: "https://example.com/img2.jpg", thumb: "https://example.com/img2-thumb.jpg", alt: "Details image", attribution: { name: "Test", link: "https://unsplash.com/@test" } },
      ]);

      await generatePresentation(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: true,
        data: {
          title: "Test Presentation",
          theme: "cornflower",
          slides: expect.arrayContaining([
            expect.objectContaining({
              slideNumber: 1,
              heading: "Intro",
              image: { url: "https://example.com/img1.jpg", thumb: "https://example.com/img1-thumb.jpg", alt: "Intro image", attribution: { name: "Test", link: "https://unsplash.com/@test" } },
            }),
          ]),
        },
      });
    });

    test("should fall back to fake AI when Groq fails", async () => {
      const mockFakePresentation = {
        title: "Test Presentation",
        theme: "cornflower",
        slides: [
          { slideNumber: 1, heading: "Intro", content: ["Point 1"], imageKeyword: "intro", layout: "title-slide" },
        ],
      };

      generateWithGroq.mockRejectedValue(new Error("Groq API error"));
      fakeAIGenerate.mockReturnValue(mockFakePresentation);
      fetchSlideImages.mockResolvedValue([null]);

      await generatePresentation(mockReq, mockRes);

      expect(fakeAIGenerate).toHaveBeenCalledWith(mockReq.body);
      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: true,
        data: {
          title: "Test Presentation",
          theme: "cornflower",
          slides: expect.arrayContaining([
            expect.objectContaining({
              slideNumber: 1,
              image: null,
            }),
          ]),
        },
      });
    });

    test("should attach image data to each slide", async () => {
      const mockPresentation = {
        title: "Test",
        theme: "cornflower",
        slides: [
          { slideNumber: 1, heading: "Slide 1", content: ["A"], imageKeyword: "keyword1", layout: "title-slide" },
          { slideNumber: 2, heading: "Slide 2", content: ["B"], imageKeyword: "keyword2", layout: "content-only" },
        ],
      };

      generateWithGroq.mockResolvedValue(mockPresentation);
      fetchSlideImages.mockResolvedValue([
        { url: "img1.jpg", thumb: "thumb1.jpg", alt: "Image 1", attribution: { name: "User1", link: "link1" } },
        null,
      ]);

      await generatePresentation(mockReq, mockRes);

      expect(mockRes.json).toHaveBeenCalledWith({
        success: true,
        data: {
          title: "Test",
          theme: "cornflower",
          slides: [
            expect.objectContaining({ slideNumber: 1, image: { url: "img1.jpg", thumb: "thumb1.jpg", alt: "Image 1", attribution: { name: "User1", link: "link1" } } }),
            expect.objectContaining({ slideNumber: 2, image: null }),
          ],
        },
      });
    });
  });

  describe("validation errors", () => {
    test("should return 400 when prompt is missing", async () => {
      mockReq.body = { slides: 5, textAmount: "detailed", theme: "cornflower" };

      await generatePresentation(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: false,
        error: "Prompt is required",
      });
    });

    test("should return 400 when slides is out of range", async () => {
      mockReq.body = { prompt: "Test", slides: 0, textAmount: "detailed", theme: "cornflower" };

      await generatePresentation(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: false,
        error: "Slides must be between 1 and 20",
      });
    });

    test("should return 400 when textAmount is invalid", async () => {
      mockReq.body = { prompt: "Test", slides: 5, textAmount: "invalid", theme: "cornflower" };

      await generatePresentation(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: false,
        error: "Invalid text amount",
      });
    });

    test("should return 400 when theme is missing", async () => {
      mockReq.body = { prompt: "Test", slides: 5, textAmount: "detailed" };

      await generatePresentation(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: false,
        error: "Theme is required",
      });
    });
  });

  describe("error handling", () => {
    test("should return 500 when both Groq and fake AI fail", async () => {
      generateWithGroq.mockRejectedValue(new Error("Groq API error"));
      fakeAIGenerate.mockImplementation(() => {
        throw new Error("Fake AI also failed");
      });

      await generatePresentation(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(500);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: false,
        error: "An unexpected error occurred.",
        details: expect.any(String),
      });
    });
  });
});
